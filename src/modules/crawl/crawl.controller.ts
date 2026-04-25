import type { FastifyReply, FastifyRequest } from "fastify";
import { CrawlService } from "./crawl.service";
import {
  crawlListQuerySchema,
  crawlParamsSchema,
  crawlRequestSchema
} from "./crawl.schema";

const crawlService = new CrawlService();

export async function createCrawlResult(request: FastifyRequest, reply: FastifyReply) {
  const body = crawlRequestSchema.parse(request.body);
  const data = await crawlService.crawl(body.url);

  return reply.status(201).send({
    success: true,
    data
  });
}

export async function getCrawlResult(request: FastifyRequest, reply: FastifyReply) {
  const params = crawlParamsSchema.parse(request.params);
  const data = await crawlService.getById(params.id);

  return reply.send({
    success: true,
    data
  });
}

export async function listCrawlResults(request: FastifyRequest, reply: FastifyReply) {
  const query = crawlListQuerySchema.parse(request.query);
  const data = await crawlService.list(query.page, query.limit);

  return reply.send({
    success: true,
    data: data.items,
    pagination: data.pagination
  });
}
