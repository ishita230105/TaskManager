import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, forgotPassword, resetPassword } from '../controllers/auth';

const router = Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { error: 'Too many accounts created from this IP, please try again after 15 minutes' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
