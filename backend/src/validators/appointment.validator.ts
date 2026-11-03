import { z } from 'zod';

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  appointmentDate: z.string().min(1, 'Appointment date is required (YYYY-MM-DD)'),
  timeSlot: z.string().min(1, 'Time slot is required (e.g. 10:00 AM)'),
  type: z.enum([
    'GENERAL_CHECKUP',
    'SPECIALIST_CONSULTATION',
    'FOLLOW_UP',
    'EMERGENCY',
  ]).default('GENERAL_CHECKUP'),
  reason: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    'SCHEDULED',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ]),
});
