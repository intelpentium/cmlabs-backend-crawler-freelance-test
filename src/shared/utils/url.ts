import { lookup } from "node:dns/promises";
import net from "node:net";
import { AppError } from "../errors/AppError";

const MAX_URL_LENGTH = 2048;

export function sanitizeHttpUrl(rawUrl: string): string {
  const value = rawUrl.trim();

  if (!value || value.length > MAX_URL_LENGTH) {
    throw new AppError("URL is required and must be at most 2048 characters.", 400, "INVALID_URL");
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new AppError("URL must be a valid absolute URL.", 400, "INVALID_URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new AppError("Only HTTP and HTTPS URLs are allowed.", 400, "INVALID_URL_PROTOCOL");
  }

  if (parsed.username || parsed.password) {
    throw new AppError("URL credentials are not allowed.", 400, "INVALID_URL_CREDENTIALS");
  }

  parsed.hash = "";
  parsed.hostname = parsed.hostname.toLowerCase();

  return parsed.toString();
}

export async function assertPublicHttpUrl(url: string): Promise<void> {
  const parsed = new URL(url);
  const hostname = parsed.hostname;

  if (isBlockedHostname(hostname)) {
    throw new AppError("Private or local URLs are not allowed.", 400, "PRIVATE_URL_NOT_ALLOWED");
  }

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new AppError("Private or local URLs are not allowed.", 400, "PRIVATE_URL_NOT_ALLOWED");
    }

    return;
  }

  let addresses: Array<{ address: string }>;

  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new AppError("URL hostname could not be resolved.", 400, "URL_HOST_NOT_RESOLVED");
  }

  if (addresses.some(({ address }) => isPrivateIp(address))) {
    throw new AppError("Private or local URLs are not allowed.", 400, "PRIVATE_URL_NOT_ALLOWED");
  }
}

export function shouldBlockBrowserRequest(url: string): boolean {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return true;
  }

  if (["data:", "blob:"].includes(parsed.protocol)) {
    return false;
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return true;
  }

  return isBlockedHostname(parsed.hostname) || isPrivateIp(parsed.hostname);
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();

  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized === "0.0.0.0" ||
    normalized === "::"
  );
}

function isPrivateIp(address: string): boolean {
  const version = net.isIP(address);

  if (version === 4) {
    return isPrivateIpv4(address);
  }

  if (version === 6) {
    return isPrivateIpv6(address);
  }

  return false;
}

function isPrivateIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);
  const first = parts[0];
  const second = parts[1];

  if (first === undefined || second === undefined) {
    return true;
  }

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isPrivateIpv6(address: string): boolean {
  const normalized = address.toLowerCase();

  if (normalized.startsWith("::ffff:")) {
    return isPrivateIpv4(normalized.replace("::ffff:", ""));
  }

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}
