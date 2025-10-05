// src/index.ts
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
import { uploadMiddleware, handleUpload } from './kb/ingestFile';
import { addCallLog } from './tools/addCallLog';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) =>
  res.json({ ok: true, service: 'restaurant-agent', ts: new Date().toISOString() })
);

// ---------- Admin upload page ----------
app.get('/admin/upload', (_req, res) => {
  res.type('html').send(
    [
      '<!doctype html>',
      '<meta charset="utf-8"/>',
      '<title>Upload Venue FAQ</title>',
      '<style>body{font-family:ui-sans-serif,system-ui,Arial;padding:24px;max-width:720px;margin:auto}form{display:grid;gap:12px}</style>',
      '<h1>Upload Venue FAQ</h1>',
      '<form action="/v1/kb/ingest-file" method="post" enctype="multipart/form-data">',
      '<label>Venue slug<br><input name="venue_slug" required placeholder="venue123"/></label>',
      '<label>Source (label)<br><input name="source" placeholder="faq-2025-10"/></label>',
      '<label>File (PDF / DOCX / TXT, ≤15MB)<br><input type="file" name="file" accept=".pdf,.docx,.txt" required/></label>',
      '<button type="submit">Upload</button>',
      '</form>',
    ].join('')
  );
});

// File upload endpoint (handles PDF/DOCX/TXT)
app.post('/v1/kb/ingest-file', uploadMiddleware, handleUpload);

// ---------- JSON KB ingest (alternative) ----------
app.post('/v1/kb/ingest', async (req, res) => {
  const { venue_slug, texts, source } = req.body || {};
  if (!venue_slug || !Array.isArray(texts)) {
    return res.status(400).json({ ok: false, error: 'bad payload' });
  }
  const vecs = await embed(texts);
  const pairs = vecs.map((v, i) => ({
    id: `${venue_slug}-${Date.now()}-${i}`,
    values: v,
    metadata: { chunk: texts[i], venue_slug, source: source || 'upload' },
  }));
  await upsertVectors(pairs);
  await db.query(
    'insert into kb_chunks(venue_slug, source, chunk) select $1,$2,unnest($3::text[])',
    [venue_slug, source || 'upload', texts]
  );
  res.json({ ok: true, upserted: texts.length });
});

// ---------- KB query ----------
app.post('/v1/kb/query', async (req, res) => {
  const { venue_slug, question } = req.body || {};
  if (!venue_slug || !question) {
    return res.status(400).json({ ok: false, error: 'bad payload' });
  }
  const data = await kbQuery(venue_slug, question);
  res.json(data);
});

// ---------- Booking ----------
app.post('/v1/booking/create', async (req, res) => {
  const data = await createBooking(req.body);
  res.json(data);
});

// ---------- Transfer ----------
app.post('/v1/transfer', async (req, res) => {
  const { venue_slug, category } = req.body || {};
  if (!venue_slug || !category) {
    return res.status(400).json({ ok: false, error: 'bad payload' });
  }
  res.json(transferCall(venue_slug, category));
});

// ---------- Email auto-reply ----------
app.post('/v1/email/auto-reply', async (req, res) => {
  const { venue_slug, to, subject, body } = req.body || {};
  if (!venue_slug || !to || !subject || typeof body !== 'string') {
    return res.status(400).json({ ok: false, error: 'bad payload' });
  }
  const data = await emailAutoReply(venue_slug, to, subject, body);
  res.json(data);
});

// ---------- Call logs ----------
app.post('/v1/call/log', async (req, res) => {
  const { venue_slug, caller, intent, summary, success } = req.body || {};
  if (!venue_slug) return res.status(400).json({ ok: false, error: 'missing venue_slug' });
  const data = await addCallLog({ venue_slug, caller, intent, summary, success });
  res.json(data);
});

app.listen(cfg.port, () => console.log(`API on :${cfg.port}`));
