import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const scriptPath = resolve("scripts/maybe-migrate.mjs");
const tempDirs: string[] = [];

function createEnv(overrides: NodeJS.ProcessEnv) {
  const env = { ...process.env, ...overrides };

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete env[key];
    }
  }

  return env;
}

function createFixture() {
  const dir = mkdtempSync(join(tmpdir(), "maybe-migrate-"));
  tempDirs.push(dir);
  mkdirSync(join(dir, "node_modules/.bin"), { recursive: true });
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify(
      {
        type: "module",
        scripts: {
          "db:migrate": "drizzle-kit migrate",
        },
      },
      null,
      2,
    ),
  );
  writeFileSync(
    join(dir, "node_modules/.bin/drizzle-kit"),
    `#!/usr/bin/env node\nimport { writeFileSync } from "node:fs";\nwriteFileSync("${join(dir, "migration-invoked").split("\\").join("\\\\")}", process.argv.slice(2).join(" "));\n`,
    { mode: 0o755 },
  );
  return dir;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});

describe("maybe-migrate", () => {
  it("does not run drizzle migrations for main branch containers", () => {
    const cwd = createFixture();
    const result = spawnSync(process.execPath, [scriptPath], {
      cwd,
      env: createEnv({
        DATABASE_URL_UNPOOLED: "postgres://user:pass@example.com/db",
        FUSION_BRANCH_KIND: "main",
      }),
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(() =>
      readFileSync(join(cwd, "migration-invoked"), "utf8"),
    ).toThrow();
  });

  it("does not run drizzle migrations when branch kind is unset", () => {
    const cwd = createFixture();
    const result = spawnSync(process.execPath, [scriptPath], {
      cwd,
      env: createEnv({
        DATABASE_URL_UNPOOLED: "postgres://user:pass@example.com/db",
        FUSION_BRANCH_KIND: undefined,
      }),
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(() =>
      readFileSync(join(cwd, "migration-invoked"), "utf8"),
    ).toThrow();
  });

  it("does not run drizzle migrations for unexpected branch kinds", () => {
    const cwd = createFixture();
    const result = spawnSync(process.execPath, [scriptPath], {
      cwd,
      env: createEnv({
        DATABASE_URL_UNPOOLED: "postgres://user:pass@example.com/db",
        FUSION_BRANCH_KIND: "production",
      }),
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(() =>
      readFileSync(join(cwd, "migration-invoked"), "utf8"),
    ).toThrow();
  });

  it("does not run drizzle migrations for feature containers without an unpooled database URL", () => {
    const cwd = createFixture();
    const result = spawnSync(process.execPath, [scriptPath], {
      cwd,
      env: createEnv({
        DATABASE_URL_UNPOOLED: undefined,
        FUSION_BRANCH_KIND: "feature",
      }),
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(() =>
      readFileSync(join(cwd, "migration-invoked"), "utf8"),
    ).toThrow();
  });

  it("runs drizzle migrations for feature branch containers with an unpooled database URL", () => {
    const cwd = createFixture();
    const result = spawnSync(process.execPath, [scriptPath], {
      cwd,
      env: createEnv({
        DATABASE_URL_UNPOOLED: "postgres://user:pass@example.com/db",
        FUSION_BRANCH_KIND: "feature",
      }),
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(readFileSync(join(cwd, "migration-invoked"), "utf8")).toBe(
      "migrate",
    );
  });
});
