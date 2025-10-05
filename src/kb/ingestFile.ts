// src/kb/ingestFile.ts
import type { Request, Response } from 'express';
import path from 'node:path';
import { db } from '../db';
import { embed } from '../embeddings';
import { upsertVectors } from '../vector';

// Use CommonJS-style requires to avoid TS type hassles for these libs
// eslint-disable-next-line @typescript-eslint/no-var-requires
const multer = require('multer');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mammoth = require('mammoth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB
});

function chunkText(t: string, max = 1500): string[] {
  const chunks: string[] = [];
  // Prefer splitting on paragraph boundaries first
  const paras = t.split(/\n{2,}/g);
  let buf = '';
  for (const p of paras) {
    if ((buf + '\n\n' + p).length <= max) {
      buf = buf ? buf + '\n\n' + p : p;
    } else {
      if (buf) chunks.push(buf);
      if (p.length <= max) {
        chunks.push(p);
      } else {
        // hard split long paragraph
        for (let i = 0; i < p.length; i += max) chunks.push(p.slice(i, i + max));
      }
      buf = '';
    }
  }
  if (buf) chunks.push(buf);
  return chunks.filter(Boolean);
}

async function extractText(buffer: Buffer, filename: string, mimetype?: string): Promise<string> {
  const ext = path.extname(filename || '').toLowerCase();
  if (ext === '.pdf' || mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return (data && data.text) || '';
  }
  if (ext === '.docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const r = await mammoth.extractRawText({ buffer });
    return (r && r.value) || '';
  }
  // default: treat as text
  return buffer.toString('utf8');
}

export const uploadMiddleware = upload.single('file');

export async function handleUpload(req: Request, res: Response) {
  try {
    const { venue_slug, source } = (req.body as any) || {};
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!venue_slug) return res.status(400).send('Missing venue_slug');
    if (!file) return res.status(400).send('Missing file');

    const text = await extractText(file.buffer, file.originalname, file.mimetype);
    if (!text || !text.trim()) return res.status(400).send('Could not extract any text from file');

    const chunks = chunkText(text);
    const vecs = await embed(chunks);
    const pairs = vecs.map((v, i) => ({
      id: `${venue_slug}-${Date.now()}-${i}`,
      values: v,
      metadata: { chunk: chunks[i], venue_slug, source: source || 'upload-file' }
    }));

    await upsertVectors(pairs);
    await db.query(
      'insert into kb_chunks(venue_slug, source, chunk) select $1,$2,unnest($3::text[])',
      [venue_slug, source || 'upload-file', chunks]
    );

    res.status(200).send(
      `<!doctype html>
      <meta charset="utf-8"/>
      <style>body{font-family:ui-sans-serif,system-ui,Arial;padding:24px;max-width:700px;margin:auto}</style>
      <h1>Upload complete</h1>
      <p><b>Venue:</b> ${venue_slug}</p>
      <p><b>File:</b> ${file.originalname}</p>
      <p><b>Chunks ingested:</b> ${chunks.length}</p>
      <p><a href="/admin/upload">Back to upload</a></p>`
    );
  } catch (e:any) {
    console.error(e);
    res.status(500).send(`Upload failed: ${e?.message || e}`);
  }
}
