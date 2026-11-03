import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, (req, res) => notificationController.getMyNotifications(req, res));
router.patch('/:id/read', authenticateJWT, (req, res) => notificationController.markAsRead(req, res));

export default router;
