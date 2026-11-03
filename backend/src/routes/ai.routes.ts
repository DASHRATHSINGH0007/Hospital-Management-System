import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';

const router = Router();

router.get('/demand-forecast', (req, res) => aiController.getDemandForecast(req, res));
router.get('/revenue-forecast', (req, res) => aiController.getRevenueForecast(req, res));
router.get('/inventory-prediction', (req, res) => aiController.getInventoryPrediction(req, res));
router.get('/operational-insights', (req, res) => aiController.getOperationalInsights(req, res));

export default router;
