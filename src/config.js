"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfg = void 0;
require("dotenv/config");
exports.cfg = {
    port: Number(process.env.PORT || 8080),
    openaiKey: process.env.OPENAI_API_KEY,
    pineconeKey: process.env.PINECONE_API_KEY,
    pineconeEnv: process.env.PINECONE_ENV,
    pineconeIndex: process.env.PINECONE_INDEX, // 'kb-index'
    dbUrl: process.env.DATABASE_URL,
    gmailClientId: process.env.GMAIL_CLIENT_ID,
    gmailClientSecret: process.env.GMAIL_CLIENT_SECRET,
    gmailRefreshToken: process.env.GMAIL_REFRESH_TOKEN,
    gmailUser: process.env.GMAIL_USER,
};
//# sourceMappingURL=config.js.map