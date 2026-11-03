import { Router } from 'express';
import { prescriptionController } from '../controllers/prescription.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles, UserRoles } from '../middleware/rbac.middleware';

const router = Router();

router.get('/', (req, res) => prescriptionController.getAllPrescriptions(req, res));
router.post(
  '/',
  authenticateJWT,
  authorizeRoles(UserRoles.DOCTOR, UserRoles.HOSPITAL_ADMIN),
  (req, res) => prescriptionController.createPrescription(req, res)
);
router.post(
  '/:id/dispense',
  authenticateJWT,
  authorizeRoles(UserRoles.PHARMACIST, UserRoles.HOSPITAL_ADMIN),
  (req, res) => prescriptionController.dispensePrescription(req, res)
);

export default router;
