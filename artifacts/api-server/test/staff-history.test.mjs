import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createRoyalApi } from "../src/royal-api.mjs";

test("staff access is restricted and content history restores safely", async () => {
  const runtime = createRoyalApi({ databasePath: ":memory:", setupKey: "test-only-bootstrap-key", origin: "http://localhost:5173" });
  const app = express();
  app.use("/api", runtime.api);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function request(path, method = "GET", body, cookie = "") {
    const response = await fetch(base + path, { method, headers: { "Content-Type": "application/json", origin: "http://localhost:5173", cookie }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { response, data: await response.json() };
  }
  try {
    const setup = await request("/admin/setup", "POST", { setupKey: "test-only-bootstrap-key", email: "admin@example.test", password: "Strong-admin-password" });
    assert.equal(setup.response.status, 200);
    const admin = setup.response.headers.get("set-cookie").split(";")[0];
    const created = await request("/admin/staff", "POST", { email: "staff@example.test", password: "Strong-staff-password" }, admin);
    assert.equal(created.response.status, 201);
    const login = await request("/admin/login", "POST", { email: "staff@example.test", password: "Strong-staff-password" });
    assert.equal(login.data.role, "staff");
    const staff = login.response.headers.get("set-cookie").split(";")[0];
    assert.equal((await request("/admin/appointments", "GET", undefined, staff)).response.status, 200);
    for (const url of ["/admin/staff", "/admin/history", "/admin/activity", "/admin/media"]) assert.equal((await request(url, "GET", undefined, staff)).response.status, 403);
    assert.equal((await request("/admin/content/settings", "PUT", {}, staff)).response.status, 403);
    const before = (await request("/content")).data;
    const saved = await request("/admin/content/settings", "PUT", { version: before.version, value: { ...before.settings, city: "New city" } }, admin);
    assert.equal(saved.response.status, 200);
    const history = await request("/admin/history", "GET", undefined, admin);
    assert.equal(history.data[0].version, before.version);
    assert.equal((await request(`/admin/history/${before.version}/restore`, "POST", { version: before.version }, admin)).response.status, 409);
    const restored = await request(`/admin/history/${before.version}/restore`, "POST", { version: saved.data.version }, admin);
    assert.equal(restored.data.settings.city, before.settings.city);
    assert.equal((await request(`/admin/staff/${created.data.id}`, "DELETE", {}, admin)).response.status, 200);
    assert.equal((await request("/admin/session", "GET", undefined, staff)).response.status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await runtime.db.close();
  }
});
