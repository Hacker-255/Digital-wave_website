import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { aiRoutes } from './routes/aiRoutes';
import { workflowRoutes } from './routes/workflowRoutes';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4200);

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://127.0.0.1:5173' }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_, response) => {
  response.json({ ok: true, service: 'digital-wave-crm' });
});

app.use('/api/workflows', workflowRoutes);
app.use('/api/ai', aiRoutes);

async function start() {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected');
    } catch (error) {
      console.warn('MongoDB connection failed; API will continue without persistence.', error);
    }
  }

  app.listen(port, '127.0.0.1', () => {
    console.log(`Digital Wave CRM API running on http://127.0.0.1:${port}`);
  });
}

void start();
