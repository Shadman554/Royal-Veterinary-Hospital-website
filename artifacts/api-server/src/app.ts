import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRoyalApi } from "./royal-api.mjs";

// Resolve paths relative to this file's location so they work regardless of CWD.
// In dev the file lives at artifacts/api-server/src/app.ts → __dirname = .../artifacts/api-server/src
// In production the built file lives at artifacts/api-server/dist/index.mjs → __dirname = .../artifacts/api-server/dist
// We go up to the repo root and then navigate to the right paths.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// __dirname is .../artifacts/api-server/dist at runtime
const repoRoot = path.resolve(__dirname, "../../..");

const app = express();
app.disable("x-powered-by");
const production = process.env.NODE_ENV === "production";
if (production && !process.env.APP_ORIGIN)
  throw new Error("Set APP_ORIGIN to the HTTPS website origin for production.");
if (
  production &&
  process.env.APP_ORIGIN?.split(",").some(
    (value) => new URL(value.trim()).protocol !== "https:",
  )
)
  throw new Error("Production APP_ORIGIN must use HTTPS.");
// On Railway (and most PaaS platforms) the reverse proxy is NOT on loopback;
// trusting 1 hop correctly populates req.ip from X-Forwarded-For.
if (production) app.set("trust proxy", 1);
app.use((_req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "same-origin",
    "X-DNS-Prefetch-Control": "off",
    "X-Download-Options": "noopen",
    "X-Permitted-Cross-Domain-Policies": "none",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  });
  if (production)
    res.set({
      "Strict-Transport-Security": "max-age=31536000",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
    });
  next();
});
const { api } = createRoyalApi({
  databaseUrl: process.env.DATABASE_URL,
  databasePath:
    process.env.ROYAL_DATABASE || path.resolve(repoRoot, ".local/royal.sqlite"),
  setupKey: process.env.ROYAL_SETUP_KEY,
  origin:
    process.env.APP_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173",
  secure: production,
  assetsRoot: path.resolve(repoRoot, "artifacts/royal-veterinary-hospital/public"),
});
app.use("/api", api);
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API route not found." });
});
if (production) {
  const publicDir = path.resolve(repoRoot, "artifacts/royal-veterinary-hospital/dist/public");
  app.use((req, res, next) => {
    if (req.path.split("/").some((segment) => segment.startsWith("."))) {
      res.sendStatus(404);
      return;
    }
    if (req.path === "/admin") {
      res.set({ "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" });
    }
    next();
  });
  app.use(express.static(publicDir, {
    dotfiles: "deny",
    index: false,
    setHeaders(res, filePath) {
      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        const hashed = filePath.includes(`${path.sep}dist${path.sep}public${path.sep}assets${path.sep}`);
        res.setHeader("Cache-Control", hashed ? "public, max-age=31536000, immutable" : "public, max-age=3600");
      }
    },
  }));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}
export default app;
