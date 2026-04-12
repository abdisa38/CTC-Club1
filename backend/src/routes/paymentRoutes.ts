import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import {
  initializePremiumPayment,
  verifyPremiumPayment,
  chapaCallback,
  chapaWebhook,
} from '../controllers/paymentController';
import { verifyPremiumPaymentSchema } from '../validators/paymentValidator';

const router = express.Router();

router.post('/premium/initialize', protect as any, initializePremiumPayment as any);
router.get('/premium/verify/:txRef', protect as any, validateRequest(verifyPremiumPaymentSchema), verifyPremiumPayment as any);
router.get('/chapa/callback', chapaCallback as any);
router.post('/chapa/webhook', chapaWebhook as any);

export default router;
