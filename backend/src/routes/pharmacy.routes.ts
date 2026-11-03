import { Router } from 'express';
import { pharmacyController } from '../controllers/pharmacy.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles, UserRoles } from '../middleware/rbac.middleware';

const router = Router();

router.get('/medicines', (req, res) => pharmacyController.getAllMedicines(req, res));
router.get('/alerts', (req, res) => pharmacyController.getStockAlerts(req, res));
router.post(
  '/medicines',
  authenticateJWT,
  authorizeRoles(UserRoles.PHARMACIST, UserRoles.HOSPITAL_ADMIN),
  (req, res) => pharmacyController.createMedicine(req, res)
);
router.post(
  '/medicines/:id/restock',
  authenticateJWT,
  authorizeRoles(UserRoles.PHARMACIST, UserRoles.HOSPITAL_ADMIN),
  (req, res) => pharmacyController.restockMedicine(req, res)
);

export default router;
