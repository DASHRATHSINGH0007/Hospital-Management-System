import { Router } from 'express';
import { patientController } from '../controllers/patient.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles, UserRoles } from '../middleware/rbac.middleware';

const router = Router();

router.get('/', (req, res) => patientController.getAllPatients(req, res));
router.get('/:id', (req, res) => patientController.getPatientById(req, res));
router.post(
  '/',
  authenticateJWT,
  authorizeRoles(UserRoles.HOSPITAL_ADMIN, UserRoles.RECEPTIONIST, UserRoles.DOCTOR),
  (req, res) => patientController.createPatient(req, res)
);
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles(UserRoles.HOSPITAL_ADMIN, UserRoles.RECEPTIONIST, UserRoles.DOCTOR),
  (req, res) => patientController.updatePatient(req, res)
);
router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles(UserRoles.HOSPITAL_ADMIN),
  (req, res) => patientController.deletePatient(req, res)
);

export default router;
