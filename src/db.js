"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = require("pg");
const config_1 = require("./config");
exports.db = new pg_1.Pool({ connectionString: config_1.cfg.dbUrl });
//# sourceMappingURL=db.js.map