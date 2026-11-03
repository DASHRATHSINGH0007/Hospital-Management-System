import { Router } from 'express';
import { labController } from '../controllers/lab.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles, UserRoles } from '../middleware/rbac.middleware';

const router = Router();

router.get('/tests', (req, res) => labController.getAllTests(req, res));
router.get('/reports', (req, res) => labController.getAllReports(req, res));
router.post(
  '/tests',
  authenticateJWT,
  authorizeRoles(UserRoles.LAB_TECHNICIAN, UserRoles.HOSPITAL_ADMIN),
  (req, res) => labController.createTest(req, res)
);
router.post(
  '/requests',
  authenticateJWT,
  authorizeRoles(UserRoles.DOCTOR, UserRoles.HOSPITAL_ADMIN),
  (req, res) => labController.orderTest(req, res)
);
router.post(
  '/reports/:id/result',
  authenticateJWT,
  authorizeRoles(UserRoles.LAB_TECHNICIAN, UserRoles.HOSPITAL_ADMIN),
  (req, res) => labController.submitResult(req, res)
);

export default router;
