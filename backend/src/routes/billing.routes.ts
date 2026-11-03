import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles, UserRoles } from '../middleware/rbac.middleware';

const router = Router();

router.get('/bills', (req, res) => billingController.getAllBills(req, res));
router.get('/bills/:id', (req, res) => billingController.getBillById(req, res));
router.post(
  '/bills',
  authenticateJWT,
  authorizeRoles(UserRoles.HOSPITAL_ADMIN, UserRoles.RECEPTIONIST),
  (req, res) => billingController.createBill(req, res)
);
router.post(
  '/bills/:id/pay',
  authenticateJWT,
  authorizeRoles(UserRoles.HOSPITAL_ADMIN, UserRoles.RECEPTIONIST, UserRoles.PATIENT),
  (req, res) => billingController.processPayment(req, res)
);

export default router;
