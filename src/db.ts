import { Pool } from 'pg';
import { cfg } from './config';
export const db = new Pool({ connectionString: cfg.dbUrl });
