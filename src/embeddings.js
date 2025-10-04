"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.embed = embed;
const openai_1 = __importDefault(require("openai"));
const config_1 = require("./config");
const client = new openai_1.default({ apiKey: config_1.cfg.openaiKey });
async function embed(texts) {
    const resp = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
    });
    return resp.data.map(v => v.embedding);
}
//# sourceMappingURL=embeddings.js.map