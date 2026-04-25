const express = require("express");
const path = require("path");
const { crawlWebsite, saveCrawlResult, slugFromUrl } = require("./crawler");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/crawl", async (req, res) => {
  const { url, outputPath } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: "Field 'url' is required." });
  }

  try {
    const result = await crawlWebsite(url);
    const filePath =
      outputPath ||
      path.join(process.cwd(), "output", `${slugFromUrl(result.finalUrl)}.html`);
    const saved = await saveCrawlResult(result, filePath);

    return res.json({
      message: "Crawl completed.",
      url: saved.url,
      finalUrl: saved.finalUrl,
      title: saved.title,
      outputPath: saved.outputPath,
      crawledAt: saved.crawledAt
    });
  } catch (error) {
    return res.status(500).json({
      error: "Crawl failed.",
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Crawler API listening on http://localhost:${port}`);
});
