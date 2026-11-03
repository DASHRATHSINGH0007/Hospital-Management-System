import { Router } from 'express';
import { medicalRecordController } from '../controllers/record.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles, UserRoles } from '../middleware/rbac.middleware';

const router = Router();

router.get('/', (req, res) => medicalRecordController.getAllRecords(req, res));
router.get('/patient/:patientId', (req, res) => medicalRecordController.getPatientRecords(req, res));
router.post(
  '/',
  authenticateJWT,
  authorizeRoles(UserRoles.DOCTOR, UserRoles.HOSPITAL_ADMIN),
  (req, res) => medicalRecordController.createRecord(req, res)
);

export default router;
