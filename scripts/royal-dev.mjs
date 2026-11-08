import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync(
  "pnpm",
  ["--filter", "@workspace/api-server", "build"],
  { cwd: root, stdio: "inherit", shell: process.platform === "win32" },
);
if (result.status !== 0) process.exit(result.status || 1);
const children = [
  spawn(process.execPath, ["dist/index.mjs"], {
    cwd: path.join(root, "artifacts/api-server"),
    stdio: "inherit",
  }),
  spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "--config", "vite.config.ts"],
    {
      cwd: path.join(root, "artifacts/royal-veterinary-hospital"),
      stdio: "inherit",
    },
  ),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
for (const child of children) {
  child.on("error", () => stop(1));
  child.on("exit", (code) => stop(code || 0));
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
