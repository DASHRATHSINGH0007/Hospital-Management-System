import { Request, Response } from 'express';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class DoctorController {
  /**
   * GET /api/v1/doctors
   */
  public async getAllDoctors(req: Request, res: Response) {
    try {
      const departmentId = req.query.departmentId as string;
      const specialization = (req.query.specialization as string)?.toLowerCase();

      let list = store.doctors.map((doc) => {
        const user = store.users.find((u) => u.id === doc.userId);
        const dept = store.departments.find((d) => d.id === doc.departmentId);
        return {
          ...doc,
          name: user ? `Dr. ${user.firstName} ${user.lastName}` : 'Dr. Attending',
          email: user?.email,
          phone: user?.phone,
          departmentName: dept?.name || 'General Medicine',
        };
      });

      if (departmentId) {
        list = list.filter((d) => d.departmentId === departmentId);
      }
      if (specialization) {
        list = list.filter((d) => d.specialization.toLowerCase().includes(specialization));
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
   * GET /api/v1/doctors/:id
   */
  public async getDoctorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doc = store.doctors.find((d) => d.id === id || d.userId === id);

      if (!doc) {
        return res.status(404).json({ success: false, message: 'Doctor profile not found' });
      }

      const user = store.users.find((u) => u.id === doc.userId);
      const dept = store.departments.find((d) => d.id === doc.departmentId);
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = store.appointments.filter(
        (a) => a.doctorId === doc.id && a.appointmentDate === today
      );

      return res.status(200).json({
        success: true,
        data: {
          ...doc,
          name: user ? `Dr. ${user.firstName} ${user.lastName}` : 'Dr. Attending',
          email: user?.email,
          phone: user?.phone,
          department: dept,
          todayAppointments,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const doctorController = new DoctorController();
