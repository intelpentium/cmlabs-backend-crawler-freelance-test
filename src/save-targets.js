const path = require("path");
const { crawlWebsite, saveCrawlResult, slugFromUrl } = require("./crawler");

const targets = [
  "https://cmlabs.co",
  "https://sequence.day",
  "https://vercel.com"
];

async function main() {
  for (const url of targets) {
    const result = await crawlWebsite(url);
    const outputPath = path.join(
      process.cwd(),
      "output",
      `${slugFromUrl(result.finalUrl)}.html`
    );
    const saved = await saveCrawlResult(result, outputPath);
    console.log(
      JSON.stringify(
        {
          url: saved.url,
          finalUrl: saved.finalUrl,
          title: saved.title,
          outputPath: saved.outputPath,
          crawledAt: saved.crawledAt
        },
        null,
        2
      )
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
