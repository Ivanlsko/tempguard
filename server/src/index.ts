import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import validationRouter from './routes/validation.js';
import { ErrorResponse } from './types/index.js';

const app: Express = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Basic route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to TempGuard API' });
});

// Routes
app.use('/validate', validationRouter);

// Catch all undefined routes
app.use('*', (req: Request, res: Response) => {
  const response: ErrorResponse = {
    message: 'Route not found',
    requestedPath: req.originalUrl,
  };
  res.status(404).json(response);
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  const response: ErrorResponse = {
    message: 'Something went wrong!',
  };
  res.status(500).json(response);
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
