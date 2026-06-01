import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { aiRoutes } from './routes/aiRoutes';
import { docsRoutes } from './routes/docsRoutes';
import { crmEventRoutes } from './routes/crmEventRoutes';
import { workflowRoutes, workflowRunRoutes } from './routes/workflowRoutes';
import { userRoutes } from './routes/userRoutes';
import { settingsRoutes } from './routes/settingsRoutes';
import { emailRoutes } from './routes/emailRoutes';
import {
  securityHeaders,
  apiLimiter,
  noSqlSanitizer,
  paramPollutionProtection,
  requestValidator,
  errorHandler,
} from './middleware/security';
import { setupPresence } from './services/presenceServer';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4200);
const host = process.env.HOST ?? '127.0.0.1';
const isDev = process.env.NODE_ENV !== 'production';

app.use(securityHeaders);
app.use(cors({
  origin: process.env.CLIENT_ORIGIN ?? 'http://127.0.0.1:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(noSqlSanitizer);
app.use(paramPollutionProtection);
app.use(requestValidator);
app.use('/api', apiLimiter);

app.get('/api/health', (_, res) => {
  res.json({ ok: true, service: 'digital-wave-crm', timestamp: new Date().toISOString() });
});

app.use('/api/workflows', workflowRoutes);
app.use('/api/workflow-runs', workflowRunRoutes);
app.use('/api/v1/workflows', workflowRoutes);
app.use('/api/v1/workflow-runs', workflowRunRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/crm', crmEventRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/v1/email', emailRoutes);

app.use(errorHandler);

const server = http.createServer(app);

async function start() {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log('[DB] MongoDB connected');
    } catch (error) {
      console.warn('[DB] MongoDB connection failed; API will continue without persistence.', error);
    }
  } else {
    console.warn('[DB] MONGODB_URI not configured; database features will be unavailable');
  }

  setupPresence(server);
  console.log('[Presence] Socket.io presence server attached');

  server.listen(port, host, () => {
    console.log(`[Server] Digital Wave CRM API running on http://${host}:${port}`);
  });
}

void start();
