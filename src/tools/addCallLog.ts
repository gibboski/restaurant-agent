import { db } from '../db';

export async function addCallLog(p: {
  venue_slug: string;
  caller?: string;
  intent?: string;
  summary?: string;
  success?: boolean;
}) {
  await db.query(
    'insert into call_logs(venue_slug, direction, caller, callee, transcript, summary, success) values($1,$2,$3,$4,$5,$6,$7)',
    [p.venue_slug, 'inbound', p.caller || '', '', '', p.summary || '', !!p.success]
  );
  return { ok: true };
}
