import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles, UserRoles } from '../middleware/rbac.middleware';

const router = Router();

router.get(
  '/export/csv',
  authenticateJWT,
  authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.HOSPITAL_ADMIN),
  (req, res) => reportController.exportCsv(req, res)
);

router.get(
  '/executive-summary',
  authenticateJWT,
  authorizeRoles(UserRoles.SUPER_ADMIN, UserRoles.HOSPITAL_ADMIN),
  (req, res) => reportController.getExecutiveSummary(req, res)
);

export default router;
