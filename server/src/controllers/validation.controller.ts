import { Request, Response, NextFunction } from 'express';
import { emailValidationService } from '../services/email.service.js';

export const validateEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        error: 'Email is required',
      });
      return;
    }

    const result = await emailValidationService.isTemporaryEmail(email);

    res.json({
      email,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
