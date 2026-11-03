import { Request, Response } from 'express';
import { store } from '../services/store.service';

export class StaffController {
  /**
   * GET /api/v1/staff
   */
  public async getAllStaff(req: Request, res: Response) {
    try {
      // Return staff accounts (Super Admin, Hospital Admin, Receptionist, Nurse, Pharmacist, Lab Tech)
      const staffUsers = store.users
        .filter((u) => u.role !== 'PATIENT' && u.role !== 'DOCTOR')
        .map((u) => {
          const shiftMap: Record<string, string> = {
            RECEPTIONIST: '08:00 AM - 04:00 PM (Morning Rota)',
            NURSE: '07:00 AM - 03:00 PM (Day Shift)',
            PHARMACIST: '09:00 AM - 05:00 PM (Dispensary Core)',
            LAB_TECHNICIAN: '08:30 AM - 04:30 PM (Diagnostic Rota)',
            HOSPITAL_ADMIN: '09:00 AM - 06:00 PM (Executive Admin)',
            SUPER_ADMIN: '24/7 (System Governance)',
          };

          return {
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            phone: u.phone,
            role: u.role,
            shiftTiming: shiftMap[u.role] || 'Standard Duty',
            department: 'Hospital Core Operations',
            status: u.isActive ? 'Active Duty' : 'Off Duty',
          };
        });

      return res.status(200).json({
        success: true,
        count: staffUsers.length,
        data: staffUsers,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const staffController = new StaffController();
