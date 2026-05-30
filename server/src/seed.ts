import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db!;

  const existingUsers = await db.collection('users').countDocuments();
  if (existingUsers === 0) {
    await db.collection('users').insertMany([
      { clerkId: 'seed-owner', email: 'ceo@digitalwave.com', name: 'Sarah Chen', role: 'Owner', online: false, away: false, createdAt: new Date().toISOString() },
      { clerkId: 'seed-admin', email: 'admin@digitalwave.com', name: 'Marcus Johnson', role: 'Admin', online: false, away: false, createdAt: new Date().toISOString() },
      { clerkId: 'seed-manager', email: 'manager@digitalwave.com', name: 'Priya Patel', role: 'Manager', online: false, away: false, createdAt: new Date().toISOString() },
      { clerkId: 'seed-employee', email: 'employee@digitalwave.com', name: 'Alex Rivera', role: 'Employee', online: false, away: false, createdAt: new Date().toISOString() },
      { clerkId: 'seed-viewer', email: 'viewer@digitalwave.com', name: 'Jordan Kim', role: 'Viewer', online: false, away: false, createdAt: new Date().toISOString() },
    ]);
    console.log('Seeded 5 demo users');
  }

  const existingSettings = await db.collection('settings').countDocuments();
  if (existingSettings === 0) {
    await db.collection('settings').insertOne({
      userId: 'seed-owner',
      data: {
        profile: { name: 'Sarah Chen', email: 'ceo@digitalwave.com', role: 'Owner', timezone: 'UTC-8', language: 'English' },
        appearance: { theme: 'dark', compactMode: false, sidebarStyle: 'default' },
      },
      updatedAt: new Date(),
    });
    console.log('Seeded demo settings');
  }

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch((err) => { console.error(err); process.exit(1); });
