import type { CrawlResult } from "@prisma/client";
import type { BrowserContextOptions, Page } from "playwright";
import { env } from "../../config/env";
import { launchCrawlerBrowser } from "../../lib/playwright";
import { AppError } from "../../shared/errors/AppError";
import { saveHtmlFile } from "../../shared/utils/file";
import { extractMetadata } from "../../shared/utils/metadata";
import {
  assertPublicHttpUrl,
  sanitizeHttpUrl,
  shouldBlockBrowserRequest
} from "../../shared/utils/url";
import { CrawlRepository } from "./crawl.repository";
import type {
  CrawlCreateResponse,
  CrawlDetailResponse,
  CrawlMetadata,
  PaginationMeta
} from "./crawl.types";

const browserContextOptions: BrowserContextOptions = {
  viewport: { width: 1440, height: 900 },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
};

export class CrawlService {
  constructor(private readonly repository = new CrawlRepository()) {}

  async crawl(rawUrl: string): Promise<CrawlCreateResponse> {
    const url = sanitizeHttpUrl(rawUrl);

    if (!env.ALLOW_PRIVATE_URLS) {
      await assertPublicHttpUrl(url);
    }

    const browser = await launchCrawlerBrowser();

    try {
      const context = await browser.newContext(browserContextOptions);
      const page = await context.newPage();
      page.setDefaultTimeout(env.CRAWL_TIMEOUT_MS);

      await registerRequestGuards(page);

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: env.CRAWL_TIMEOUT_MS
      });

      await waitForNetworkIdle(page);

      const metadata = await extractMetadata(page);
      const html = await page.content();
      const filePath = await saveHtmlFile(html, url);

      const saved = await this.repository.create({
        url,
        title: metadata.title,
        metadata,
        filePath
      });

      return toCreateResponse(saved);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Crawl failed.", 502, "CRAWL_FAILED", {
        cause: error instanceof Error ? error.message : String(error)
      });
    } finally {
      await browser.close().catch(() => undefined);
    }
  }

  async getById(id: string): Promise<CrawlDetailResponse> {
    const result = await this.repository.findById(id);

    if (!result) {
      throw new AppError("Crawl result not found.", 404, "CRAWL_RESULT_NOT_FOUND");
    }

    return toDetailResponse(result);
  }

  async list(
    page: number,
    limit: number
  ): Promise<{ items: CrawlDetailResponse[]; pagination: PaginationMeta }> {
    const { items, total } = await this.repository.findMany(page, limit);

    return {
      items: items.map(toDetailResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

async function registerRequestGuards(page: Page): Promise<void> {
  await page.route("**/*", async (route) => {
    if (shouldBlockBrowserRequest(route.request().url())) {
      await route.abort();
      return;
    }

    await route.continue();
  });
}

async function waitForNetworkIdle(page: Page): Promise<void> {
  await page
    .waitForLoadState("networkidle", {
      timeout: env.CRAWL_NETWORK_IDLE_TIMEOUT_MS
    })
    .catch(() => undefined);

  if (env.CRAWL_SETTLE_MS > 0) {
    await page.waitForTimeout(env.CRAWL_SETTLE_MS);
  }
}

function toCreateResponse(result: CrawlResult): CrawlCreateResponse {
  return {
    id: result.id,
    url: result.url,
    title: result.title,
    metadata: result.metadata as CrawlMetadata,
    filePath: result.filePath,
    createdAt: result.createdAt
  };
}

function toDetailResponse(result: CrawlResult): CrawlDetailResponse {
  return {
    ...toCreateResponse(result),
    updatedAt: result.updatedAt
  };
}
