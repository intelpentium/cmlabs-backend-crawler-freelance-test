import type { FastifyInstance } from "fastify";

export function registerRequestLogger(app: FastifyInstance) {
  app.addHook("onResponse", (request, reply, done) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTimeMs: Math.round(reply.elapsedTime)
      },
      "request completed"
    );

    done();
  });
}
