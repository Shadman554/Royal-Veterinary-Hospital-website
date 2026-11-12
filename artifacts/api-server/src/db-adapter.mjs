import { DatabaseSync } from "node:sqlite";
import { chmodSync, closeSync, mkdirSync, openSync } from "node:fs";
import path from "node:path";
import pg from "pg";

if (pg?.types?.setTypeParser) {
  pg.types.setTypeParser(20, (val) => Number(val));
}

export function createDatabaseAdapter({ databaseUrl, databasePath = ".local/royal.sqlite" }) {
  if (databaseUrl && !/^(postgres|postgresql):\/\//i.test(databaseUrl)) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection URL.");
  }
  if (databaseUrl) {
    const { Pool } = pg;
    const url = new URL(databaseUrl);
    const hostname = url.hostname.toLowerCase();
    const privateHost = ["localhost", "127.0.0.1", "[::1]"].includes(hostname) || hostname.endsWith(".railway.internal");
    const sslmode = url.searchParams.get("sslmode");
    const ssl = url.searchParams.get("ssl");
    if (!privateHost && ((sslmode && sslmode !== "verify-full") || ssl === "0" || ssl === "false" || url.searchParams.get("uselibpqcompat") === "true")) {
      throw new Error("External PostgreSQL connections require certificate and hostname verification.");
    }
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: privateHost ? false : { rejectUnauthorized: true },
    });

    let initPromise = null;
    const ensureInit = () => {
      if (!initPromise) {
        initPromise = (async () => {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS admins (
              id TEXT PRIMARY KEY,
              email TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL
            );
            ALTER TABLE admins ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin';
            CREATE TABLE IF NOT EXISTS sessions (
              token TEXT PRIMARY KEY,
              admin_id TEXT NOT NULL,
              expires BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS rate_limits (
              key TEXT PRIMARY KEY,
              requests INTEGER NOT NULL,
              expires BIGINT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS rate_limits_expires_idx ON rate_limits (expires);
            CREATE TABLE IF NOT EXISTS content (
              id INTEGER PRIMARY KEY CHECK(id=1),
              json TEXT NOT NULL,
              version INTEGER NOT NULL DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS content_history (version INTEGER PRIMARY KEY, json TEXT NOT NULL, saved_at TEXT NOT NULL, actor TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS appointments (
              id TEXT PRIMARY KEY,
              request_key TEXT UNIQUE NOT NULL,
              data TEXT NOT NULL,
              status TEXT NOT NULL,
              staff_note TEXT NOT NULL DEFAULT '',
              confirmed_date TEXT NOT NULL DEFAULT '',
              confirmed_time TEXT NOT NULL DEFAULT '',
              version INTEGER NOT NULL DEFAULT 1,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS activity (
              id SERIAL PRIMARY KEY,
              action TEXT NOT NULL,
              created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS media (
              filename TEXT PRIMARY KEY,
              mime_type TEXT NOT NULL,
              bytes BYTEA NOT NULL,
              created_at TEXT NOT NULL
            );
          `);
        })().catch((err) => {
          console.error("PostgreSQL table init error:", err);
          initPromise = null;
          throw err;
        });
      }
      return initPromise;
    };

    const convertSql = (sql) => {
      let index = 1;
      let converted = sql.replace(/\?/g, () => `$${index++}`);
      converted = converted.replace(/INSERT OR IGNORE INTO/gi, "INSERT INTO");
      if (/INSERT INTO content/i.test(converted) && !/ON CONFLICT/i.test(converted)) {
        converted += " ON CONFLICT (id) DO NOTHING";
      }
      return converted;
    };

    return {
      type: "postgres",
      pool,
      async exec(sql) {
        await ensureInit();
        return pool.query(sql);
      },
      prepare(sql) {
        const pgSql = convertSql(sql);
        return {
          async get(...params) {
            await ensureInit();
            const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
            const res = await pool.query(pgSql, flat);
            return res.rows[0];
          },
          async all(...params) {
            await ensureInit();
            const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
            const res = await pool.query(pgSql, flat);
            return res.rows;
          },
          async run(...params) {
            await ensureInit();
            const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
            const res = await pool.query(pgSql, flat);
            return { changes: res.rowCount || 0 };
          },
        };
      },
      async close() {
        await pool.end();
      },
    };
  }

  // SQLite implementation (completely synchronous)
  if (databasePath !== ":memory:") {
    mkdirSync(path.dirname(databasePath), { recursive: true, mode: 0o700 });
    const fd = openSync(databasePath, "a", 0o600);
    closeSync(fd);
    chmodSync(databasePath, 0o600);
  }
  const sqlite = new DatabaseSync(databasePath);
  sqlite.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS admins (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, admin_id TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, requests INTEGER NOT NULL, expires INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS rate_limits_expires_idx ON rate_limits (expires);
    CREATE TABLE IF NOT EXISTS content (id INTEGER PRIMARY KEY CHECK(id=1), json TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS content_history (version INTEGER PRIMARY KEY, json TEXT NOT NULL, saved_at TEXT NOT NULL, actor TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS appointments (id TEXT PRIMARY KEY, request_key TEXT UNIQUE NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL, staff_note TEXT NOT NULL DEFAULT '', confirmed_date TEXT NOT NULL DEFAULT '', confirmed_time TEXT NOT NULL DEFAULT '', version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS activity (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS media (filename TEXT PRIMARY KEY, mime_type TEXT NOT NULL, bytes BLOB NOT NULL, created_at TEXT NOT NULL);
  `);
  if (!sqlite.prepare("PRAGMA table_info(admins)").all().some((column) => column.name === "role")) {
    sqlite.exec("ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'admin'");
  }

  return {
    type: "sqlite",
    sqlite,
    exec(sql) {
      sqlite.exec(sql);
    },
    prepare(sql) {
      const stmt = sqlite.prepare(sql);
      return {
        get(...params) {
          const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          return stmt.get(...flat);
        },
        all(...params) {
          const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          return stmt.all(...flat);
        },
        run(...params) {
          const flat = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          return stmt.run(...flat);
        },
      };
    },
    close() {
      sqlite.close();
    },
  };
}
