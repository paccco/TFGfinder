import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import Fastify from 'fastify';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = Fastify({
  logger: true
});

const PORT = process.env.PORT;
const HOST = process.env.HOST;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/', (req, res) => {
  const html = readFileSync(join(__dirname, '../view/login.html'), 'utf8');
  res.type('text/html').send(html);
});

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`Servidor escuchando en http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
