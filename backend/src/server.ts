import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { rateLimiter } from './middleware/rateLimit.middleware';

const app = express();

// Security & Utility Middlewares
app.use(helmet());
app.use(rateLimiter(60000, 120)); // General API rate limiter: 120 requests/min
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// System Health & Liveness Probe
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    system: 'MediCore Smart Healthcare Management Platform',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: '1.0.0',
  });
});

// Root API Welcome & Spec
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to MediCore Enterprise Healthcare API Gateway',
    documentation: `${config.apiPrefix}/docs`,
    health: '/health',
  });
});

import apiRouter from './routes';

// Modular Routes Mount Point
app.use(config.apiPrefix, apiRouter);

// 404 Route Not Found Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `The requested endpoint '${req.method} ${req.originalUrl}' does not exist on this server.`,
    },
  });
});

// Global Error Handler Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[SERVER ERROR]:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: config.nodeEnv === 'production' ? 'An internal server error occurred.' : err.message,
    },
  });
});

// Start listening if not imported as a test module
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`\n======================================================`);
    console.log(`  🏥 MediCore API Gateway is operational`);
    console.log(`  🌐 Running on: http://localhost:${config.port}`);
    console.log(`  🔍 Healthcheck: http://localhost:${config.port}/health`);
    console.log(`  ⚙️  Environment: ${config.nodeEnv}`);
    console.log(`======================================================\n`);
  });
}

export default app;
