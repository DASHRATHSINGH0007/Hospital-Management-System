import { z } from 'zod';

export const admitPatientSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  bedId: z.string().min(1, 'Hospital Bed ID is required'),
  admittingDoctorId: z.string().min(1, 'Admitting Doctor ID is required'),
  diagnosis: z.string().min(2, 'Admitting diagnosis is required'),
});

export const dischargePatientSchema = z.object({
  dischargeSummary: z.string().min(2, 'Discharge summary is required'),
});

export const updateBedStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']),
});
