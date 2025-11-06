import dotenv from 'dotenv';

dotenv.config({ path: '/app/ini.env' });

import Fastify from 'fastify';
import scriptsRoutes from './API.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';

const __filename = fileURLToPath(import.meta.url); // Ruta al archivo actual (index.js)
const __dirname = path.dirname(__filename)

const app = Fastify({
  logger: true
});

app.register(scriptsRoutes);

app.register(fastifyCookie);
app.register(fastifySession, {
  // ¡MUY IMPORTANTE! Añade SESSION_SECRET a tu archivo /app/ini.env
  // Debe ser una cadena larga y aleatoria (ej: 32 caracteres)
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: false, // Cambia a true si usas HTTPS
    httpOnly: true, // Impide que el JS del cliente lea la cookie
    sameSite: 'lax', // Protección estándar contra ataques CSRF
    maxAge: 3600000 // Tiempo de vida de la cookie 1 hora
  }
});

app.register(fastifyStatic, {
  root: path.join(__dirname, '../view'),
});

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