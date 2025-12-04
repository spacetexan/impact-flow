/**
 * Project API routes
 */

import { Router } from 'express';
import { getDatabase } from '../database';

const router = Router();

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

interface ProjectRow {
  id: string;
  profile_id: string;
  name: string;
  purpose: string;
  importance: string;
  ideal_outcome: string;
  status: string;
  due_date: string | null;
  comments: string;
  created_at: string;
}

function rowToProject(row: ProjectRow) {
  return {
    id: row.id,
    profileId: row.profile_id,
    name: row.name,
    purpose: row.purpose,
    importance: row.importance,
    idealOutcome: row.ideal_outcome,
    status: row.status,
    dueDate: row.due_date,
    comments: row.comments,
    createdAt: row.created_at,
  };
}

// GET /api/projects - Get all projects
router.get('/', (req, res) => {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT id, profile_id, name, purpose, importance, ideal_outcome,
           status, due_date, comments, created_at
    FROM projects
  `).all() as ProjectRow[];

  res.json(rows.map(rowToProject));
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT id, profile_id, name, purpose, importance, ideal_outcome,
           status, due_date, comments, created_at
    FROM projects WHERE id = ?
  `).get(req.params.id) as ProjectRow | undefined;

  if (!row) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json(rowToProject(row));
});

// GET /api/projects/profile/:profileId - Get projects by profile
router.get('/profile/:profileId', (req, res) => {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT id, profile_id, name, purpose, importance, ideal_outcome,
           status, due_date, comments, created_at
    FROM projects WHERE profile_id = ?
  `).all(req.params.profileId) as ProjectRow[];

  res.json(rows.map(rowToProject));
});

// POST /api/projects - Create new project
router.post('/', (req, res) => {
  const db = getDatabase();
  const { profileId, name, purpose, importance, idealOutcome, status, dueDate, comments } = req.body;
  const id = generateId();
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO projects (id, profile_id, name, purpose, importance, ideal_outcome,
                         status, due_date, comments, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, profileId, name, purpose, importance, idealOutcome, status, dueDate || null, comments || '', createdAt);

  res.status(201).json({
    id,
    profileId,
    name,
    purpose,
    importance,
    idealOutcome,
    status,
    dueDate,
    comments: comments || '',
    createdAt,
  });
});

// PUT /api/projects/:id - Update project
router.put('/:id', (req, res) => {
  const db = getDatabase();
  const { profileId, name, purpose, importance, idealOutcome, status, dueDate, comments } = req.body;
  const { id } = req.params;

  const existing = db.prepare('SELECT id, created_at FROM projects WHERE id = ?').get(id) as { id: string; created_at: string } | undefined;
  if (!existing) {
    return res.status(404).json({ error: 'Project not found' });
  }

  db.prepare(`
    UPDATE projects SET
      profile_id = ?, name = ?, purpose = ?, importance = ?,
      ideal_outcome = ?, status = ?, due_date = ?, comments = ?
    WHERE id = ?
  `).run(profileId, name, purpose, importance, idealOutcome, status, dueDate || null, comments || '', id);

  res.json({
    id,
    profileId,
    name,
    purpose,
    importance,
    idealOutcome,
    status,
    dueDate,
    comments: comments || '',
    createdAt: existing.created_at,
  });
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.status(204).send();
});

// DELETE /api/projects/profile/:profileId - Delete all projects for a profile
router.delete('/profile/:profileId', (req, res) => {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM projects WHERE profile_id = ?').run(req.params.profileId);
  res.json({ deleted: result.changes });
});

// POST /api/projects/seed - Seed projects (for demo mode)
router.post('/seed', (req, res) => {
  const db = getDatabase();
  const { projects } = req.body;

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO projects (id, profile_id, name, purpose, importance,
                                     ideal_outcome, status, due_date, comments, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((projects: any[]) => {
    for (const p of projects) {
      stmt.run(p.id, p.profileId, p.name, p.purpose, p.importance,
               p.idealOutcome, p.status, p.dueDate || null, p.comments || '', p.createdAt);
    }
  });

  insertMany(projects);
  res.status(201).json({ message: `Seeded ${projects.length} projects` });
});

export default router;
