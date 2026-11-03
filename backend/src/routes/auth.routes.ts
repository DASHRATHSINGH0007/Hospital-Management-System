import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', (req, res) => authController.register(req, res));
router.get('/demo-credentials', (req, res) => authController.getDemoCredentials(req, res));

// Protected session routes
router.get('/me', authenticateJWT, (req, res) => authController.getMe(req, res));
router.post('/logout', authenticateJWT, (req, res) => authController.logout(req, res));

export default router;
