import express from 'express';
import crypto from 'crypto';
import { db, ensureDb } from '../db.js';
import { requireAuth } from '../middleware/authRequired.js';

const router = express.Router();

function normalizeIsoDate(value) {
  // Accept ISO strings and YYYY-MM-DD strings, normalize to YYYY-MM-DD.
  const s = String(value || '').trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

router.use(requireAuth);

router.get('/', (req, res) => {
  ensureDb();

  const userId = req.user.id;
  const { from, to, type, category, q } = req.query || {};

  const conditions = ['user_id=?'];
  const params = [userId];

  const fromDate = from ? normalizeIsoDate(from) : null;
  const toDate = to ? normalizeIsoDate(to) : null;
  if (fromDate) {
    conditions.push('date >= ?');
    params.push(fromDate);
  }
  if (toDate) {
    conditions.push('date <= ?');
    params.push(toDate);
  }
  if (type === 'income' || type === 'expense') {
    conditions.push('type=?');
    params.push(type);
  }
  if (category && String(category).trim()) {
    conditions.push('category=?');
    params.push(String(category).trim());
  }
  if (q && String(q).trim()) {
    conditions.push('(description LIKE ? OR category LIKE ?)');
    const query = `%${String(q).trim()}%`;
    params.push(query, query);
  }

  const where = conditions.join(' AND ');
  const sql = `
    SELECT id, date, description, amount, type, category, created_at
    FROM transactions
    WHERE ${where}
    ORDER BY date DESC, created_at DESC
  `;

  const transactions = db.prepare(sql).all(params);
  return res.json({ transactions });
});

router.post('/', (req, res) => {
  ensureDb();

  const userId = req.user.id;
  const { description, amount, type, date, category } = req.body || {};

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Description is required' });
  }
  if (type !== 'income' && type !== 'expense') {
    return res.status(400).json({ error: 'Type must be income or expense' });
  }
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  const normalizedDate = date ? normalizeIsoDate(date) : todayIsoDate();
  if (!normalizedDate) {
    return res.status(400).json({ error: 'Invalid date' });
  }

  const normalizedCategory = category ? String(category).trim() : null;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO transactions (id, user_id, date, description, amount, type, category, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(id, userId, normalizedDate, String(description).trim(), numericAmount, type, normalizedCategory, now, now);

  return res.status(201).json({
    transaction: {
      id,
      date: normalizedDate,
      description: String(description).trim(),
      amount: numericAmount,
      type,
      category: normalizedCategory,
    }
  });
});

router.put('/:id', (req, res) => {
  ensureDb();

  const userId = req.user.id;
  const { id } = req.params;
  const { description, amount, type, date, category } = req.body || {};

  if (!id) return res.status(400).json({ error: 'Missing id' });
  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Description is required' });
  }
  if (type !== 'income' && type !== 'expense') {
    return res.status(400).json({ error: 'Type must be income or expense' });
  }
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  const normalizedDate = date ? normalizeIsoDate(date) : todayIsoDate();
  if (!normalizedDate) {
    return res.status(400).json({ error: 'Invalid date' });
  }

  const normalizedCategory = category ? String(category).trim() : null;
  const now = new Date().toISOString();

  const info = db.prepare(
    `
    UPDATE transactions
    SET description=?, amount=?, type=?, date=?, category=?, updated_at=?
    WHERE id=? AND user_id=?
    `
  ).run(
    String(description).trim(),
    numericAmount,
    type,
    normalizedDate,
    normalizedCategory,
    now,
    id,
    userId
  );

  if (info.changes === 0) return res.status(404).json({ error: 'Transaction not found' });

  return res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  ensureDb();

  const userId = req.user.id;
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const info = db.prepare('DELETE FROM transactions WHERE id=? AND user_id=?').run(id, userId);
  if (info.changes === 0) return res.status(404).json({ error: 'Transaction not found' });

  return res.json({ ok: true });
});

export default router;

