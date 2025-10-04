import { google } from 'googleapis';
import MailComposer from 'nodemailer/lib/mail-composer';
import { cfg } from './config';

const oAuth2Client = new google.auth.OAuth2(cfg.gmailClientId, cfg.gmailClientSecret);
oAuth2Client.setCredentials({ refresh_token: cfg.gmailRefreshToken });
const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

export async function sendMail({to, subject, text}:{to:string; subject:string; text:string;}) {
  const mail = new MailComposer({ to, from: cfg.gmailUser, subject, text });
  const msg = await mail.compile().build();
  const encoded = Buffer.from(msg).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded } });
}
