import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles, UserRoles } from '../middleware/rbac.middleware';

const router = Router();

router.get(
  '/',
  authenticateJWT,
  authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.HOSPITAL_ADMIN),
  (req, res) => auditController.getAuditLogs(req, res)
);

export default router;
