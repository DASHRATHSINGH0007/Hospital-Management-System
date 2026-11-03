import { Request, Response } from 'express';
import { store } from '../services/store.service';

export class AuditController {
  /**
   * GET /api/v1/audit-logs
   */
  public async getAuditLogs(req: Request, res: Response) {
    try {
      const entityType = req.query.entityType as string;
      const action = req.query.action as string;

      let logs = [...store.auditLogs];

      if (entityType) {
        logs = logs.filter((l) => l.entityType.toLowerCase() === entityType.toLowerCase());
      }
      if (action) {
        logs = logs.filter((l) => l.action.toLowerCase() === action.toLowerCase());
      }

      return res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const auditController = new AuditController();
