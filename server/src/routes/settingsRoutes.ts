import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

const settingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedAt: { type: Date, default: Date.now },
});

const SettingsModel = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

function canPersist() {
  return mongoose.connection.readyState === 1;
}

router.get('/', async (req, res) => {
  if (!req.authUser) { res.status(401).json({ error: 'Not authenticated' }); return; }
  if (!canPersist()) {
    res.json({ settings: {}, offline: true });
    return;
  }
  try {
    const doc = await SettingsModel.findOne({ userId: req.authUser.clerkId });
    res.json({ settings: doc?.data || {} });
  } catch {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

router.put('/', async (req, res) => {
  if (!req.authUser) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    res.status(400).json({ error: 'Settings object is required' });
    return;
  }
  if (!canPersist()) {
    res.json({ ok: true, offline: true });
    return;
  }
  try {
    const doc = await SettingsModel.findOneAndUpdate(
      { userId: req.authUser.clerkId },
      { data: settings, updatedAt: new Date() },
      { upsert: true, new: true },
    );
    res.json({ ok: true, settings: doc.data });
  } catch {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

export { router as settingsRoutes };
