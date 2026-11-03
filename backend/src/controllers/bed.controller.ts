import { Request, Response } from 'express';
import { admitPatientSchema, dischargePatientSchema, updateBedStatusSchema } from '../validators/bed.validator';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class BedController {
  /**
   * GET /api/v1/beds
   */
  public async getAllBeds(req: Request, res: Response) {
    try {
      const status = req.query.status as string;
      const bedType = req.query.bedType as string;

      let list = store.beds.map((bed) => {
        const ward = store.wards.find((w) => w.id === bed.wardId);
        const dept = ward ? store.departments.find((d) => d.id === ward.departmentId) : null;
        
        // Find current admission if occupied
        const activeAdmission = store.admissions.find(
          (a) => a.bedId === bed.id && a.status === 'ADMITTED'
        );
        const admittedPatient = activeAdmission
          ? store.patients.find((p) => p.id === activeAdmission.patientId)
          : null;

        return {
          ...bed,
          wardName: ward?.name || 'General Ward',
          departmentName: dept?.name || 'General Medicine',
          activeAdmission: activeAdmission
            ? {
                admissionId: activeAdmission.id,
                admissionDate: activeAdmission.admissionDate,
                patientName: admittedPatient ? `${admittedPatient.firstName} ${admittedPatient.lastName}` : 'Unknown',
                patientCode: admittedPatient?.patientCode,
              }
            : null,
        };
      });

      if (status) {
        list = list.filter((b) => b.status === status);
      }
      if (bedType) {
        list = list.filter((b) => b.bedType === bedType);
      }

      const totalBeds = store.beds.length;
      const occupiedBeds = store.beds.filter((b) => b.status === 'OCCUPIED').length;
      const availableBeds = store.beds.filter((b) => b.status === 'AVAILABLE').length;

      return res.status(200).json({
        success: true,
        stats: {
          total: totalBeds,
          occupied: occupiedBeds,
          available: availableBeds,
          occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
        },
        data: list,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/beds/admissions
   */
  public async admitPatient(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = admitPatientSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validation.error.format() },
        });
      }

      const { patientId, bedId, admittingDoctorId, diagnosis } = validation.data;

      const bed = store.beds.find((b) => b.id === bedId);
      if (!bed) {
        return res.status(404).json({ success: false, message: 'Bed not found' });
      }
      if (bed.status !== 'AVAILABLE') {
        return res.status(409).json({
          success: false,
          message: `Cannot admit: Bed '${bed.bedNumber}' is currently ${bed.status}.`,
        });
      }

      const patient = store.patients.find((p) => p.id === patientId);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      const newAdmission = {
        id: `adm-${Date.now()}`,
        patientId,
        bedId,
        admittingDoctorId,
        admissionDate: new Date().toISOString(),
        dischargeDate: null,
        status: 'ADMITTED',
        diagnosis,
        dischargeSummary: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.admissions.unshift(newAdmission);
      bed.status = 'OCCUPIED';

      store.logAudit(req.user?.userId || null, 'ADMIT', 'Bed', bed.id, {
        bedNumber: bed.bedNumber,
        patientCode: patient.patientCode,
      });

      return res.status(201).json({
        success: true,
        message: `Patient ${patient.firstName} ${patient.lastName} admitted to ${bed.bedNumber}`,
        data: newAdmission,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/beds/admissions/:id/discharge
   */
  public async dischargePatient(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const admission = store.admissions.find((a) => a.id === id);

      if (!admission) {
        return res.status(404).json({ success: false, message: 'Admission not found' });
      }

      const validation = dischargePatientSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validation.error.format() },
        });
      }

      admission.status = 'DISCHARGED';
      admission.dischargeDate = new Date().toISOString();
      admission.dischargeSummary = validation.data.dischargeSummary;
      admission.updatedAt = new Date().toISOString();

      // Free up bed
      const bed = store.beds.find((b) => b.id === admission.bedId);
      if (bed) {
        bed.status = 'AVAILABLE';
      }

      store.logAudit(req.user?.userId || null, 'DISCHARGE', 'Admission', admission.id, {
        bedNumber: bed?.bedNumber,
      });

      return res.status(200).json({
        success: true,
        message: `Patient discharged. Bed ${bed?.bedNumber} is now Available.`,
        data: admission,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const bedController = new BedController();
