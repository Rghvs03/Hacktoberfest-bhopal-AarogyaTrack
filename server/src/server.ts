import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import authRoutes from './routes/auth';
import patientRoutes from './routes/patients';
import consultationRoutes from './routes/consultations';
import syncRoutes from './routes/sync';
import aiRoutes from './routes/ai';

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allows local dev and cross-device testing on mobile hotspot
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'AarogyaTrack API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Root API Welcome & Status
app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    service: 'AarogyaTrack API',
    frontend: 'https://hacktoberfest-bhopal-aarogya-track.vercel.app',
    healthCheck: '/api/v1/health',
    message: 'Backend is active and serving clinical records.',
  });
});

// Register Domain Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/consultations', consultationRoutes);
app.use('/api/v1/sync', syncRoutes);
app.use('/api/v1/ai', aiRoutes);

// Production Static Assets (Unified Full-Stack Deployment)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'An unexpected internal error occurred.',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 AarogyaTrack API running on http://localhost:${config.port}`);
    console.log(`📋 Health check: http://localhost:${config.port}/api/v1/health`);
  });
}

export default app;

