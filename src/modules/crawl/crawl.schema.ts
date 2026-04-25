import { z } from "zod";

export const crawlRequestSchema = z.object({
  url: z.string().trim().min(1).max(2048).url()
});

export const crawlParamsSchema = z.object({
  id: z.string().uuid()
});

export const crawlListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});
