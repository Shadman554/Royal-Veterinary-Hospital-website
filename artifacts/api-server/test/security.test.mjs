import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRoyalApi } from "../src/royal-api.mjs";
import { createDatabaseAdapter } from "../src/db-adapter.mjs";

const origin = "http://localhost:5173";
async function start(databasePath) {
  const runtime = createRoyalApi({ databasePath, setupKey: "test-only-bootstrap-key", origin });
  const app = express();
  app.use("/api", runtime.api);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const request = async (route, body, requestOrigin = origin) => {
    const response = await fetch(base + route, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: requestOrigin },
      body: JSON.stringify(body),
    });
    return response;
  };
  return { runtime, server, request, base };
}
async function close(instance) {
  await new Promise((resolve) => instance.server.close(resolve));
  await instance.runtime.db.close();
}

test("setup, request origins and rate limits remain protected after a restart", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "royal-security-"));
  const databasePath = path.join(directory, "hospital.sqlite");
  let instance = await start(databasePath);
  try {
    const details = { setupKey: "test-only-bootstrap-key", email: "staff@example.test", password: "a-long-test-password" };
    const response = await instance.request("/admin/setup", details, "https://attacker.example");
    assert.equal(response.status, 403);
    const simultaneous = await Promise.all([instance.request("/admin/setup", details), instance.request("/admin/setup", { ...details, email: "second@example.test" })]);
    assert.deepEqual(simultaneous.map((item) => item.status).sort(), [200, 409]);
    const count = await instance.runtime.db.prepare("SELECT count(*) AS count FROM admins").get();
    assert.equal(count.count, 1);
    const privateResponse = await fetch(instance.base + "/admin/appointments");
    assert.equal(privateResponse.status, 401);
    assert.equal(privateResponse.headers.get("access-control-allow-origin"), null);
    for (let i = 0; i < 6; i++) assert.equal((await instance.request("/admin/login", { email: details.email, password: "incorrect" })).status, 401);
    await close(instance);
    instance = await start(databasePath);
    for (let i = 0; i < 4; i++) assert.equal((await instance.request("/admin/login", { email: details.email, password: "incorrect" })).status, 401);
    assert.equal((await instance.request("/admin/login", { email: details.email, password: "incorrect" })).status, 429);
  } finally {
    await close(instance);
    rmSync(directory, { recursive: true, force: true });
  }
});

test("external PostgreSQL URLs cannot disable certificate verification", () => {
  for (const url of ["postgresql://example.org/db?sslmode=disable", "postgresql://example.org/db?ssl=0", "postgresql://example.org/db?sslmode=require"]) {
    assert.throws(() => createDatabaseAdapter({ databaseUrl: url }), /certificate and hostname verification/);
  }
});
