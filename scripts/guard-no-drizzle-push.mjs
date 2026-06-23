import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const bannedCommandPattern = /\bdrizzle-kit\b[^\r\n]*\bpush\b/;
const root = resolve(process.argv[2] ?? process.cwd());
const candidatePaths = [
  resolve(root, "package.json"),
  resolve(root, "drizzle.config.ts"),
  resolve(root, "scripts"),
  resolve(root, "server"),
  resolve(root, "client"),
  resolve(root, "shared"),
  resolve(root, ".github/workflows"),
];
const workflowExtensions = new Set([".yml", ".yaml"]);
const sourceExtensions = new Set([
  ".cjs",
  ".js",
  ".jsx",
  ".mjs",
  ".sh",
  ".ts",
  ".tsx",
]);
const testFilePattern = /(?:^|[\\/])[^\\/]+\.test\.[cm]?[jt]sx?$/;
const guardFilePattern = /(?:^|[\\/])guard-no-drizzle-push\.mjs$/;

function getExtension(filePath) {
  const index = filePath.lastIndexOf(".");
  return index === -1 ? "" : filePath.slice(index);
}

function collectFiles(path) {
  try {
    const stats = statSync(path);

    if (stats.isFile()) {
      if (testFilePattern.test(path) || guardFilePattern.test(path)) {
        return [];
      }

      return path.endsWith("package.json") ||
        workflowExtensions.has(getExtension(path)) ||
        sourceExtensions.has(getExtension(path))
        ? [path]
        : [];
    }

    if (!stats.isDirectory()) {
      return [];
    }

    return readdirSync(path).flatMap((entry) =>
      collectFiles(resolve(path, entry)),
    );
  } catch (error) {
    if (error?.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

const scannedFiles = [...new Set(candidatePaths.flatMap(collectFiles))];
const offenders = scannedFiles.filter((filePath) =>
  bannedCommandPattern.test(readFileSync(filePath, "utf8")),
);

if (offenders.length > 0) {
  console.error(`Banned Drizzle command found in:\n${offenders.join("\n")}`);
  process.exit(1);
}
