// src/kb/ingestFile.ts
import type { Request, Response } from 'express';
import path from 'node:path';
import { db } from '../db';
import { embed } from '../embeddings';
import { upsertVectors } from '../vector';

// Use CommonJS-style requires to avoid TS type issues for these libs
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
  const paras = t.split(/\n{2,}/g); // split on blank lines
  let buf = '';
  for (const p of paras) {
    const add = buf ? `${buf}\n\n${p}` : p;
    if (add.length <= max) {
      buf = add;
    } else {
      if (buf) chunks.push(buf);
      if (p.length <= max) {
        chunks.push(p);
      } else {
        for (let i = 0; i < p.length; i += max) chunks.push(p.slice(i, i + max));
      }
      buf = '';
    }
  }
  if (buf) chunks.push(buf);
  return chunks.filter(Boolean);
}

async function extractText(buffer: Buffer, filename: string, mimetype?: string): Promise<string> {
  const ext = (path.extname(filename || '') || '').toLowerCase();
  if (ext === '.pdf' || mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return (data && data.text) || '';
  }
  if (ext === '.docx' || mimetype === 'application/vnd.open
