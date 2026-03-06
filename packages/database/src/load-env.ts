import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

declare global {
  var __gameCryptoDatabaseEnvLoaded: boolean | undefined;
}

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath) || typeof process.loadEnvFile !== "function") {
    return;
  }

  process.loadEnvFile(filePath);
}

export function ensureDatabaseEnvLoaded(): void {
  if (globalThis.__gameCryptoDatabaseEnvLoaded) {
    return;
  }

  const currentFileDir = dirname(fileURLToPath(import.meta.url));
  const packageRoot = resolve(currentFileDir, "..");
  const workspaceRoot = resolve(packageRoot, "../..");

  const envCandidates = [
    resolve(workspaceRoot, ".env.local"),
    resolve(workspaceRoot, ".env"),
    resolve(packageRoot, ".env.local"),
    resolve(packageRoot, ".env"),
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), ".env"),
  ];

  for (const candidate of envCandidates) {
    loadEnvFile(candidate);
  }

  globalThis.__gameCryptoDatabaseEnvLoaded = true;
}
