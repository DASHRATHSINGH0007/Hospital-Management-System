import { z } from 'zod';

export const createMedicalRecordSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  appointmentId: z.string().optional(),
  diagnosis: z.string().min(2, 'Diagnosis is required'),
  symptoms: z.string().optional(),
  vitalSigns: z.object({
    bp: z.string().optional(),
    pulse: z.number().optional(),
    temp: z.string().optional(),
    spo2: z.number().optional(),
    weightKg: z.number().optional(),
  }).optional(),
  treatmentPlan: z.string().optional(),
  notes: z.string().optional(),
});

export const prescriptionItemSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required'),
  dosage: z.string().min(1, 'Dosage is required (e.g. 500mg)'),
  frequency: z.string().min(1, 'Frequency is required (e.g. Twice daily after meals)'),
  durationDays: z.number().min(1, 'Duration in days is required'),
  instructions: z.string().optional(),
});

export const createPrescriptionSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  medicalRecordId: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(prescriptionItemSchema).min(1, 'At least one medication is required'),
});
