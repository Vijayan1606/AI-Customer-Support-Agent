import { mkdtempSync, writeFileSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const scriptPath = resolve("scripts/guard-no-drizzle-push.mjs");
const tempDirs: string[] = [];

function runGuard(root: string) {
  return spawnSync(process.execPath, [scriptPath, root], {
    encoding: "utf8",
  });
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});

describe("guard-no-drizzle-push", () => {
  it("passes for the committed starter scaffold", () => {
    const result = runGuard(process.cwd());

    expect(result.status).toBe(0);
  });

  it("fails when package scripts contain the banned Drizzle command", () => {
    const root = mkdtempSync(join(tmpdir(), "drizzle-push-guard-"));
    tempDirs.push(root);
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({ scripts: { db: ["drizzle-kit", "push"].join(" ") } }),
    );

    const result = runGuard(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Banned Drizzle command found");
  });

  it("fails when package scripts contain a whitespace variant of the banned Drizzle command", () => {
    const root = mkdtempSync(join(tmpdir(), "drizzle-push-whitespace-"));
    tempDirs.push(root);
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({ scripts: { db: "drizzle-kit   push" } }),
    );

    const result = runGuard(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Banned Drizzle command found");
  });

  it("fails when package scripts pass flags before the banned Drizzle command", () => {
    const root = mkdtempSync(join(tmpdir(), "drizzle-push-flags-"));
    tempDirs.push(root);
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({
        scripts: { db: "drizzle-kit --config drizzle.config.ts push" },
      }),
    );

    const result = runGuard(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Banned Drizzle command found");
  });

  it("fails when workflow commands contain the banned Drizzle command", async () => {
    const root = mkdtempSync(join(tmpdir(), "drizzle-push-workflow-"));
    tempDirs.push(root);
    await mkdir(join(root, ".github/workflows"), { recursive: true });
    writeFileSync(
      join(root, ".github/workflows/build.yml"),
      `steps:\n  - run: ${["drizzle-kit", "push"].join(" ")}\n`,
    );

    const result = runGuard(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Banned Drizzle command found");
  });

  it("fails when helper scripts contain the banned Drizzle command", async () => {
    const root = mkdtempSync(join(tmpdir(), "drizzle-push-script-"));
    tempDirs.push(root);
    await mkdir(join(root, "scripts"), { recursive: true });
    writeFileSync(
      join(root, "scripts/migrate.mjs"),
      `execSync("drizzle-kit push");`,
    );

    const result = runGuard(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Banned Drizzle command found");
  });

  it("fails when template source files contain the banned Drizzle command", async () => {
    const root = mkdtempSync(join(tmpdir(), "drizzle-push-source-"));
    tempDirs.push(root);
    await mkdir(join(root, "server"), { recursive: true });
    writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: {} }));
    writeFileSync(
      join(root, "server/db.ts"),
      "drizzle-kit --config ./drizzle.config.ts push",
    );

    const result = runGuard(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Banned Drizzle command found");
  });

  it("fails when drizzle config contains the banned Drizzle command", () => {
    const root = mkdtempSync(join(tmpdir(), "drizzle-push-config-"));
    tempDirs.push(root);
    writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: {} }));
    writeFileSync(join(root, "drizzle.config.ts"), "drizzle-kit push");

    const result = runGuard(root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Banned Drizzle command found");
  });

  it("ignores test files that contain banned-command fixtures", async () => {
    const root = mkdtempSync(join(tmpdir(), "drizzle-push-test-file-"));
    tempDirs.push(root);
    await mkdir(join(root, "scripts"), { recursive: true });
    writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: {} }));
    writeFileSync(join(root, "scripts/guard.test.ts"), "drizzle-kit push");

    const result = runGuard(root);

    expect(result.status).toBe(0);
  });
});
