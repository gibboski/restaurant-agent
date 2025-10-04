import OpenAI from 'openai';
import { cfg } from './config';
const client = new OpenAI({ apiKey: cfg.openaiKey });

export async function embed(texts: string[]): Promise<number[][]> {
  const resp = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });
  return resp.data.map(v => v.embedding as number[]);
}
