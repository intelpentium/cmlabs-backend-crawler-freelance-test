import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { buildApp } from "./app";

async function start() {
  const app = await buildApp();

  const shutdown = async () => {
    app.log.info("Shutting down server");
    await app.close();
    await prisma.$disconnect();
  };

  process.once("SIGINT", () => {
    void shutdown().then(() => process.exit(0));
  });

  process.once("SIGTERM", () => {
    void shutdown().then(() => process.exit(0));
  });

  await app.listen({
    host: env.HOST,
    port: env.PORT
  });
}

start().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
