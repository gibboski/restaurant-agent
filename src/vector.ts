import { Pinecone } from '@pinecone-database/pinecone';
import { cfg } from './config';

const pc = new Pinecone({ apiKey: cfg.pineconeKey });
const index = pc.index(cfg.pineconeIndex);

export async function upsertVectors(pairs: {id:string; values:number[]; metadata:any}[]) {
  await index.upsert(pairs);
}
export async function queryVector(values:number[], topK=5) {
  return index.query({ vector: values, topK, includeMetadata: true });
}