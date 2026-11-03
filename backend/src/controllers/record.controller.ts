import { Request, Response } from 'express';
import { createMedicalRecordSchema } from '../validators/record.validator';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class MedicalRecordController {
  /**
   * GET /api/v1/medical-records
   */
  public async getAllRecords(req: Request, res: Response) {
    try {
      const patientId = req.query.patientId as string;
      const doctorId = req.query.doctorId as string;

      let list = store.medicalRecords.map((rec) => {
        const patient = store.patients.find((p) => p.id === rec.patientId);
        const doctor = store.doctors.find((d) => d.id === rec.doctorId);
        const docUser = doctor ? store.users.find((u) => u.id === doctor.userId) : null;

        return {
          ...rec,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
          patientCode: patient?.patientCode,
          doctorName: docUser ? `Dr. ${docUser.firstName} ${docUser.lastName}` : 'Dr. Attending',
        };
      });

      if (patientId) {
        list = list.filter((r) => r.patientId === patientId);
      }
      if (doctorId) {
        list = list.filter((r) => r.doctorId === doctorId);
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
   * GET /api/v1/medical-records/patient/:patientId
   */
  public async getPatientRecords(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const patient = store.patients.find((p) => p.id === patientId || p.patientCode === patientId);

      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      const records = store.medicalRecords
        .filter((r) => r.patientId === patient.id)
        .map((rec) => {
          const doctor = store.doctors.find((d) => d.id === rec.doctorId);
          const docUser = doctor ? store.users.find((u) => u.id === doctor.userId) : null;
          return {
            ...rec,
            doctorName: docUser ? `Dr. ${docUser.firstName} ${docUser.lastName}` : 'Dr. Attending',
            specialization: doctor?.specialization,
          };
        });

      return res.status(200).json({
        success: true,
        patient: {
          name: `${patient.firstName} ${patient.lastName}`,
          patientCode: patient.patientCode,
          bloodGroup: patient.bloodGroup,
          allergies: patient.allergies,
        },
        records,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/medical-records
   */
  public async createRecord(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = createMedicalRecordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validation.error.format() },
        });
      }

      const data = validation.data;
      const newRecord = {
        id: `emr-${Date.now()}`,
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentId: data.appointmentId || null,
        diagnosis: data.diagnosis,
        symptoms: data.symptoms || null,
        vitalSignsJson: data.vitalSigns ? JSON.stringify(data.vitalSigns) : null,
        treatmentPlan: data.treatmentPlan || null,
        notes: data.notes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.medicalRecords.unshift(newRecord);

      // If linked appointment exists, mark appointment COMPLETED automatically
      if (data.appointmentId) {
        const app = store.appointments.find((a) => a.id === data.appointmentId);
        if (app) app.status = 'COMPLETED';
      }

      store.logAudit(req.user?.userId || null, 'CREATE', 'MedicalRecord', newRecord.id, {
        diagnosis: newRecord.diagnosis,
        patientId: newRecord.patientId,
      });

      return res.status(201).json({
        success: true,
        message: 'Medical Record saved successfully',
        data: newRecord,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const medicalRecordController = new MedicalRecordController();
