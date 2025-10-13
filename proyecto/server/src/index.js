require('dotenv').config({ path: '../.env' });
const fastify = require('fastify')({ logger: true });

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST ;

fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Servidor escuchando en http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();