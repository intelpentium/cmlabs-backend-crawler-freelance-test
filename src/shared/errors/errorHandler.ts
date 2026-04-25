import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { env } from "../../config/env";
import { AppError } from "./AppError";

type ErrorPayload = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof ZodError) {
    const payload: ErrorPayload = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request payload.",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      }
    };

    return reply.status(400).send(payload);
  }

  if (error instanceof AppError) {
    const payload: ErrorPayload = {
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    };

    if (error.details && (error.statusCode < 500 || env.NODE_ENV !== "production")) {
      payload.error.details = error.details;
    }

    const logLevel = error.statusCode >= 500 ? "error" : "warn";
    request.log[logLevel]({ err: error }, error.message);

    return reply.status(error.statusCode).send(payload);
  }

  request.log.error({ err: error }, "Unhandled application error");

  return reply.status(500).send({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error."
    }
  } satisfies ErrorPayload);
}
