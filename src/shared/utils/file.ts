import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env";

export async function saveHtmlFile(html: string, sourceUrl: string): Promise<string> {
  const fileName = createHtmlFileName(sourceUrl);
  const absoluteFilePath = path.join(env.FILE_STORAGE_DIR, fileName);

  await fs.mkdir(env.FILE_STORAGE_DIR, { recursive: true });
  await fs.writeFile(absoluteFilePath, html, "utf8");

  return toPortableRelativePath(absoluteFilePath);
}

function createHtmlFileName(sourceUrl: string): string {
  const { hostname } = new URL(sourceUrl);
  const safeHostname = hostname
    .replace(/^www\./, "")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  return `${safeHostname}-${timestamp}-${randomUUID()}.html`;
}

function toPortableRelativePath(filePath: string): string {
  const relativePath = path.relative(process.cwd(), filePath);

  return relativePath.split(path.sep).join("/");
}
