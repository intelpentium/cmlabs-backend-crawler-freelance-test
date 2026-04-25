import type { CrawlResult, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import type { CrawlMetadata } from "./crawl.types";

type CreateCrawlResultInput = {
  url: string;
  title: string | null;
  metadata: CrawlMetadata;
  filePath: string;
};

export class CrawlRepository {
  create(data: CreateCrawlResultInput): Promise<CrawlResult> {
    return prisma.crawlResult.create({
      data: {
        url: data.url,
        title: data.title,
        metadata: data.metadata as unknown as Prisma.InputJsonValue,
        filePath: data.filePath
      }
    });
  }

  findById(id: string): Promise<CrawlResult | null> {
    return prisma.crawlResult.findUnique({
      where: { id }
    });
  }

  async findMany(page: number, limit: number): Promise<{ items: CrawlResult[]; total: number }> {
    const skip = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
      prisma.crawlResult.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.crawlResult.count()
    ]);

    return { items, total };
  }
}
