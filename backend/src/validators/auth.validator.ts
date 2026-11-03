import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  role: z.enum([
    'SUPER_ADMIN',
    'HOSPITAL_ADMIN',
    'DOCTOR',
    'RECEPTIONIST',
    'NURSE',
    'PHARMACIST',
    'LAB_TECHNICIAN',
    'PATIENT',
  ]).default('PATIENT'),
  phone: z.string().optional(),
});
