import { z } from 'zod';

export const createMedicineSchema = z.object({
  name: z.string().min(2, 'Medicine name is required'),
  genericName: z.string().optional(),
  category: z.string().min(2, 'Category is required'),
  dosageForm: z.string().default('Tablet'),
  batchNumber: z.string().min(2, 'Batch number is required'),
  stockQuantity: z.number().int().min(0, 'Quantity must be 0 or greater'),
  minThreshold: z.number().int().min(1).default(30),
  unitPrice: z.number().min(0.01, 'Unit price must be positive'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  supplierId: z.string().optional(),
});

export const restockMedicineSchema = z.object({
  addedQuantity: z.number().int().min(1, 'Added quantity must be at least 1'),
  batchNumber: z.string().optional(),
  unitPrice: z.number().optional(),
});
