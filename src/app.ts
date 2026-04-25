import Fastify from "fastify";
import { env } from "./config/env";
import { crawlRoutes } from "./modules/crawl/crawl.routes";
import { errorHandler } from "./shared/errors/errorHandler";
import { registerRequestLogger } from "./shared/middleware/requestLogger";
import { registerSecurity } from "./shared/middleware/security";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL
    }
  });

  app.setErrorHandler(errorHandler);
  registerRequestLogger(app);
  await registerSecurity(app);

  app.get("/health", async () => ({
    success: true,
    data: {
      status: "ok"
    }
  }));

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      success: false,
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "Route not found."
      }
    });
  });

  await app.register(crawlRoutes, { prefix: "/crawl" });

  return app;
}
