const fs = require("fs/promises");
const path = require("path");
const puppeteer = require("puppeteer");

const DEFAULT_VIEWPORT = { width: 1440, height: 900 };

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const { scrollHeight } = document.body;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 200);
    });
  });
}

async function waitForPageToSettle(page, settleTimeMs = 2500) {
  try {
    await page.waitForNetworkIdle({ idleTime: 1000, timeout: 15000 });
  } catch (_) {
    // Some sites keep long-lived connections open; a fallback pause is safer.
  }

  await delay(settleTimeMs);
}

async function crawlWebsite(url, options = {}) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(options.viewport || DEFAULT_VIEWPORT);
    await page.setUserAgent(
      options.userAgent ||
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: options.timeoutMs || 45000
    });

    await waitForPageToSettle(page, options.settleTimeMs);
    await autoScroll(page);
    await waitForPageToSettle(page, options.settleTimeMs);

    const html = await page.content();
    const title = await page.title();
    const finalUrl = page.url();

    return {
      url,
      finalUrl,
      title,
      html,
      crawledAt: new Date().toISOString()
    };
  } finally {
    await browser.close();
  }
}

async function saveCrawlResult(result, outputPath) {
  await ensureDir(outputPath);
  await fs.writeFile(outputPath, result.html, "utf8");

  return {
    ...result,
    outputPath
  };
}

function slugFromUrl(url) {
  const { hostname } = new URL(url);
  return hostname.replace(/^www\./, "").replace(/[^\w.-]+/g, "-");
}

module.exports = {
  crawlWebsite,
  saveCrawlResult,
  slugFromUrl
};
