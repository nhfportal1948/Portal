import { Router } from 'express';
import { getPrincipalSchool, getPrincipalStudents } from '../controllers/principal.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// Secure all principal routes
router.use(authenticateJWT);
router.use(requireRole('PRINCIPAL'));

router.get('/school', getPrincipalSchool);
router.get('/students', getPrincipalStudents);

export default router;
