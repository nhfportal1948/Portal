import { Router } from 'express';
import { registerPrincipal, registerStudent, login, getProfile } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// Public endpoints
router.post('/register-principal', registerPrincipal);
router.post('/register-student', registerStudent);
router.post('/login', login);

// Protected endpoints
router.get('/profile', authenticateJWT, getProfile);

export default router;

