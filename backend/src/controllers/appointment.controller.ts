import { Request, Response } from 'express';
import { createAppointmentSchema, updateAppointmentStatusSchema } from '../validators/appointment.validator';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AppointmentController {
  /**
   * GET /api/v1/appointments
   */
  public async getAllAppointments(req: Request, res: Response) {
    try {
      const doctorId = req.query.doctorId as string;
      const patientId = req.query.patientId as string;
      const date = req.query.date as string;
      const status = req.query.status as string;

      let list = store.appointments.map((a) => {
        const patient = store.patients.find((p) => p.id === a.patientId);
        const doctor = store.doctors.find((d) => d.id === a.doctorId);
        const doctorUser = doctor ? store.users.find((u) => u.id === doctor.userId) : null;

        return {
          ...a,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
          patientCode: patient?.patientCode,
          patientBlood: patient?.bloodGroup,
          patientPhone: patient?.phone,
          doctorName: doctorUser ? `Dr. ${doctorUser.firstName} ${doctorUser.lastName}` : 'Dr. Attending',
          doctorSpecialization: doctor?.specialization,
        };
      });

      if (doctorId) {
        list = list.filter((a) => a.doctorId === doctorId);
      }
      if (patientId) {
        list = list.filter((a) => a.patientId === patientId);
      }
      if (date) {
        list = list.filter((a) => a.appointmentDate === date);
      }
      if (status) {
        list = list.filter((a) => a.status === status);
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
   * POST /api/v1/appointments
   * Features: Automatic conflict prevention
   */
  public async createAppointment(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = createAppointmentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validation.error.format() },
        });
      }

      const { patientId, doctorId, appointmentDate, timeSlot, type, reason } = validation.data;

      // 1. Verify Patient and Doctor exist
      const patient = store.patients.find((p) => p.id === patientId);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      const doctor = store.doctors.find((d) => d.id === doctorId);
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }

      // 2. SCHEDULING CONFLICT DETECTION
      // Check if this doctor is already booked at this exact date & timeSlot
      const hasConflict = store.appointments.some(
        (a) =>
          a.doctorId === doctorId &&
          a.appointmentDate === appointmentDate &&
          a.timeSlot.toLowerCase().trim() === timeSlot.toLowerCase().trim() &&
          a.status !== 'CANCELLED'
      );

      if (hasConflict) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'SCHEDULING_CONFLICT',
            message: `Conflict: This doctor is already booked on ${appointmentDate} at ${timeSlot}. Please select an alternate slot.`,
          },
        });
      }

      const newAppointment = {
        id: `apt-${Date.now()}`,
        patientId,
        doctorId,
        appointmentDate,
        timeSlot,
        type: type || 'GENERAL_CHECKUP',
        status: 'CONFIRMED',
        reason: reason || 'Clinical Consultation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.appointments.unshift(newAppointment);

      // Create notification for patient user if linked
      if (patient.userId) {
        store.notifications.push({
          id: `notif-${Date.now()}`,
          userId: patient.userId,
          title: 'Appointment Scheduled',
          message: `Your consultation with the doctor is confirmed for ${appointmentDate} at ${timeSlot}.`,
          type: 'APPOINTMENT',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }

      store.logAudit(req.user?.userId || null, 'CREATE', 'Appointment', newAppointment.id, {
        patient: `${patient.firstName} ${patient.lastName}`,
        slot: `${appointmentDate} ${timeSlot}`,
      });

      return res.status(201).json({
        success: true,
        message: 'Appointment successfully confirmed and booked',
        data: newAppointment,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PATCH /api/v1/appointments/:id/status
   */
  public async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const app = store.appointments.find((a) => a.id === id);

      if (!app) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const validation = updateAppointmentStatusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validation.error.format() },
        });
      }

      const previousStatus = app.status;
      app.status = validation.data.status;
      app.updatedAt = new Date().toISOString();

      store.logAudit(req.user?.userId || null, 'STATUS_UPDATE', 'Appointment', id, {
        from: previousStatus,
        to: app.status,
      });

      return res.status(200).json({
        success: true,
        message: `Appointment status updated to ${app.status}`,
        data: app,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/v1/appointments/:id
   */
  public async deleteAppointment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const index = store.appointments.findIndex((a) => a.id === id);

      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      store.appointments.splice(index, 1);
      store.logAudit(req.user?.userId || null, 'DELETE', 'Appointment', id, { id });

      return res.status(200).json({
        success: true,
        message: 'Appointment record removed',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const appointmentController = new AppointmentController();
