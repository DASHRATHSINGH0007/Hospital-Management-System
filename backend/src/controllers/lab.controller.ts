import { Request, Response } from 'express';
import { createLabTestSchema, orderLabTestSchema, submitLabResultSchema } from '../validators/lab.validator';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class LabController {
  /**
   * GET /api/v1/lab/tests
   */
  public async getAllTests(req: Request, res: Response) {
    try {
      return res.status(200).json({
        success: true,
        count: store.labTests.length,
        data: store.labTests,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/lab/tests
   */
  public async createTest(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = createLabTestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validation.error.format() },
        });
      }

      const data = validation.data;
      const newTest = {
        id: `lab-${Date.now()}`,
        name: data.name,
        code: data.code,
        category: data.category,
        price: data.price,
        normalRange: data.normalRange || null,
        unit: data.unit || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.labTests.push(newTest);
      return res.status(201).json({ success: true, data: newTest });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/v1/lab/reports
   */
  public async getAllReports(req: Request, res: Response) {
    try {
      const patientId = req.query.patientId as string;
      const status = req.query.status as string;

      let list = store.labReports.map((rep) => {
        const patient = store.patients.find((p) => p.id === rep.patientId);
        const test = store.labTests.find((t) => t.id === rep.testId);
        const doctor = store.doctors.find((d) => d.id === rep.orderingDoctorId);
        const docUser = doctor ? store.users.find((u) => u.id === doctor.userId) : null;

        return {
          ...rep,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
          patientCode: patient?.patientCode,
          testName: test?.name || 'Diagnostic Test',
          testCode: test?.code,
          normalRange: test?.normalRange,
          unit: test?.unit,
          doctorName: docUser ? `Dr. ${docUser.firstName} ${docUser.lastName}` : 'Dr. Attending',
        };
      });

      if (patientId) {
        list = list.filter((r) => r.patientId === patientId);
      }
      if (status) {
        list = list.filter((r) => r.status === status);
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
   * POST /api/v1/lab/requests
   */
  public async orderTest(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = orderLabTestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validation.error.format() },
        });
      }

      const { patientId, orderingDoctorId, testId } = validation.data;
      const newReport = {
        id: `rep-${Date.now()}`,
        patientId,
        orderingDoctorId,
        testId,
        status: 'ORDERED',
        sampleCollectedAt: null,
        resultValue: null,
        resultNotes: null,
        isAbnormal: false,
        reportDocumentUrl: null,
        technicianName: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.labReports.unshift(newReport);

      store.logAudit(req.user?.userId || null, 'ORDER', 'LabTest', newReport.id, {
        testId,
        patientId,
      });

      return res.status(201).json({
        success: true,
        message: 'Laboratory test requisition created',
        data: newReport,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/v1/lab/reports/:id/result
   */
  public async submitResult(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const report = store.labReports.find((r) => r.id === id);

      if (!report) {
        return res.status(404).json({ success: false, message: 'Lab report order not found' });
      }

      const validation = submitLabResultSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', details: validation.error.format() },
        });
      }

      const { resultValue, resultNotes, isAbnormal, technicianName } = validation.data;

      report.resultValue = resultValue;
      report.resultNotes = resultNotes || null;
      report.isAbnormal = isAbnormal;
      report.technicianName = technicianName || req.user?.firstName || 'Lab Tech';
      report.status = 'COMPLETED';
      report.sampleCollectedAt = report.sampleCollectedAt || new Date().toISOString();
      report.updatedAt = new Date().toISOString();

      store.logAudit(req.user?.userId || null, 'SUBMIT_RESULT', 'LabReport', report.id, {
        value: resultValue,
        isAbnormal,
      });

      return res.status(200).json({
        success: true,
        message: 'Laboratory test results recorded and signed off',
        data: report,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const labController = new LabController();
