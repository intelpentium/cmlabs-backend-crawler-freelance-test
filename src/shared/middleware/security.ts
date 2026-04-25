import helmet from "@fastify/helmet";
import type { FastifyInstance } from "fastify";

export async function registerSecurity(app: FastifyInstance) {
  await app.register(helmet, {
    contentSecurityPolicy: false
  });
}
