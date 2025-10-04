import express from 'express';
import cors from 'cors';
import { cfg } from './config';
import { db } from './db';
import { kbQuery } from './tools/kbQuery';
import { createBooking } from './tools/createBooking';
import { transferCall } from './tools/transferCall';
import { emailAutoReply } from './tools/emailAutoReply';
import { embed } from './embeddings';
import { upsertVectors } from './vector';
import { addCallLog } from './tools/addCallLog'; // <-- exactly once, no ".ts"

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

// Ingest text chunks into KB
app.post('/v1/kb/ingest', async (req, res) => {
  const { venue_slug, texts, source } = req.body as { venue_slug?: string; texts?: string[]; source?: string };
  if (!venue_slug || !Array.isArray(texts)) return res.status(400).json({ ok: false, error: 'bad payload' });
  const vecs = await embed(texts);
  const pairs = vecs.map((v, i) => ({
    id: `${venue_slug}-${Date.now()}-${i}`,
    values: v,
    metadata: { chunk: texts[i], venue_slug, source: source || 'upload' },
  }));
  await upsertVectors(pairs);
  await db.query('insert into kb_chunks(venue_slug, source, chunk) select $1,$2,unnest($3::text[])', [
    venue_slug,
    source || 'upload',
    texts,
  ]);
  res.json({ ok: true, upserted: texts.length });
});

app.post('/v1/kb/query', async (req, res) => {
  const { venue_slug, question } = req.body as { venue_slug: string; question: string };
  const data = await kbQuery(venue_slug, question);
  res.json(data);
});

app.post('/v1/booking/create', async (req, res) => {
  const data = await createBooking(req.body);
  res.json(data);
});

app.post('/v1/transfer', async (req, res) => {
  const { venue_slug, category } = req.body as { venue_slug: string; category: string };
  res.json(transferCall(venue_slug, category));
});

app.post('/v1/email/auto-reply', async (req, res) => {
  const { venue_slug, to, subject, body } = req.body as { venue_slug: string; to: string; subject: string; body: string };
  const data = await emailAutoReply(venue_slug, to, subject, body);
  res.json(data);
});

// Call log endpoint for your voice assistant to write logs
app.post('/v1/call/log', async (req, res) => {
  const { venue_slug, caller, intent, summary, success } = (req.body || {}) as {
    venue_slug?: string; caller?: string; intent?: string; summary?: string; success?: boolean;
  };
  if (!venue_slug) return res.status(400).json({ ok: false, error: 'venue_slug required' });
  const data = await addCallLog({ venue_slug, caller, intent, summary, success });
  res.json(data);
});

app.listen(cfg.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API on :${cfg.port}`);
});
