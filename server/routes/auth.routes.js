/* global process */
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db, ensureDb } from '../db.js';
import { requireAuth } from '../middleware/authRequired.js';

const router = express.Router();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

router.post('/register', async (req, res) => {
  ensureDb();

  const { email, password } = req.body || {};
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email=?').get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  const createdAt = new Date().toISOString();

  db.prepare(
    'INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)'
  ).run(id, normalizedEmail, passwordHash, createdAt);

  const token = jwt.sign(
    { sub: id, email: normalizedEmail },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

  return res.status(201).json({ token });
});

router.post('/login', async (req, res) => {
  ensureDb();

  const { email, password } = req.body || {};
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT id, email, password_hash FROM users WHERE email=?').get(normalizedEmail);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

  return res.json({ token });
});

router.get('/me', requireAuth, (req, res) => {
  ensureDb();

  const user = db.prepare('SELECT id, email, created_at FROM users WHERE id=?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  return res.json({ user: { id: user.id, email: user.email, createdAt: user.created_at } });
});

export default router;

