import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createRoyalApi } from "../src/royal-api.mjs";

test("encrypted backup restores a consistent database and rejects tampering", async () => {
  process.env.ROYAL_BACKUP_KEY = "b2".repeat(32);
  const runtime = createRoyalApi({ databasePath: ":memory:", setupKey: "test-only-bootstrap-key", origin: "http://localhost:5173" });
  const app = express(); app.use("/api", runtime.api); const server = app.listen(0, "127.0.0.1"); await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function request(path, method = "GET", body, cookie = "") { return fetch(base + path, { method, headers: { "Content-Type": "application/json", origin: "http://localhost:5173", cookie }, ...(body ? { body: JSON.stringify(body) } : {}) }); }
  try {
    const credentials = { email: "admin@example.test", password: "Strong-admin-password" };
    const setup = await request("/admin/setup", "POST", { ...credentials, setupKey: "test-only-bootstrap-key" }); const cookie = setup.headers.get("set-cookie").split(";")[0];
    const before = await (await request("/content")).json();
    const exportResponse = await request("/admin/backup/export", "POST", { password: credentials.password }, cookie);
    assert.equal(exportResponse.status, 200); const bytes = Buffer.from(await exportResponse.arrayBuffer()); assert.equal(bytes.subarray(0, 5).toString(), "RVHB1"); assert.equal(bytes.includes(Buffer.from("admin@example.test")), false);
    const changed = await request("/admin/content/settings", "PUT", { version: before.version, value: { ...before.settings, city: "Changed city" } }, cookie); assert.equal(changed.status, 200);
    const corrupted = Buffer.from(bytes); corrupted[corrupted.length - 1] ^= 1;
    assert.equal((await request("/admin/backup/restore", "POST", { password: credentials.password, backup: corrupted.toString("base64") }, cookie)).status, 400);
    assert.equal((await (await request("/content")).json()).settings.city, "Changed city");
    assert.equal((await request("/admin/backup/restore", "POST", { password: credentials.password, backup: bytes.toString("base64") }, cookie)).status, 200);
    assert.equal((await (await request("/content")).json()).settings.city, before.settings.city);
    assert.equal((await request("/admin/session", "GET", undefined, cookie)).status, 401);
    assert.equal((await request("/admin/login", "POST", credentials)).status, 200);
  } finally { await new Promise((resolve) => server.close(resolve)); await runtime.db.close(); delete process.env.ROYAL_BACKUP_KEY; }
});
