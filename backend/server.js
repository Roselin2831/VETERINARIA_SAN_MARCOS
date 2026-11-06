import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createDb } from './src/db.js';
import { createApp } from './src/app.js';

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const DB_FILE = process.env.DB_FILE || join(here, 'data', 'db.json');

const db = createDb(DB_FILE);
createApp(db).listen(PORT, () => {
  console.log(`API Veterinaria San Marcos lista en http://localhost:${PORT}/api/health`);
});
