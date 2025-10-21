import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Esto crea una ruta absoluta a tu archivo .env
const __filename = fileURLToPath(import.meta.url); // Ruta al archivo actual (index.js)
const __dirname = path.dirname(__filename); // Ruta a la carpeta (src/scripts)

// Sube dos niveles (../../) para llegar a la raíz del proyecto
const envPath = path.resolve(__dirname, '../../ini.env'); 
dotenv.config({ path: envPath });

import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import scriptsRoutes from './server.js';

const app = Fastify({
  logger: true
});

app.register(fastifyCookie);

app.register(fastifySession, {
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: false
  },
  expires: 1800000 // 30 minutos
});

app.register(scriptsRoutes);

const PORT = process.env.PORT;
const HOST = process.env.HOST;

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