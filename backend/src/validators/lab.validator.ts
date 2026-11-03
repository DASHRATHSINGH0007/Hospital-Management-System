import { z } from 'zod';

export const createLabTestSchema = z.object({
  name: z.string().min(2, 'Test name is required'),
  code: z.string().min(2, 'Test code is required (e.g. CBC-01)'),
  category: z.string().min(2, 'Category is required (e.g. Hematology)'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  normalRange: z.string().optional(),
  unit: z.string().optional(),
});

export const orderLabTestSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  orderingDoctorId: z.string().min(1, 'Ordering Doctor ID is required'),
  testId: z.string().min(1, 'Lab Test ID is required'),
});

export const submitLabResultSchema = z.object({
  resultValue: z.string().min(1, 'Result value is required'),
  resultNotes: z.string().optional(),
  isAbnormal: z.boolean().default(false),
  technicianName: z.string().optional(),
});
