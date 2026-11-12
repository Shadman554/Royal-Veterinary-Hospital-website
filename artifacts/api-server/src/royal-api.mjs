import express from "express";
import { createDatabaseAdapter } from "./db-adapter.mjs";
import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from "node:fs";
import path from "node:path";
import { gzip } from "node:zlib";
import { promisify } from "node:util";
import catalog from "./catalog.json" with { type: "json" };
const statuses = ["new", "contacted", "confirmed", "completed", "cancelled"];
const gzipAsync = promisify(gzip);
const digest = (value) => createHash("sha256").update(value).digest("hex");
const hashPassword = (password, salt = randomBytes(16).toString("hex")) =>
  `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
const dummyPasswordHash = hashPassword(randomBytes(32).toString("hex"));
const verifyPassword = (password, stored) => {
  const [salt, hash] = stored.split(":");
  return timingSafeEqual(
    Buffer.from(hash, "hex"),
    scryptSync(password, salt, 64),
  );
};
const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baghdad" }).format(
    new Date(),
  );
const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};
function str(value, label, max = 200, optional = false) {
  if (
    typeof value !== "string" ||
    (!optional && !value.trim()) ||
    value.length > max
  )
    fail(`${label} is required and must be no longer than ${max} characters.`);
  return value.trim();
}
function date(value) {
  const result = str(value, "Date", 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(result) ||
    Number.isNaN(Date.parse(result)) ||
    new Date(result).toISOString().slice(0, 10) !== result
  )
    fail("Choose a valid date.");
  return result;
}
/**
 * @param {object} [options]
 * @param {string} [options.databaseUrl]
 * @param {string} [options.databasePath]
 * @param {string} [options.setupKey]
 * @param {string} [options.origin]
 * @param {boolean} [options.secure]
 * @param {string} [options.mediaDirectory]
 * @param {string} [options.assetsRoot]
 */
export function createRoyalApi({
  databaseUrl = process.env.DATABASE_URL,
  databasePath = path.resolve(".local/royal.sqlite"),
  setupKey = undefined,
  origin = "http://localhost:5173",
  secure = false,
  mediaDirectory = path.resolve(path.dirname(databasePath), "media"),
  assetsRoot = path.resolve("../royal-veterinary-hospital/public"),
} = {}) {
  const db = createDatabaseAdapter({ databaseUrl, databasePath });
  db.prepare(
    db.type === "postgres"
      ? "INSERT INTO content (id,json) VALUES (1,?) ON CONFLICT (id) DO NOTHING"
      : "INSERT OR IGNORE INTO content (id,json) VALUES (1,?)",
  ).run(JSON.stringify(catalog));

  const keyPath =
    databasePath === ":memory:" || db.type === "postgres"
      ? null
      : path.join(path.dirname(databasePath), "admin-setup-key.txt");
  let bootstrapKey = setupKey;
  const bootstrapReady = (async () => {
    const adminExists = await db.prepare("SELECT id FROM admins LIMIT 1").get();
    if (!adminExists && !bootstrapKey) {
      if (!keyPath) return;
      bootstrapKey = existsSync(keyPath)
        ? readFileSync(keyPath, "utf8").trim()
        : randomBytes(24).toString("hex");
      if (!existsSync(keyPath)) writeFileSync(keyPath, bootstrapKey, { mode: 0o600, flag: "wx" });
    }
  })();
  // The setup endpoints await initialization; avoid an unhandled rejection if the database is unavailable.
  bootstrapReady.catch(() => {});

  const api = express.Router();
  const originSet = new Set(
    origin.split(",").map((s) => new URL(s.trim()).origin),
  );
  const limit = async (key, max, ms) => {
    const now = Date.now();
    await db.prepare("DELETE FROM rate_limits WHERE expires <= ?").run(now);
    const result = await db.prepare(
      "INSERT INTO rate_limits (key, requests, expires) VALUES (?, 1, ?) ON CONFLICT (key) DO UPDATE SET requests = rate_limits.requests + 1 RETURNING requests",
    ).get(digest(key), now + ms);
    if (result.requests > max) fail("Too many attempts. Please try again later.", 429);
  };
  const audit = async (action) => {
    try {
      await db
        .prepare("INSERT INTO activity (action,created_at) VALUES (?,?)")
        .run(action, new Date().toISOString());
    } catch (e) {
      console.error("Audit error:", e);
    }
  };
  const getContent = async () => {
    const row = await db.prepare("SELECT * FROM content WHERE id=1").get();
    const saved = JSON.parse(row?.json || "{}");
    return {
      ...catalog,
      ...saved,
      settings: { ...catalog.settings, ...saved.settings },
      sections: { ...catalog.sections, ...saved.sections },
      sectionOrder: { ...catalog.sectionOrder, ...saved.sectionOrder },
      copy: { ...catalog.copy, ...saved.copy },
      media: { ...catalog.media, ...saved.media },
      version: row?.version || 1,
    };
  };
  api.use((req, res, next) => {
    res.set({
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "same-origin",
    });
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      if (!originSet.has(req.get("origin")))
        return res
          .status(403)
          .json({ error: "Request origin is not allowed." });
      if (req.path !== "/admin/media" && !req.is("application/json"))
        return res.status(415).json({ error: "Use application/json." });
    }
    next();
  });
  const parseStandard = express.json({ limit: "150kb" });
  const parseTranslations = express.json({ limit: "1mb" });
  api.use((req, res, next) =>
    (req.path.startsWith("/admin/content/") ? parseTranslations : parseStandard)(
      req,
      res,
      next,
    ),
  );
  api.use((req, res, next) => {
    if (
      req.path !== "/admin/media" &&
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
    )
      return res.status(400).json({ error: "Send a JSON object." });
    next();
  });
  const authenticate = async (req, res, next) => {
    try {
      const cookie = (req.headers.cookie || "")
        .split(";")
        .map((v) => v.trim())
        .find((v) => v.startsWith("royal_session="))
        ?.slice(14);
      if (!cookie) return res.status(401).json({ error: "Please sign in." });
      await db.prepare("DELETE FROM sessions WHERE expires < ?").run(Date.now());
      const session = await db
        .prepare(
          "SELECT admins.id,admins.email FROM sessions JOIN admins ON admins.id=sessions.admin_id WHERE token=? AND expires>?",
        )
        .get(digest(cookie), Date.now());
      if (!session)
        return res
          .status(401)
          .json({ error: "Your session has expired. Please sign in again." });
      req.admin = session;
      req.sessionToken = digest(cookie);
      next();
    } catch (err) {
      next(err);
    }
  };
  const signIn = async (res, admin) => {
    const token = randomBytes(32).toString("hex");
    await db.prepare("INSERT INTO sessions VALUES (?,?,?)").run(
      digest(token),
      admin.id,
      Date.now() + 8 * 60 * 60 * 1000,
    );
    res.cookie("royal_session", token, {
      httpOnly: true,
      sameSite: "strict",
      secure,
      path: "/api",
      maxAge: 8 * 60 * 60 * 1000,
    });
    res.json({ email: admin.email });
  };
  const imagePath = (value) => {
    const url = str(value, "Image", 220);
    if (
      /^[\w.-]+\.(svg|png|jpe?g|webp|gif)$/i.test(url) &&
      !url.includes("..")
    ) {
      if (
        !existsSync(
          path.resolve(assetsRoot, "rvh/assets", url),
        )
      )
        fail("Choose an existing image.");
      return url;
    }
    if (
      /^\/rvh\/assets\/[\w.-]+\.(svg|png|jpe?g|webp|gif)$/i.test(url) &&
      !url.includes("..")
    ) {
      if (
        !existsSync(
          path.resolve(assetsRoot, "." + url),
        )
      )
        fail("Choose an existing image.");
      return url;
    }
    if (
      /^\/api\/media\/[a-f0-9-]+\.(png|jpg|webp|gif)$/.test(url)
    )
      return url;
    fail("Choose a library image or upload a photograph.");
  };
  api.get("/media/:filename", async (req, res) => {
    if (!/^[a-f0-9-]+\.(png|jpg|webp|gif)$/.test(req.params.filename))
      return res.sendStatus(404);
    try {
      const row = await db
        .prepare("SELECT mime_type, bytes FROM media WHERE filename=?")
        .get(req.params.filename);
      if (row && row.bytes) {
        res.set("Content-Type", row.mime_type || "image/png");
        res.set("Cache-Control", "public, max-age=31536000, immutable");
        return res.send(Buffer.from(row.bytes));
      }
    } catch {}
    const filename = path.resolve(mediaDirectory, req.params.filename);
    if (existsSync(filename)) {
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      return res.sendFile(filename, { dotfiles: "allow" });
    }
    res.sendStatus(404);
  });
  api.post(
    "/admin/media",
    authenticate,
    express.raw({
      type: ["image/png", "image/jpeg", "image/webp", "image/gif"],
      limit: "8mb",
    }),
    async (req, res) => {
      await limit(`upload:${req.admin.id}`, 60, 60 * 60 * 1000);
      const bytes = req.body;
      if (!Buffer.isBuffer(bytes) || bytes.length < 12)
        fail("Upload a PNG, JPEG, WebP or GIF image.");
      let ext;
      let mimeType;
      if (
        bytes
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      ) {
        ext = "png";
        mimeType = "image/png";
      } else if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {
        ext = "jpg";
        mimeType = "image/jpeg";
      } else if (
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP"
      ) {
        ext = "webp";
        mimeType = "image/webp";
      } else if (["GIF87a", "GIF89a"].includes(bytes.toString("ascii", 0, 6))) {
        ext = "gif";
        mimeType = "image/gif";
      } else {
        fail("The file is not a supported image.");
      }
      const filename = `${randomUUID()}.${ext}`;
      await db
        .prepare("INSERT INTO media (filename, mime_type, bytes, created_at) VALUES (?,?,?,?)")
        .run(filename, mimeType, bytes, new Date().toISOString());
      await audit("Image uploaded");
      res.status(201).json({ src: `/api/media/${filename}` });
    },
  );
  let compressedContent;
  api.get("/content", async (req, res) => {
    const content = await getContent();
    res.vary("Accept-Encoding");
    if (req.get("Accept-Encoding") && req.acceptsEncodings("gzip")) {
      if (compressedContent?.version !== content.version) {
        compressedContent = { version: content.version, bytes: await gzipAsync(JSON.stringify(content)) };
      }
      res.type("application/json").set("Content-Encoding", "gzip");
      return res.send(compressedContent.bytes);
    }
    return res.json(content);
  });
  api.get("/admin/setup-status", async (_req, res) => {
    await bootstrapReady;
    const required = !(await db.prepare("SELECT id FROM admins LIMIT 1").get());
    if (required && secure && (!bootstrapKey || bootstrapKey.length < 32))
      fail("Configure a setup key of at least 32 characters on the server.", 503);
    res.json({ required });
  });
  api.post("/admin/setup", async (req, res) => {
    await bootstrapReady;
    await limit(`setup:${req.ip}`, 5, 15 * 60 * 1000);
    if (await db.prepare("SELECT id FROM admins LIMIT 1").get())
      fail("An administrator already exists.", 409);
    const key = str(req.body.setupKey, "Setup key", 100);
    if (
      !bootstrapKey ||
      !timingSafeEqual(
        Buffer.from(digest(key)),
        Buffer.from(digest(bootstrapKey)),
      )
    )
      fail("The setup key is incorrect.", 403);
    const email = str(req.body.email, "Email", 150).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      fail("Enter a valid email address.");
    const password = str(req.body.password, "Password", 128);
    if (password.length < 12)
      fail("Use a password with at least 12 characters.");
    if (secure && bootstrapKey.length < 32)
      fail("Configure a setup key of at least 32 characters on the server.", 503);
    const lockKey = digest("admin-bootstrap-lock");
    const now = Date.now();
    const lock = await db.prepare(
      "INSERT INTO rate_limits (key, requests, expires) VALUES (?, 1, ?) ON CONFLICT (key) DO UPDATE SET expires = excluded.expires WHERE rate_limits.expires <= ? RETURNING key",
    ).get(lockKey, now + 300000, now);
    if (!lock) fail("Administrator setup is already in progress.", 409);
    try {
      if (await db.prepare("SELECT id FROM admins LIMIT 1").get())
        fail("An administrator already exists.", 409);
      const admin = { id: randomUUID(), email };
      await db.prepare("INSERT INTO admins VALUES (?,?,?)").run(
        admin.id,
        email,
        hashPassword(password),
      );
      bootstrapKey = null;
      if (keyPath && existsSync(keyPath)) unlinkSync(keyPath);
      await audit("Administrator account created");
      await signIn(res, admin);
    } finally {
      await db.prepare("DELETE FROM rate_limits WHERE key = ?").run(lockKey);
    }
  });
  api.post("/admin/login", async (req, res) => {
    await limit(`login:${req.ip}`, 10, 15 * 60 * 1000);
    const email = str(req.body.email, "Email", 150).toLowerCase();
    const password = str(req.body.password, "Password", 128);
    const admin = await db.prepare("SELECT * FROM admins WHERE email=?").get(email);
    await limit(`login-account:${email}`, 30, 15 * 60 * 1000);
    const valid = verifyPassword(
      password,
      admin?.password || dummyPasswordHash,
    );
    if (!admin || !valid) fail("Email or password is incorrect.", 401);
    await signIn(res, admin);
  });
  api.get("/admin/session", authenticate, (req, res) =>
    res.json({ email: req.admin.email }),
  );
  api.post("/admin/logout", authenticate, async (req, res) => {
    await db.prepare("DELETE FROM sessions WHERE token=?").run(req.sessionToken);
    res.clearCookie("royal_session", {
      httpOnly: true,
      sameSite: "strict",
      secure,
      path: "/api",
    });
    res.json({ ok: true });
  });
  api.post("/admin/password", authenticate, async (req, res) => {
    await limit(`password:${req.admin.id}`, 5, 15 * 60 * 1000);
    const current = str(req.body.currentPassword, "Current password", 128);
    const password = str(req.body.password, "New password", 128);
    const admin = await db
      .prepare("SELECT * FROM admins WHERE id=?")
      .get(req.admin.id);
    if (!verifyPassword(current, admin.password))
      fail("Current password is incorrect.", 403);
    if (password.length < 12)
      fail("Use a password with at least 12 characters.");
    await db.prepare("UPDATE admins SET password=? WHERE id=?").run(
      hashPassword(password),
      admin.id,
    );
    await db.prepare("DELETE FROM sessions WHERE admin_id=?").run(admin.id);
    await audit("Administrator password changed");
    await signIn(res, admin);
  });
  api.post("/appointments", async (req, res) => {
    const body = req.body;
    if (body.website) fail("Unable to accept this request.");
    const requestKey = str(body.requestKey, "Request identifier", 80);
    if (!/^[a-zA-Z0-9-]{20,80}$/.test(requestKey))
      fail("Invalid request identifier.");
    const existing = await db
      .prepare("SELECT id FROM appointments WHERE request_key=?")
      .get(requestKey);
    if (existing) return res.json({ id: existing.id });
    await limit(`booking:${req.ip}`, 10, 60 * 60 * 1000);
    const content = await getContent();
    const data = {
      name: str(body.name, "Name", 100),
      phone: str(body.phone, "Phone", 25),
      pet: str(body.pet, "Pet name", 80),
      species: str(body.species, "Species", 30),
      service: str(body.service, "Service", 150),
      date: date(body.date),
      time: str(body.time, "Time", 40),
      notes: str(body.notes || "", "Notes", 1500, true),
      doctor: str(body.doctor || "", "Clinician", 100, true),
    };
    if (!/^\+?[0-9][0-9 ()-]{6,24}$/.test(data.phone))
      fail("Enter a valid phone number.");
    if (!["Dog", "Cat", "Bird", "Other"].includes(data.species))
      fail("Select a pet type.");
    if (
      !["Morning", "Afternoon", "Evening", "Any available time"].includes(
        data.time,
      )
    )
      fail("Select a preferred time.");
    if (
      data.date < today() ||
      data.date >
        new Date(Date.now() + 366 * 86400000).toISOString().slice(0, 10)
    )
      fail("Choose a date within the next year.");
    const choices = [
      ...content.services
        .filter((s) => s.category !== "emergency" && !s.hidden)
        .map((s) => s.title),
      ...content.plans
        .filter((p) => !p.hidden)
        .map((p) => `${p.name} package`),
      "Help choosing care",
    ];
    if (!choices.includes(data.service))
      fail("Choose a current service or care plan.");
    const id = randomUUID();
    const now = new Date().toISOString();
    await db.prepare(
      "INSERT INTO appointments(id,request_key,data,status,created_at,updated_at) VALUES (?,?,?,?,?,?)",
    ).run(id, requestKey, JSON.stringify(data), "new", now, now);
    await audit("New appointment request received");
    res.status(201).json({ id });
  });
  api.get("/admin/appointments", authenticate, async (_req, res) => {
    const rows = await db
      .prepare("SELECT * FROM appointments ORDER BY created_at DESC")
      .all();
    res.json(
      rows.map(({ data, request_key, ...row }) => ({
        ...row,
        ...JSON.parse(data),
      })),
    );
  });
  api.patch("/admin/appointments/:id", authenticate, async (req, res) => {
    if (
      !(await db.prepare("SELECT id FROM appointments WHERE id=?").get(req.params.id))
    )
      fail("Request not found.", 404);
    const status = str(req.body.status, "Status", 20);
    if (!statuses.includes(status)) fail("Invalid status.");
    const note = str(req.body.staff_note || "", "Staff note", 2000, true);
    const confirmedDate = req.body.confirmed_date
      ? date(req.body.confirmed_date)
      : "";
    const confirmedTime = str(
      req.body.confirmed_time || "",
      "Confirmed time",
      5,
      true,
    );
    if (confirmedTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(confirmedTime))
      fail("Enter a valid appointment time.");
    if (status === "confirmed" && (!confirmedDate || !confirmedTime))
      fail("Add an agreed date and time before confirming.");
    const result = await db
      .prepare(
        "UPDATE appointments SET status=?,staff_note=?,confirmed_date=?,confirmed_time=?,version=version+1,updated_at=? WHERE id=? AND version=?",
      )
      .run(
        status,
        note,
        confirmedDate,
        confirmedTime,
        new Date().toISOString(),
        req.params.id,
        Number(req.body.version),
      );
    if (!result.changes)
      fail("This request was updated elsewhere. Refresh before saving.", 409);
    await audit(
      `Appointment ${String(req.params.id).slice(0, 8)} updated to ${status}`,
    );
    res.json({ ok: true });
  });
  api.get("/admin/activity", authenticate, async (_req, res) => {
    const rows = await db.prepare("SELECT * FROM activity ORDER BY id DESC LIMIT 100").all();
    res.json(rows);
  });
  api.put("/admin/content/:section", authenticate, async (req, res) => {
    const section = req.params.section;
    const value = req.body.value;
    const current = await getContent();
    if (
      ![
        "settings",
        "sections",
        "sectionOrder",
        "homepageServices",
        "gallery",
        "services",
        "plans",
        "team",
        "faqs",
        "copy",
        "media",
        "categories",
        "categorySteps",
      ].includes(section)
    )
      fail("Unknown content section.", 404);
    let clean;
    if (section === "gallery") {
      if (!Array.isArray(value) || value.length > 100) fail("Use at most 100 gallery items.");
      clean = value.map((item) => {
        const id = str(item?.id, "Gallery ID", 36);
        if (!/^[a-f0-9-]{36}$/i.test(id)) fail("Invalid gallery item.");
        if (!["memories", "facilities"].includes(item?.category)) fail("Choose a gallery category.");
        return {
          id, category: item.category,
          image: imagePath(item.image),
          title: str(item.title, "Title", 150),
          description: str(item.description ?? "", "Description", 1000, true),
        };
      });
      if (new Set(clean.map((item) => item.id)).size !== clean.length) fail("Gallery items must be unique.");
    } else if (section === "sectionOrder") {
      if (!value || typeof value !== "object" || Array.isArray(value)) fail("Invalid section order.");
      clean = Object.fromEntries(Object.keys(catalog.sectionOrder).map((key) => {
        if (!Number.isInteger(value[key]) || value[key] < 0 || value[key] > 6) fail("Invalid section order.");
        return [key, value[key]];
      }));
    } else if (section === "homepageServices") {
      if (!Array.isArray(value) || value.length > 60 || new Set(value).size !== value.length ||
          value.some((slug) => typeof slug !== "string" || !current.services.some((service) => service.slug === slug)))
        fail("Choose up to 60 existing services.");
      if (req.body.homepageServiceCount !== undefined &&
          (typeof req.body.homepageServiceCount !== "string" || !/^(?:[1-9]|[1-5]\d|60)$/.test(req.body.homepageServiceCount)))
        fail("Homepage service count must be between 1 and 60.");
      clean = value;
    } else if (section === "sections") {
      if (!value || typeof value !== "object" || Array.isArray(value))
        fail("Invalid section visibility settings.");
      clean = Object.fromEntries(Object.keys(catalog.sections).map((key) => {
        const visible = value[key];
        if (typeof visible !== "boolean") fail("Each section needs a visibility setting.");
        return [key, visible];
      }));
    } else if (section === "copy") {
      const customTranslations = Object.entries(value || {}).filter(
        ([key]) => key.startsWith("ckb::") && !Object.hasOwn(catalog.copy, key),
      );
      if (customTranslations.length > 500)
        fail("Keep custom translations to 500 entries or fewer.");
      clean = Object.fromEntries([
        ...Object.keys(catalog.copy).map((key) => [
          key,
          str(value?.[key], "Page text", 5000, true),
        ]),
        ...customTranslations.map(([key, text]) => [
          str(key, "Translation source", 5005),
          str(text, "Kurdish translation", 5000, true),
        ]),
      ]);
    } else if (section === "media") {
      clean = Object.fromEntries(
        Object.entries(catalog.media).map(([key, original]) => [
          key,
          {
            label: original.label,
            src: imagePath(value?.[key]?.src),
            alt: str(value?.[key]?.alt ?? "", "Image description", 300, true),
          },
        ]),
      );
    } else if (section === "categories") {
      if (!Array.isArray(value) || value.length !== catalog.categories.length)
        fail("Keep the existing care categories.");
      clean = catalog.categories.map((original) => {
        const row = value.find((c) => c?.id === original.id);
        return {
          ...original,
          title: str(row?.title, "Category name", 100),
          short: str(row?.short, "Category description", 500),
          icon: imagePath(row?.icon),
        };
      });
    } else if (section === "categorySteps") {
      clean = Object.fromEntries(
        Object.keys(catalog.categorySteps).map((key) => {
          const rows = value?.[key];
          if (!Array.isArray(rows) || rows.length < 1 || rows.length > 8)
            fail("Use between 1 and 8 care steps.");
          return [
            key,
            rows.map((r) => [
              str(r?.[0], "Step title", 150),
              str(r?.[1], "Step description", 1500),
            ]),
          ];
        }),
      );
    } else if (section === "settings") {
      clean = Object.fromEntries(
        Object.keys(catalog.settings).map((key) => [
          key,
          str(value?.[key] ?? (["heroTypingSpeed", "homepageServiceCount"].includes(key) ? current.settings[key] : undefined), key, key === "heroDescription" ? 600 : 160),
        ]),
      );
      if (!/^(?:[2-9]\d|1[0-4]\d|150)$/.test(clean.heroTypingSpeed))
        fail("Headline speed must be between 20 and 150 milliseconds.");
      if (!/^(?:[1-9]|[1-5]\d|60)$/.test(clean.homepageServiceCount))
        fail("Homepage service count must be between 1 and 60.");
      if (!/^\+[1-9]\d{7,14}$/.test(clean.phone))
        fail("Phone must include a country code, for example +9647701234567.");
    } else if (section === "services") {
      if (!Array.isArray(value) || value.length < 1)
        fail("At least one service is required.");
      if (value.length > 60)
        fail("Maximum 60 services allowed.");
      clean = value.map((edited) => {
        const slug = str(edited.slug, "Service slug", 80);
        if (!/^[a-z0-9-]+$/.test(slug))
          fail("Service slug must only contain lowercase letters, numbers, and hyphens.");
        const base = current.services.find((s) => s.slug === slug) || {};
        if (
          !Array.isArray(edited.topics) ||
          edited.topics.length < 1 ||
          edited.topics.length > 12 ||
          !Array.isArray(edited.signs) ||
          edited.signs.length < 1 ||
          edited.signs.length > 15 ||
          !Array.isArray(edited.faqs) ||
          edited.faqs.length < 1 ||
          edited.faqs.length > 15
        )
          fail("Each service needs topics, reasons to visit and FAQs.");
        if (!catalog.categories.some((c) => c.id === edited.category))
          fail("Choose a care category.");
        if (
          !Array.isArray(edited.related) ||
          edited.related.length > 6 ||
          edited.related.some(
            (sSlug) => sSlug === slug,
          )
        )
          fail("Choose up to six other related services.");
        return {
          ...base,
          slug,
          category: edited.category,
          icon: imagePath(edited.icon),
          keywords: str(edited.keywords || "", "Search keywords", 500, true),
          hidden: Boolean(edited.hidden),
          topics: edited.topics.map((row) => [
            str(row?.[0], "Topic title", 150),
            str(row?.[1], "Topic description", 1500),
            imagePath(row?.[2]),
          ]),
          signs: edited.signs.map((text) => str(text, "Reason to visit", 500)),
          faqs: edited.faqs.map((row) => [
            str(row?.[0], "Question", 200),
            str(row?.[1], "Answer", 1500),
          ]),
          related: [...new Set(edited.related)],
          ...Object.fromEntries(
            ["title", "short", "intro", "prep", "after"].map((key) => [
              key,
              str(edited[key], key, key === "title" ? 100 : 1200),
            ]),
          ),
        };
      });
      if (
        new Set(clean.map((s) => s.slug.toLowerCase())).size !== clean.length
      )
        fail("Service slugs must be unique.");
      if (
        new Set(clean.map((s) => s.title.toLowerCase())).size !== clean.length
      )
        fail("Service names must be unique.");
    } else if (section === "plans") {
      if (!Array.isArray(value) || value.length < 1 || value.length > 12)
        fail("Keep between 1 and 12 care packages.");
      clean = value.map((p) => ({
        name: str(p.name, "Name", 80),
        label: str(p.label, "Label", 100),
        desc: str(p.desc, "Description", 500),
        price: str(p.price, "Price", 30),
        ...(p.hidden ? { hidden: true } : {}),
        features: (Array.isArray(p.features) ? p.features : []).map((f) =>
          str(f, "Inclusion", 200),
        ),
      }));
      if (
        clean.some(
          (p) =>
            !p.features.length ||
            p.features.length > 10 ||
            !/^\d[\d,]*$/.test(p.price),
        )
      )
        fail("Use a numeric IQD price and 1–10 inclusions.");
      if (new Set(clean.map((p) => p.name.toLowerCase())).size !== clean.length)
        fail("Package names must be unique.");
    } else if (section === "team") {
      if (!Array.isArray(value) || value.length < 1 || value.length > 12)
        fail("Add between 1 and 12 team members.");
      clean = value.map((row) => [
        str(row[0], "Name", 100),
        str(row[1], "Role", 150),
        str(row[2], "Specialty", 150),
        imagePath(row[3]),
      ]);
    } else {
      if (!Array.isArray(value) || value.length < 1 || value.length > 20)
        fail("Add between 1 and 20 questions.");
      clean = value.map((row) => [
        str(row[0], "Question", 200),
        str(row[1], "Answer", 1500),
      ]);
    }
    const { version, ...updated } = { ...current, [section]: clean };
    if (section === "homepageServices" && req.body.homepageServiceCount !== undefined)
      updated.settings = { ...current.settings, homepageServiceCount: req.body.homepageServiceCount };
    if (section === "services")
      updated.homepageServices = current.homepageServices.filter((slug) => clean.some((service) => service.slug === slug));
    // Update both languages with the same optimistic version check.
    if (section !== "copy" && req.body.translations !== undefined) {
      const edits = req.body.translations;
      if (!edits || typeof edits !== "object" || Array.isArray(edits))
        fail("Invalid translations.");
      updated.copy = { ...current.copy };
      for (const [key, text] of Object.entries(edits)) {
        if (!key.startsWith("ckb::") || !key.slice(5).trim() || key.length > 5005)
          fail("Invalid translation source.");
        updated.copy[key] = str(text, "Kurdish translation", 5000, true);
        if (!updated.copy[key] && !Object.hasOwn(catalog.copy, key)) delete updated.copy[key];
      }
      if (Object.keys(updated.copy).filter(k => k.startsWith("ckb::") && !Object.hasOwn(catalog.copy, k)).length > 500)
        fail("Keep custom translations to 500 entries or fewer.");
    }
    const result = await db
      .prepare(
        "UPDATE content SET json=?,version=version+1 WHERE id=1 AND version=?",
      )
      .run(JSON.stringify(updated), Number(req.body.version));
    if (!result.changes)
      fail("Website content changed elsewhere. Refresh before saving.", 409);
    await audit(`Website ${section} updated`);
    res.json(await getContent());
  });
  api.use((err, _req, res, _next) =>
    res.status(err.status || 500).json({
      error: err.status
        ? err.message
        : "The server could not complete the request. Please try again.",
    }),
  );
  return { api, db };
}
