import { z } from 'zod';

export const billItemSchema = z.object({
  itemType: z.enum(['CONSULTATION', 'MEDICINE', 'LAB_TEST', 'ROOM_CHARGE', 'PROCEDURE']),
  description: z.string().min(2, 'Description is required'),
  unitPrice: z.number().min(0, 'Price must be positive'),
  quantity: z.number().int().min(1).default(1),
});

export const createBillSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  admissionId: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(billItemSchema).min(1, 'At least one item is required'),
  discountAmount: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
});

export const processPaymentSchema = z.object({
  amount: z.number().min(0.01, 'Payment amount must be greater than zero'),
  paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'INSURANCE', 'ONLINE_TRANSFER']).default('CASH'),
  transactionRef: z.string().optional(),
  notes: z.string().optional(),
});
