import { chromium, type Browser } from "playwright";
import { env } from "../config/env";

export async function launchCrawlerBrowser(): Promise<Browser> {
  return chromium.launch({
    headless: env.PLAYWRIGHT_HEADLESS,
    args: ["--disable-dev-shm-usage"]
  });
}
