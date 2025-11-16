import type { FastifyPluginAsync } from 'fastify';

import { getRoute } from './handlers/get';

export const petRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(getRoute);
};
