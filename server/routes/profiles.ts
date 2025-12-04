/**
 * Profile API routes
 */

import { Router } from 'express';
import { getDatabase } from '../database';

const router = Router();

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// GET /api/profiles - Get all profiles
router.get('/', (req, res) => {
  const db = getDatabase();
  const profiles = db.prepare('SELECT id, name, role, avatar FROM profiles').all();
  res.json(profiles);
});

// GET /api/profiles/:id - Get profile by ID
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const profile = db.prepare('SELECT id, name, role, avatar FROM profiles WHERE id = ?').get(req.params.id);

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  res.json(profile);
});

// POST /api/profiles - Create new profile
router.post('/', (req, res) => {
  const db = getDatabase();
  const { name, role, avatar } = req.body;
  const id = generateId();

  db.prepare('INSERT INTO profiles (id, name, role, avatar) VALUES (?, ?, ?, ?)').run(id, name, role, avatar || null);

  res.status(201).json({ id, name, role, avatar });
});

// PUT /api/profiles/:id - Update profile
router.put('/:id', (req, res) => {
  const db = getDatabase();
  const { name, role, avatar } = req.body;
  const { id } = req.params;

  const existing = db.prepare('SELECT id FROM profiles WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  db.prepare('UPDATE profiles SET name = ?, role = ?, avatar = ? WHERE id = ?').run(name, role, avatar || null, id);

  res.json({ id, name, role, avatar });
});

// DELETE /api/profiles/:id - Delete profile
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  const result = db.prepare('DELETE FROM profiles WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  res.status(204).send();
});

// POST /api/profiles/seed - Seed profiles (for demo mode)
router.post('/seed', (req, res) => {
  const db = getDatabase();
  const { profiles } = req.body;

  const stmt = db.prepare('INSERT OR REPLACE INTO profiles (id, name, role, avatar) VALUES (?, ?, ?, ?)');

  const insertMany = db.transaction((profiles: any[]) => {
    for (const profile of profiles) {
      stmt.run(profile.id, profile.name, profile.role, profile.avatar || null);
    }
  });

  insertMany(profiles);
  res.status(201).json({ message: `Seeded ${profiles.length} profiles` });
});

export default router;
