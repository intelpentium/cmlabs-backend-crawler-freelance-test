import { prisma } from "../lib/prisma";
import { CrawlService } from "../modules/crawl/crawl.service";

const targets = ["https://cmlabs.co", "https://nextjs.org"];

async function main() {
  const service = new CrawlService();

  for (const url of targets) {
    const result = await service.crawl(url);
    console.log(
      JSON.stringify(
        {
          id: result.id,
          url: result.url,
          title: result.title,
          filePath: result.filePath,
          createdAt: result.createdAt
        },
        null,
        2
      )
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
