import { Router } from 'express';
import { doctorController } from '../controllers/doctor.controller';

const router = Router();

router.get('/', (req, res) => doctorController.getAllDoctors(req, res));
router.get('/:id', (req, res) => doctorController.getDoctorById(req, res));

export default router;
