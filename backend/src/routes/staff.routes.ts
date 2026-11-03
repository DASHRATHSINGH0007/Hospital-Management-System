import { Router } from 'express';
import { staffController } from '../controllers/staff.controller';

const router = Router();

router.get('/', (req, res) => staffController.getAllStaff(req, res));

export default router;
