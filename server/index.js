/* global process */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ensureDb } from './db.js';
import authRoutes from './routes/auth.routes.js';
import transactionsRoutes from './routes/transactions.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

ensureDb();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

