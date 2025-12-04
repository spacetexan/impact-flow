/**
 * Success Criteria API routes
 */

import { Router } from 'express';
import { getDatabase } from '../database';

const router = Router();

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

interface CriteriaRow {
  id: string;
  project_id: string;
  description: string;
  is_complete: number;
}

function rowToCriteria(row: CriteriaRow) {
  return {
    id: row.id,
    projectId: row.project_id,
    description: row.description,
    isComplete: row.is_complete === 1,
  };
}

// GET /api/criteria - Get all criteria
router.get('/', (req, res) => {
  const db = getDatabase();
  const rows = db.prepare('SELECT id, project_id, description, is_complete FROM success_criteria').all() as CriteriaRow[];
  res.json(rows.map(rowToCriteria));
});

// GET /api/criteria/project/:projectId - Get criteria by project
router.get('/project/:projectId', (req, res) => {
  const db = getDatabase();
  const rows = db.prepare('SELECT id, project_id, description, is_complete FROM success_criteria WHERE project_id = ?').all(req.params.projectId) as CriteriaRow[];
  res.json(rows.map(rowToCriteria));
});

// GET /api/criteria/:id - Get criteria by ID
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const row = db.prepare('SELECT id, project_id, description, is_complete FROM success_criteria WHERE id = ?').get(req.params.id) as CriteriaRow | undefined;

  if (!row) {
    return res.status(404).json({ error: 'Criteria not found' });
  }

  res.json(rowToCriteria(row));
});

// POST /api/criteria - Create new criteria
router.post('/', (req, res) => {
  const db = getDatabase();
  const { projectId, description, isComplete } = req.body;
  const id = generateId();

  db.prepare('INSERT INTO success_criteria (id, project_id, description, is_complete) VALUES (?, ?, ?, ?)').run(id, projectId, description, isComplete ? 1 : 0);

  res.status(201).json({
    id,
    projectId,
    description,
    isComplete: isComplete || false,
  });
});

// PUT /api/criteria/:id - Update criteria
router.put('/:id', (req, res) => {
  const db = getDatabase();
  const { projectId, description, isComplete } = req.body;
  const { id } = req.params;

  const existing = db.prepare('SELECT id FROM success_criteria WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Criteria not found' });
  }

  db.prepare('UPDATE success_criteria SET project_id = ?, description = ?, is_complete = ? WHERE id = ?').run(projectId, description, isComplete ? 1 : 0, id);

  res.json({
    id,
    projectId,
    description,
    isComplete,
  });
});

// DELETE /api/criteria/:id - Delete criteria
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  const result = db.prepare('DELETE FROM success_criteria WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Criteria not found' });
  }

  res.status(204).send();
});

// DELETE /api/criteria/project/:projectId - Delete all criteria for a project
router.delete('/project/:projectId', (req, res) => {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM success_criteria WHERE project_id = ?').run(req.params.projectId);
  res.json({ deleted: result.changes });
});

// POST /api/criteria/seed - Seed criteria (for demo mode)
router.post('/seed', (req, res) => {
  const db = getDatabase();
  const { criteria } = req.body;

  const stmt = db.prepare('INSERT OR REPLACE INTO success_criteria (id, project_id, description, is_complete) VALUES (?, ?, ?, ?)');

  const insertMany = db.transaction((criteria: any[]) => {
    for (const c of criteria) {
      stmt.run(c.id, c.projectId, c.description, c.isComplete ? 1 : 0);
    }
  });

  insertMany(criteria);
  res.status(201).json({ message: `Seeded ${criteria.length} criteria` });
});

export default router;
