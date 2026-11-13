import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

// Select current sources explicitly: old ignored bundles must never count as tests.
const sources = readdirSync(new URL("../tests/", import.meta.url))
  .filter((name) => name.endsWith(".test.ts"))
  .sort();
if (!sources.length) throw new Error("No test sources found");

const build = spawnSync(
  "bun",
  [
    "build",
    ...sources.map((name) => `./tests/${name}`),
    "--target=node",
    "--format=esm",
    "--outdir=.test-build",
    "--entry-naming=[name].mjs",
  ],
  { stdio: "inherit" },
);
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

const tests = spawnSync(
  process.execPath,
  [
    "--test",
    ...sources.map((name) => `.test-build/${name.replace(/\.ts$/, ".mjs")}`),
  ],
  { stdio: "inherit" },
);
if (tests.error) throw tests.error;
process.exit(tests.status ?? 1);
