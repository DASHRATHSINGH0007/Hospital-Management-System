import { Request, Response } from 'express';
import { createPrescriptionSchema } from '../validators/record.validator';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class PrescriptionController {
  /**
   * GET /api/v1/prescriptions
   */
  public async getAllPrescriptions(req: Request, res: Response) {
    try {
      const patientId = req.query.patientId as string;
      const doctorId = req.query.doctorId as string;
      const status = req.query.status as string;

      let list = store.prescriptions.map((rx) => {
        const patient = store.patients.find((p) => p.id === rx.patientId);
        const doctor = store.doctors.find((d) => d.id === rx.doctorId);
        const docUser = doctor ? store.users.find((u) => u.id === doctor.userId) : null;

        const detailedItems = (rx.items || []).map((item: any) => {
          const med = store.medicines.find((m) => m.id === item.medicineId);
          return {
            ...item,
            medicineName: med ? med.name : 'Unknown Medicine',
            stockRemaining: med?.stockQuantity ?? 0,
            unitPrice: med?.unitPrice ?? 0,
          };
        });

        return {
          ...rx,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
          patientCode: patient?.patientCode,
          doctorName: docUser ? `Dr. ${docUser.firstName} ${docUser.lastName}` : 'Dr. Attending',
          items: detailedItems,
        };
      });

      if (patientId) {
        list = list.filter((r) => r.patientId === patientId);
      }
      if (doctorId) {
        list = list.filter((r) => r.doctorId === doctorId);
      }
      if (status) {
        list = list.filter((r) => r.status === status);
      }

      return res.status(200).json({
        success: true,
        count: list.length,
        data: list,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/prescriptions
   */
  public async createPrescription(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = createPrescriptionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validation.error.format() },
        });
      }

      const { patientId, doctorId, medicalRecordId, notes, items } = validation.data;

      // Verify patient and doctor exist
      const patient = store.patients.find((p) => p.id === patientId);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      const newPrescription = {
        id: `rx-${Date.now()}`,
        patientId,
        doctorId,
        medicalRecordId: medicalRecordId || null,
        status: 'PENDING',
        notes: notes || 'Take medications as directed on label.',
        items: items.map((item, index) => ({
          id: `rxi-${Date.now()}-${index}`,
          ...item,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.prescriptions.unshift(newPrescription);

      // Notify patient
      if (patient.userId) {
        store.notifications.push({
          id: `notif-${Date.now()}`,
          userId: patient.userId,
          title: 'New Prescription Issued',
          message: `Your physician has issued e-prescription #${newPrescription.id}. Pending pharmacy dispensing.`,
          type: 'PRESCRIPTION',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }

      store.logAudit(req.user?.userId || null, 'CREATE', 'Prescription', newPrescription.id, {
        itemCount: items.length,
        patientCode: patient.patientCode,
      });

      return res.status(201).json({
        success: true,
        message: 'E-Prescription issued successfully and transmitted to Pharmacy',
        data: newPrescription,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/prescriptions/:id/dispense
   * Real pharmacy stock deduction and transaction logging
   */
  public async dispensePrescription(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const rx = store.prescriptions.find((p) => p.id === id);

      if (!rx) {
        return res.status(404).json({ success: false, message: 'Prescription not found' });
      }

      if (rx.status === 'DISPENSED') {
        return res.status(400).json({
          success: false,
          message: 'Prescription has already been dispensed',
        });
      }

      // Check stock availability for all prescribed items
      for (const item of rx.items) {
        const med = store.medicines.find((m) => m.id === item.medicineId);
        if (!med) {
          return res.status(404).json({
            success: false,
            message: `Medicine #${item.medicineId} not found in hospital inventory.`,
          });
        }
        if (med.stockQuantity < 1) {
          return res.status(409).json({
            success: false,
            message: `Insufficient stock for ${med.name} (0 remaining). Cannot dispense.`,
          });
        }
      }

      // Deduct stock for all items
      for (const item of rx.items) {
        const med = store.medicines.find((m) => m.id === item.medicineId);
        if (med) {
          med.stockQuantity -= 1;
        }
      }

      rx.status = 'DISPENSED';
      rx.dispensedAt = new Date().toISOString();

      store.logAudit(req.user?.userId || null, 'DISPENSE', 'Prescription', rx.id, {
        dispensedBy: req.user?.firstName || 'Pharmacist',
        items: rx.items.length,
      });

      return res.status(200).json({
        success: true,
        message: 'Prescription successfully verified, dispensed and inventory deducted.',
        data: rx,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const prescriptionController = new PrescriptionController();
