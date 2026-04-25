import type { Page } from "playwright";
import type { CrawlMetadata } from "../../modules/crawl/crawl.types";

export async function extractMetadata(page: Page): Promise<CrawlMetadata> {
  const metadata = await page.evaluate(`
    (() => {
      const readMeta = (selector) =>
        document.querySelector(selector)?.getAttribute("content")?.trim() || null;

      const canonical = document.querySelector('link[rel="canonical"]')?.href?.trim() || null;

      return {
        title: document.title?.trim() || null,
        description: readMeta('meta[name="description"]'),
        canonical,
        ogTitle: readMeta('meta[property="og:title"]'),
        ogDescription: readMeta('meta[property="og:description"]'),
        ogImage: readMeta('meta[property="og:image"]'),
        twitterTitle: readMeta('meta[name="twitter:title"], meta[property="twitter:title"]'),
        twitterDescription: readMeta(
          'meta[name="twitter:description"], meta[property="twitter:description"]'
        )
      };
    })()
  `);

  return metadata as CrawlMetadata;
}
