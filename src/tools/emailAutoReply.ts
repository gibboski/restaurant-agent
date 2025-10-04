import { db } from '../db';
import { sendMail } from '../gmail';
import { kbQuery } from './kbQuery';

export async function emailAutoReply(venue_slug:string, to:string, subject:string, body:string) {
  const q = body.slice(0, 500);
  const kb = await kbQuery(venue_slug, q);

  const answer = kb.contexts?.length
    ? `Hi,\n\n${kb.contexts[0].chunk}\n\nBest,\n${venue_slug} Team`
    : `Hi,\n\nThanks for reaching out—I've escalated this to the team.\n\nBest,\n${venue_slug} Team`;

  await sendMail({ to, subject:`Re: ${subject}`, text:answer });

  await db.query(
    `insert into email_logs(venue_slug, direction, sender, recipient, subject, body, summary, success)
     values($1,$2,$3,$4,$5,$6,$7,$8)`,
    [venue_slug,'out','bot',to,subject,answer,'auto-reply',true]
  );
  return { ok:true };
}
