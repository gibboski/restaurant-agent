import { embed } from '../embeddings';
import { queryVector } from '../vector';

export async function kbQuery(venue_slug:string, question:string) {
  const [vec] = await embed([question]);
  const hits = await queryVector(vec, 5);
  return {
    ok:true,
    contexts: hits.matches?.map(m => ({
      chunk: (m.metadata as any)?.chunk || '',
      score: m.score
    })) || []
  };
}
