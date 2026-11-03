import { Request, Response } from 'express';
import { createPatientSchema, updatePatientSchema } from '../validators/patient.validator';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class PatientController {
  /**
   * GET /api/v1/patients
   */
  public async getAllPatients(req: Request, res: Response) {
    try {
      const search = (req.query.search as string)?.toLowerCase().trim();
      const bloodGroup = req.query.bloodGroup as string;
      const gender = req.query.gender as string;

      let list = [...store.patients];

      if (search) {
        list = list.filter(
          (p) =>
            p.firstName.toLowerCase().includes(search) ||
            p.lastName.toLowerCase().includes(search) ||
            p.patientCode.toLowerCase().includes(search) ||
            p.phone?.includes(search)
        );
      }

      if (bloodGroup) {
        list = list.filter((p) => p.bloodGroup === bloodGroup);
      }

      if (gender) {
        list = list.filter((p) => p.gender.toLowerCase() === gender.toLowerCase());
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
   * GET /api/v1/patients/:id
   */
  public async getPatientById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const patient = store.patients.find((p) => p.id === id || p.patientCode === id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: { code: 'PATIENT_NOT_FOUND', message: `No patient found with ID '${id}'` },
        });
      }

      // Attach linked history
      const patientAppointments = store.appointments.filter((a) => a.patientId === patient.id);
      const patientRecords = store.medicalRecords.filter((m) => m.patientId === patient.id);
      const patientPrescriptions = store.prescriptions.filter((p) => p.patientId === patient.id);
      const patientLabs = store.labReports.filter((l) => l.patientId === patient.id);
      const patientBills = store.bills.filter((b) => b.patientId === patient.id);

      return res.status(200).json({
        success: true,
        data: {
          ...patient,
          appointments: patientAppointments,
          medicalRecords: patientRecords,
          prescriptions: patientPrescriptions,
          labReports: patientLabs,
          bills: patientBills,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/patients
   */
  public async createPatient(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = createPatientSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validation.error.format() },
        });
      }

      const data = validation.data;
      const patientCode = `PAT-${Math.floor(10000 + Math.random() * 90000)}`;

      const newPatient = {
        id: `pat-${Date.now()}`,
        userId: null,
        patientCode,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        bloodGroup: data.bloodGroup || 'O+',
        phone: data.phone,
        address: data.address || 'Standard Address',
        emergencyContact: data.emergencyContact || 'None',
        allergies: data.allergies || 'None',
        medicalHistory: data.medicalHistory || 'None',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.patients.unshift(newPatient);

      store.logAudit(req.user?.userId || null, 'CREATE', 'Patient', newPatient.id, {
        patientCode: newPatient.patientCode,
        name: `${newPatient.firstName} ${newPatient.lastName}`,
      });

      return res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        data: newPatient,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PUT /api/v1/patients/:id
   */
  public async updatePatient(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const patient = store.patients.find((p) => p.id === id);

      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      const validation = updatePatientSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validation.error.format() },
        });
      }

      Object.assign(patient, validation.data, { updatedAt: new Date().toISOString() });

      store.logAudit(req.user?.userId || null, 'UPDATE', 'Patient', patient.id, validation.data);

      return res.status(200).json({
        success: true,
        message: 'Patient profile updated',
        data: patient,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/v1/patients/:id
   */
  public async deletePatient(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const index = store.patients.findIndex((p) => p.id === id);

      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      const removed = store.patients.splice(index, 1)[0];
      store.logAudit(req.user?.userId || null, 'DELETE', 'Patient', id, { name: `${removed.firstName} ${removed.lastName}` });

      return res.status(200).json({
        success: true,
        message: 'Patient record removed',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const patientController = new PatientController();
