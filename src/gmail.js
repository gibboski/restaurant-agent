"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
const googleapis_1 = require("googleapis");
const mail_composer_1 = __importDefault(require("nodemailer/lib/mail-composer"));
const config_1 = require("./config");
const oAuth2Client = new googleapis_1.google.auth.OAuth2(config_1.cfg.gmailClientId, config_1.cfg.gmailClientSecret);
oAuth2Client.setCredentials({ refresh_token: config_1.cfg.gmailRefreshToken });
const gmail = googleapis_1.google.gmail({ version: 'v1', auth: oAuth2Client });
async function sendMail({ to, subject, text }) {
    const mail = new mail_composer_1.default({ to, from: config_1.cfg.gmailUser, subject, text });
    const msg = await mail.compile().build();
    const encoded = Buffer.from(msg).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded } });
}
//# sourceMappingURL=gmail.js.map