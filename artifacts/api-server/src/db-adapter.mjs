import { DatabaseSync } from "node:sqlite";
import { chmodSync, closeSync, mkdirSync, openSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const backupTables = {
  admins: ["id", "email", "password", "role"],
  content: ["id", "json", "version"],
  content_history: ["version", "json", "saved_at", "actor"],
  appointments: ["id", "request_key", "data", "status", "staff_note", "confirmed_date", "confirmed_time", "version", "created_at", "updated_at"],
  activity: ["id", "action", "created_at"],
  media: ["filename", "mime_type", "bytes", "created_at"],
};
const backupLimit = 40 * 1024 * 1024;
const encodeBackupRows = (table, rows) => table === "media" ? rows.map((row) => ({ ...row, bytes: Buffer.from(row.bytes).toString("base64") })) : rows;
const backupValues = (table, columns, row) => columns.map((column) => table === "media" && column === "bytes" ? Buffer.from(row[column], "base64") : row[column]);
function validateBackup(snapshot) {
  if (!snapshot || snapshot.format !== 1 || !snapshot.tables || typeof snapshot.tables !== "object") throw new Error("Invalid backup format.");
  for (const [table, columns] of Object.entries(backupTables)) {
    const rows = snapshot.tables[table];
    if (!Array.isArray(rows) || rows.length > 100000 || rows.some((row) => !row || typeof row !== "object" || columns.some((column) => !Object.hasOwn(row, column)))) throw new Error("Invalid backup data.");
  }
  if (snapshot.tables.content.length !== 1 || !snapshot.tables.admins.some((row) => row.role === "admin")) throw new Error("Backup needs website content and an administrator.");
}

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
      async exportBackup() {
        await ensureInit(); const client = await pool.connect();
        try {
          await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
          const size = await client.query("SELECT COALESCE(SUM(length(bytes)),0) AS total FROM media");
          if (Number(size.rows[0].total) > backupLimit) throw new Error("The media library exceeds the backup size limit.");
          const tables = {};
          for (const [table, columns] of Object.entries(backupTables)) tables[table] = encodeBackupRows(table, (await client.query(`SELECT ${columns.join(",")} FROM ${table}`)).rows);
          await client.query("COMMIT"); return { format: 1, tables };
        } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
      },
      async restoreBackup(snapshot) {
        validateBackup(snapshot); await ensureInit(); const client = await pool.connect();
        try {
          await client.query("BEGIN");
          await client.query(`LOCK TABLE ${[...Object.keys(backupTables), "sessions", "rate_limits"].join(",")} IN ACCESS EXCLUSIVE MODE`);
          for (const table of [...Object.keys(backupTables), "sessions", "rate_limits"]) await client.query(`DELETE FROM ${table}`);
          for (const [table, columns] of Object.entries(backupTables)) {
            const placeholders = columns.map((_, index) => `$${index + 1}`).join(",");
            for (const row of snapshot.tables[table]) await client.query(`INSERT INTO ${table} (${columns.join(",")}) VALUES (${placeholders})`, backupValues(table, columns, row));
          }
          await client.query("SELECT setval(pg_get_serial_sequence('activity','id'), COALESCE((SELECT MAX(id) FROM activity),0)+1, false)");
          await client.query("COMMIT");
        } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
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
    exportBackup() {
      sqlite.exec("BEGIN");
      try {
        if (sqlite.prepare("SELECT COALESCE(SUM(length(bytes)),0) AS total FROM media").get().total > backupLimit) throw new Error("The media library exceeds the backup size limit.");
        const tables = {};
        for (const [table, columns] of Object.entries(backupTables)) tables[table] = encodeBackupRows(table, sqlite.prepare(`SELECT ${columns.join(",")} FROM ${table}`).all());
        sqlite.exec("COMMIT"); return { format: 1, tables };
      } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    },
    restoreBackup(snapshot) {
      validateBackup(snapshot); sqlite.exec("BEGIN IMMEDIATE");
      try {
        for (const table of [...Object.keys(backupTables), "sessions", "rate_limits"]) sqlite.exec(`DELETE FROM ${table}`);
        for (const [table, columns] of Object.entries(backupTables)) {
          const stmt = sqlite.prepare(`INSERT INTO ${table} (${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`);
          for (const row of snapshot.tables[table]) stmt.run(...backupValues(table, columns, row));
        }
        sqlite.exec("COMMIT");
      } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    },
  };
}
