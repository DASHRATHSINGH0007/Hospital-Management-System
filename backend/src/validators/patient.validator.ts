import { z } from 'zod';

export const createPatientSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  dateOfBirth: z.string().or(z.date()),
  gender: z.string().min(1, 'Gender is required'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  phone: z.string().min(5, 'Valid phone number is required'),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  // Patient chosen healthcare needs & preferences
  careNeed: z.string().optional(),
  department: z.string().optional(),
  preferredDoctor: z.string().optional(),
  priority: z.enum(['Routine', 'Urgent', 'Emergency']).optional(),
  bedPreference: z.string().optional(),
  specialAssistance: z.array(z.string()).or(z.string()).optional(),
  paymentMethod: z.string().optional(),
  chiefComplaint: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();
