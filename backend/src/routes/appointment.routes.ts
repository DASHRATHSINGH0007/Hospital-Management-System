import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles, UserRoles } from '../middleware/rbac.middleware';

const router = Router();

router.get('/', (req, res) => appointmentController.getAllAppointments(req, res));
router.post(
  '/',
  authenticateJWT,
  authorizeRoles(UserRoles.HOSPITAL_ADMIN, UserRoles.RECEPTIONIST, UserRoles.DOCTOR, UserRoles.PATIENT),
  (req, res) => appointmentController.createAppointment(req, res)
);
router.patch(
  '/:id/status',
  authenticateJWT,
  authorizeRoles(UserRoles.HOSPITAL_ADMIN, UserRoles.RECEPTIONIST, UserRoles.DOCTOR, UserRoles.NURSE),
  (req, res) => appointmentController.updateStatus(req, res)
);
router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles(UserRoles.HOSPITAL_ADMIN, UserRoles.RECEPTIONIST),
  (req, res) => appointmentController.deleteAppointment(req, res)
);

export default router;
