import { Router } from 'express';
import { validateEmail } from '../controllers/validation.controller.js';

const router = Router();

router.post('/', validateEmail);

export default router;
