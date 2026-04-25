import type { FastifyInstance } from "fastify";
import {
  createCrawlResult,
  getCrawlResult,
  listCrawlResults
} from "./crawl.controller";

export async function crawlRoutes(app: FastifyInstance) {
  app.post("/", createCrawlResult);
  app.get("/", listCrawlResults);
  app.get("/:id", getCrawlResult);
}
