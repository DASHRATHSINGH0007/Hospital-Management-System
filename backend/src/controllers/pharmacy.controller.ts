import { Request, Response } from 'express';
import { createMedicineSchema, restockMedicineSchema } from '../validators/pharmacy.validator';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class PharmacyController {
  /**
   * GET /api/v1/pharmacy/medicines
   */
  public async getAllMedicines(req: Request, res: Response) {
    try {
      const search = (req.query.search as string)?.toLowerCase().trim();
      const category = req.query.category as string;
      const lowStockOnly = req.query.lowStock === 'true';

      let list = [...store.medicines];

      if (search) {
        list = list.filter(
          (m) =>
            m.name.toLowerCase().includes(search) ||
            m.genericName?.toLowerCase().includes(search) ||
            m.category.toLowerCase().includes(search) ||
            m.batchNumber?.toLowerCase().includes(search)
        );
      }

      if (category) {
        list = list.filter((m) => m.category.toLowerCase() === category.toLowerCase());
      }

      if (lowStockOnly) {
        list = list.filter((m) => m.stockQuantity <= (m.minThreshold || 30));
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
   * POST /api/v1/pharmacy/medicines
   */
  public async createMedicine(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = createMedicineSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validation.error.format() },
        });
      }

      const data = validation.data;
      const newMedicine = {
        id: `med-${Date.now()}`,
        name: data.name,
        genericName: data.genericName || null,
        category: data.category,
        dosageForm: data.dosageForm || 'Tablet',
        batchNumber: data.batchNumber,
        stockQuantity: data.stockQuantity,
        minThreshold: data.minThreshold,
        unitPrice: data.unitPrice,
        expiryDate: data.expiryDate,
        supplierId: data.supplierId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.medicines.unshift(newMedicine);

      store.logAudit(req.user?.userId || null, 'CREATE', 'Medicine', newMedicine.id, {
        name: newMedicine.name,
        quantity: newMedicine.stockQuantity,
      });

      return res.status(201).json({
        success: true,
        message: 'Medicine added to hospital pharmacy inventory',
        data: newMedicine,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/pharmacy/medicines/:id/restock
   */
  public async restockMedicine(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const med = store.medicines.find((m) => m.id === id);

      if (!med) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
      }

      const validation = restockMedicineSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validation.error.format() },
        });
      }

      const { addedQuantity, batchNumber, unitPrice } = validation.data;
      med.stockQuantity += addedQuantity;
      if (batchNumber) med.batchNumber = batchNumber;
      if (unitPrice) med.unitPrice = unitPrice;
      med.updatedAt = new Date().toISOString();

      store.logAudit(req.user?.userId || null, 'RESTOCK', 'Medicine', med.id, {
        added: addedQuantity,
        newTotal: med.stockQuantity,
      });

      return res.status(200).json({
        success: true,
        message: `Restocked ${med.name}. New available balance: ${med.stockQuantity} units`,
        data: med,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/v1/pharmacy/alerts
   */
  public async getStockAlerts(req: Request, res: Response) {
    try {
      const lowStockMeds = store.medicines.filter(
        (m) => m.stockQuantity <= (m.minThreshold || 30)
      );

      return res.status(200).json({
        success: true,
        count: lowStockMeds.length,
        data: lowStockMeds,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const pharmacyController = new PharmacyController();
