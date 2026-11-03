import { Router } from 'express';
import { bedController } from '../controllers/bed.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles, UserRoles } from '../middleware/rbac.middleware';

const router = Router();

router.get('/', (req, res) => bedController.getAllBeds(req, res));
router.post(
  '/admissions',
  authenticateJWT,
  authorizeRoles(UserRoles.HOSPITAL_ADMIN, UserRoles.RECEPTIONIST, UserRoles.NURSE, UserRoles.DOCTOR),
  (req, res) => bedController.admitPatient(req, res)
);
router.post(
  '/admissions/:id/discharge',
  authenticateJWT,
  authorizeRoles(UserRoles.HOSPITAL_ADMIN, UserRoles.DOCTOR),
  (req, res) => bedController.dischargePatient(req, res)
);

export default router;
