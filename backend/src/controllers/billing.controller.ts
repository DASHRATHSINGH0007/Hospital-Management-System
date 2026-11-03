import { Request, Response } from 'express';
import { createBillSchema, processPaymentSchema } from '../validators/billing.validator';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class BillingController {
  /**
   * GET /api/v1/billing/bills
   */
  public async getAllBills(req: Request, res: Response) {
    try {
      const patientId = req.query.patientId as string;
      const status = req.query.status as string;

      let list = store.bills.map((bill) => {
        const patient = store.patients.find((p) => p.id === bill.patientId);
        return {
          ...bill,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
          patientCode: patient?.patientCode,
          patientPhone: patient?.phone,
        };
      });

      if (patientId) {
        list = list.filter((b) => b.patientId === patientId);
      }
      if (status) {
        list = list.filter((b) => b.status === status);
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
   * GET /api/v1/billing/bills/:id
   */
  public async getBillById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const bill = store.bills.find((b) => b.id === id || b.billNumber === id);

      if (!bill) {
        return res.status(404).json({ success: false, message: 'Bill invoice not found' });
      }

      const patient = store.patients.find((p) => p.id === bill.patientId);
      const billPayments = store.payments.filter((p) => p.billId === bill.id);

      return res.status(200).json({
        success: true,
        data: {
          ...bill,
          patient,
          payments: billPayments,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/billing/bills
   */
  public async createBill(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = createBillSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validation.error.format() },
        });
      }

      const data = validation.data;
      const patient = store.patients.find((p) => p.id === data.patientId);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }

      let subTotal = 0;
      const items = data.items.map((item, index) => {
        const itemTotal = item.unitPrice * item.quantity;
        subTotal += itemTotal;
        return {
          id: `bi-${Date.now()}-${index}`,
          ...item,
          totalPrice: itemTotal,
        };
      });

      const taxAmount = data.taxAmount || Math.round(subTotal * 0.05 * 100) / 100; // 5% tax
      const discountAmount = data.discountAmount || 0;
      const totalAmount = Math.max(0, subTotal + taxAmount - discountAmount);
      const billNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newBill = {
        id: `bill-${Date.now()}`,
        patientId: data.patientId,
        admissionId: data.admissionId || null,
        billNumber,
        subTotal,
        taxAmount,
        discountAmount,
        totalAmount,
        paidAmount: 0,
        status: 'PENDING',
        dueDate: data.dueDate,
        items,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.bills.unshift(newBill);

      store.logAudit(req.user?.userId || null, 'CREATE', 'Bill', newBill.id, {
        billNumber,
        totalAmount,
        patientCode: patient.patientCode,
      });

      return res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: newBill,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/billing/bills/:id/pay
   */
  public async processPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const bill = store.bills.find((b) => b.id === id);

      if (!bill) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }

      const validation = processPaymentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validation.error.format() },
        });
      }

      const { amount, paymentMethod, transactionRef, notes } = validation.data;
      const receiptNumber = `RCP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      const payment = {
        id: `pay-${Date.now()}`,
        billId: bill.id,
        receiptNumber,
        amount,
        paymentMethod,
        transactionRef: transactionRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        paidAt: new Date().toISOString(),
        notes: notes || 'Settlement processed',
      };

      store.payments.push(payment);

      bill.paidAmount += amount;
      if (bill.paidAmount >= bill.totalAmount) {
        bill.status = 'PAID';
      } else if (bill.paidAmount > 0) {
        bill.status = 'PARTIALLY_PAID';
      }
      bill.updatedAt = new Date().toISOString();

      store.logAudit(req.user?.userId || null, 'PAYMENT', 'Bill', bill.id, {
        amount,
        receiptNumber,
        paymentMethod,
      });

      return res.status(200).json({
        success: true,
        message: `Payment of $${amount.toFixed(2)} received successfully`,
        data: {
          bill,
          payment,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const billingController = new BillingController();
