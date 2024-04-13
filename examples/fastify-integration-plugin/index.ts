import { makeServer } from './server';

async function start() {
  const server = await makeServer();
  try {
    await server.listen({ port: 3000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
