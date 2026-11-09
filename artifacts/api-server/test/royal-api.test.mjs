import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createRoyalApi } from "../src/royal-api.mjs";

test("Royal API: authentication, booking workflow, content and persistence", async (t) => {
  const directory = mkdtempSync(path.join(tmpdir(), "royal-api-test-"));
  const databasePath = path.join(directory, ".local", "test.sqlite");
  const runtime = createRoyalApi({
    databasePath,
    setupKey: "test-only-bootstrap-key",
    origin: "http://localhost:5173",
  });
  const app = express();
  app.use("/api", runtime.api);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  let cookie = "";
  let content;
  let appointment;
  async function request(
    url,
    method = "GET",
    body,
    auth = true,
    origin = "http://localhost:5173",
  ) {
    const response = await fetch(base + url, {
      method,
      headers: {
        "Content-Type": "application/json",
        origin,
        ...(auth ? { cookie } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json();
    return { response, data };
  }
  try {
    await t.test(
      "private records require a session and mutations require the trusted origin",
      async () => {
        assert.equal(
          (await request("/admin/appointments")).response.status,
          401,
        );
        assert.equal((await request("/admin/activity")).response.status, 401);
        assert.equal(
          (
            await request(
              "/admin/setup",
              "POST",
              {},
              false,
              "https://untrusted.example",
            )
          ).response.status,
          403,
        );
        assert.equal(
          (await request("/admin/content/settings", "PUT", {})).response.status,
          401,
        );
      },
    );
    await t.test(
      "one-time setup requires the server key and issues a protected cookie",
      async () => {
        assert.equal(
          (
            await request("/admin/setup", "POST", {
              setupKey: "wrong",
              email: "qa@example.test",
              password: "A-test-password-123",
            })
          ).response.status,
          403,
        );
        const result = await request("/admin/setup", "POST", {
          setupKey: "test-only-bootstrap-key",
          email: "qa@example.test",
          password: "A-test-password-123",
        });
        assert.equal(result.response.status, 200);
        const setCookie = result.response.headers.get("set-cookie");
        assert.match(setCookie, /HttpOnly/);
        assert.match(setCookie, /SameSite=Strict/);
        cookie = setCookie.split(";")[0];
        assert.equal(
          (
            await request("/admin/setup", "POST", {
              setupKey: "test-only-bootstrap-key",
            })
          ).response.status,
          409,
        );
        assert.equal(
          (await request("/admin/session")).data.email,
          "qa@example.test",
        );
        assert.equal(
          (
            await request("/admin/login", "POST", {
              email: "qa@example.test",
              password: "wrong",
            })
          ).response.status,
          401,
        );
      },
    );
    await t.test(
      "public bookings validate dates, service choices and avoid duplicate retries",
      async () => {
        content = (await request("/content")).data;
        assert.equal(content.services.length, 29);
        assert.equal("appointments" in content, false);
        const body = {
          requestKey: randomUUID(),
          name: "QA Owner",
          phone: "07700000000",
          pet: "QA Milo",
          species: "Cat",
          service: "Pet consultation",
          date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          time: "Morning",
          notes: "Test only",
        };
        assert.equal(
          (
            await request(
              "/appointments",
              "POST",
              { ...body, date: "2026-02-30" },
              false,
            )
          ).response.status,
          400,
        );
        assert.equal(
          (
            await request(
              "/appointments",
              "POST",
              { ...body, service: "Emergency pet care" },
              false,
            )
          ).response.status,
          400,
        );
        const result = await request("/appointments", "POST", body, false);
        assert.equal(result.response.status, 201);
        appointment = result.data.id;
        assert.deepEqual(
          (await request("/appointments", "POST", body, false)).data,
          result.data,
        );
        const rows = (await request("/admin/appointments")).data;
        assert.equal(rows.length, 1);
        assert.equal(rows[0].status, "new");
        assert.equal("request_key" in rows[0], false);
      },
    );
    await t.test(
      "confirmation requires agreed timing, supports notes, and rejects stale edits",
      async () => {
        assert.equal(
          (
            await request(`/admin/appointments/${appointment}`, "PATCH", {
              status: "confirmed",
              version: 1,
            })
          ).response.status,
          400,
        );
        const update = {
          status: "confirmed",
          confirmed_date: new Date(Date.now() + 86400000)
            .toISOString()
            .slice(0, 10),
          confirmed_time: "10:30",
          staff_note: "Owner contacted by staff",
          version: 1,
        };
        assert.equal(
          (await request(`/admin/appointments/${appointment}`, "PATCH", update))
            .response.status,
          200,
        );
        assert.equal(
          (await request(`/admin/appointments/${appointment}`, "PATCH", update))
            .response.status,
          409,
        );
        assert.equal(
          (await request("/admin/appointments")).data[0].staff_note,
          update.staff_note,
        );
      },
    );
    await t.test(
      "content changes reach the public API and concurrent edits are rejected",
      async () => {
        const settings = {
          ...content.settings,
          phone: "+9647700000001",
          phoneDisplay: "0770 000 0001",
          heroLine1: "QA persisted heading",
          heroTypingSpeed: "90",
          homepageServiceCount: "3",
        };
        const saved = await request("/admin/content/settings", "PUT", {
          value: settings,
          translations: { "ckb::QA persisted heading": "سەردێڕی نوێ" },
          version: content.version,
        });
        assert.equal(saved.response.status, 200);
        assert.equal((await request("/content")).data.settings.heroTypingSpeed, "90");
        assert.equal((await request("/content")).data.settings.homepageServiceCount, "3");
        assert.equal(
          (await request("/admin/content/settings", "PUT", {
            value: { ...settings, homepageServiceCount: "6" },
            version: saved.data.version,
          })).response.status,
          400,
        );
        assert.equal(
          (await request("/admin/content/settings", "PUT", {
            value: { ...settings, heroTypingSpeed: "999" },
            version: saved.data.version,
          })).response.status,
          400,
        );
        assert.equal((await request("/content")).data.copy["ckb::QA persisted heading"], "سەردێڕی نوێ");
        assert.equal(
          (await request("/content")).data.settings.heroLine1,
          "QA persisted heading",
        );
        assert.equal(
          (
            await request("/admin/content/settings", "PUT", {
              value: settings,
              translations: { "ckb::QA persisted heading": "stale translation" },
              version: content.version,
            })
          ).response.status,
          409,
        );
        assert.equal((await request("/content")).data.copy["ckb::QA persisted heading"], "سەردێڕی نوێ");
        assert.ok(
          (await request("/admin/activity")).data.some(
            (a) => a.action === "Website settings updated",
          ),
        );
        assert.equal(
          (
            await request("/admin/content/settings", "PUT", {
              value: { ...settings, phone: "javascript:bad" },
              version: saved.data.version,
            })
          ).response.status,
          400,
        );
      },
    );
    await t.test(
      "every content editor persists its changes and protects service routes",
      async () => {
        let latest = (await request("/content")).data;
        for (const section of ["services", "plans", "team", "faqs"]) {
          const value = structuredClone(latest[section]);
          if (section === "services")
            value[0].short = "A saved service introduction.";
          if (section === "plans") value[0].price = "125,000";
          if (section === "team") value[0][1] = "Clinical lead";
          if (section === "faqs")
            value[0][1] = "An updated answer from the hospital team.";
          const saved = await request(`/admin/content/${section}`, "PUT", {
            value,
            version: latest.version,
          });
          assert.equal(saved.response.status, 200, section);
          latest = (await request("/content")).data;
          assert.deepEqual(latest[section], value);
        }
        const invalid = structuredClone(latest.services);
        invalid[0].slug = "invalid slug with spaces!";
        assert.equal(
          (
            await request("/admin/content/services", "PUT", {
              value: invalid,
              version: latest.version,
            })
          ).response.status,
          400,
        );
        assert.equal(
          (await request("/appointments", "POST", [])).response.status,
          400,
        );
        // Test hiding and removing services and packages
        const customServices = structuredClone(latest.services);
        customServices[0].hidden = true;
        const savedHiddenService = await request("/admin/content/services", "PUT", {
          value: customServices,
          version: latest.version,
        });
        assert.equal(savedHiddenService.response.status, 200);
        latest = (await request("/content")).data;
        assert.equal(latest.services[0].hidden, true);

        const customPlans = structuredClone(latest.plans);
        customPlans[0].hidden = true;
        const savedHiddenPlan = await request("/admin/content/plans", "PUT", {
          value: customPlans,
          version: latest.version,
        });
        assert.equal(savedHiddenPlan.response.status, 200);
        latest = (await request("/content")).data;
        assert.equal(latest.plans[0].hidden, true);

        // Booking a hidden service is rejected
        const hiddenBooking = await request("/appointments", "POST", {
          name: "Test User",
          phone: "+9647701234567",
          pet: "Milo",
          species: "dog",
          service: latest.services[0].title,
          date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          time: "10:00",
          notes: "Routine visit",
        });
        assert.equal(hiddenBooking.response.status, 400);

        // Restore unhidden for following tests
        customServices[0].hidden = false;
        await request("/admin/content/services", "PUT", {
          value: customServices,
          version: latest.version,
        });
        latest = (await request("/content")).data;
      },
    );
    await t.test(
      "image uploads, portraits, full guides and page text persist safely",
      async () => {
        const imageBytes = Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aONsAAAAASUVORK5CYII=",
          "base64",
        );
        const upload = (body, type = "image/png", authenticated = true) =>
          fetch(base + "/admin/media", {
            method: "POST",
            headers: {
              origin: "http://localhost:5173",
              "Content-Type": type,
              ...(authenticated ? { cookie } : {}),
            },
            body,
          });
        assert.equal(
          (await upload(imageBytes, "image/png", false)).status,
          401,
        );
        assert.equal(
          (
            await upload(
              Buffer.from('<svg onload="alert(1)"></svg>'),
              "image/svg+xml",
            )
          ).status,
          400,
        );
        const uploaded = await upload(imageBytes);
        assert.equal(uploaded.status, 201);
        const { src } = await uploaded.json();
        const image = await fetch(base.replace(/\/api$/, "") + src);
        assert.equal(image.status, 200);
        assert.match(image.headers.get("content-type"), /image\/png/);
        assert.deepEqual(Buffer.from(await image.arrayBuffer()), imageBytes);
        let latest = (await request("/content")).data;
        const sections = {
          team: latest.team.map((row, i) =>
            i === 0 ? [...row.slice(0, 3), src] : row,
          ),
          media: {
            ...latest.media,
            heroDesktop: {
              ...latest.media.heroDesktop,
              src,
              alt: "New hero photo",
            },
          },
          copy: {
            ...latest.copy,
            "A ROYAL WELCOME": "Welcome to our hospital",
            "ckb::Home": "ماڵەوە",
            "ckb::New staff specialty": "پسپۆڕی نوێی ستاف",
          },
          categories: latest.categories.map((row, i) =>
            i === 1 ? { ...row, short: "Updated wellness care" } : row,
          ),
          categorySteps: {
            ...latest.categorySteps,
            wellness: [["Updated step", "Updated instructions"]],
          },
          services: latest.services.map((row, i) =>
            i === 0
              ? {
                  ...row,
                  topics: [["Updated topic", "Updated explanation", src]],
                  faqs: [["New question?", "New answer"]],
                  signs: ["Updated reason"],
                  related: ["general-care"],
                }
              : row,
          ),
        };
        for (const [section, value] of Object.entries(sections)) {
          const saved = await request("/admin/content/" + section, "PUT", {
            value,
            version: latest.version,
          });
          assert.equal(
            saved.response.status,
            200,
            section + ": " + JSON.stringify(saved.data.error),
          );
          latest = saved.data;
          assert.deepEqual(latest[section], value);
        }
        assert.equal(
          (
            await request("/admin/content/team", "PUT", {
              version: latest.version,
              value: [
                ["Bad", "Role", "Focus", "https://untrusted.example/photo.jpg"],
              ],
            })
          ).response.status,
          400,
        );
        assert.equal(
          (
            await request("/admin/content/media", "PUT", {
              version: latest.version,
              value: {
                ...latest.media,
                heroDesktop: {
                  ...latest.media.heroDesktop,
                  src: "/api/media/../../secret.png",
                },
              },
            })
          ).response.status,
          400,
        );
      },
    );
    await t.test(
      "password changes revoke old sessions and logout revokes the current session",
      async () => {
        const oldCookie = cookie;
        const result = await request("/admin/password", "POST", {
          currentPassword: "A-test-password-123",
          password: "A-new-test-password-456",
        });
        assert.equal(result.response.status, 200);
        cookie = oldCookie;
        assert.equal((await request("/admin/session")).response.status, 401);
        cookie = result.response.headers.get("set-cookie").split(";")[0];
        assert.equal(
          (await request("/admin/logout", "POST", {})).response.status,
          200,
        );
        assert.equal((await request("/admin/session")).response.status, 401);
        assert.equal(
          (
            await request("/admin/login", "POST", {
              email: "qa@example.test",
              password: "A-test-password-123",
            })
          ).response.status,
          401,
        );
        assert.equal(
          (
            await request("/admin/login", "POST", {
              email: "qa@example.test",
              password: "A-new-test-password-456",
            })
          ).response.status,
          200,
        );
      },
    );
    await t.test(
      "records survive closing and reopening the database",
      async () => {
        runtime.db.close();
        const reopened = createRoyalApi({
          databasePath,
          origin: "http://localhost:5173",
        });
        assert.equal(
          reopened.db
            .prepare("SELECT count(*) AS count FROM appointments")
            .get().count,
          1,
        );
        assert.equal(
          JSON.parse(reopened.db.prepare("SELECT json FROM content").get().json)
            .settings.heroLine1,
          "QA persisted heading",
        );
        reopened.db.close();
      },
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
    try {
      runtime.db.close();
    } catch {}
    rmSync(directory, { recursive: true, force: true });
  }
});
