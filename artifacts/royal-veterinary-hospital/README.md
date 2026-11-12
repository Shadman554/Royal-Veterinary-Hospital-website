# Royal Veterinary Hospital

A responsive React website built around the supplied Royal brand and image library. Includes the homepage, 29 detailed service guides, a searchable directory with six care categories, care plans, team, hospital story, facilities, contact details, FAQs, and appointment requests.

## Local preview

From the repository root:

```powershell
pnpm install --ignore-scripts
pnpm dev:royal
```

Requires Node 24 or later. Open http://localhost:5173 and http://localhost:5173/admin. The launcher builds and starts the API on loopback port 3001 and Vite on 5173. Stop with Ctrl+C. Use a single instance of the launcher. The Vite proxy forwards `/api` to the backend; both processes are needed for bookings and administration.

## First administrator

On first SQLite API startup, a unique setup key is written to `.local/admin-setup-key.txt` at the repository root. For PostgreSQL, set a unique random `ROYAL_SETUP_KEY` of at least 32 characters in the server environment before first startup. The key is not printed to logs. Open `/admin`, paste that key, and choose your own email address and password (at least 12 characters). Setup works once and removes the key file. There is no shared default password. Do not commit or publish the key or database. Staff access is also linked from the public footer.

The dashboard includes appointment management, website editing, staff accounts, content history, encrypted backups. Staff accounts can manage appointments and their own security settings; administrators manage website content and accounts. Automated email/SMS delivery is not included.

## Encrypted backups

Set a randomly generated 64-character hexadecimal value as `ROYAL_BACKUP_KEY` in the server environment. Generate it with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` on a trusted machine. Keep a secure copy separate from the database and backup files. Losing the key prevents recovery of encrypted backup files. Do not commit it or put it in frontend variables.

In **Backup & restore**, an administrator can download an encrypted snapshot of accounts, website content, history, appointments, activity, and uploaded media, including older local media files. Active sessions and temporary rate limits are not retained. Restoring replaces current data atomically, requires the original backup key, and signs everyone out. Before restoring, create and verify a separate current backup. The dashboard export supports at most 40 MB of uploaded media and 60 MB of serialized data. Larger installations need an independently tested database-native backup and, for older uploads, a separate backup of the local media folder. Application code, environment variables and encryption keys are not included; preserve them separately. Manual exports do not replace scheduled off-site backups.

## Change website content and images

Open `/admin` and choose an editor. Changes become public when you select **Save changes**.

- **Our team:** edit names, roles and specialties, add/remove members, and upload a portrait for each person. Photos appear with a circular crop on the homepage and team page, in their original colours.
- **Custom sections:** add bilingual headings and text, optionally with an uploaded image, to the home, about, team, packages, contact, facilities, services or gallery page. Position each section before the first built-in section or after a chosen built-in section, reorder sections sharing a position, hide them, or remove them. Existing built-in sections can be shown, hidden and reordered using the existing page-section controls; they are not arbitrary drag-and-drop blocks. Individual service-detail, appointment and privacy pages are not custom-section targets.
- **Images & branding:** replace the logo, desktop/mobile hero images, about/contact photographs, directory/booking photographs, and each of the six homepage service photos independently. Edit image descriptions, reuse an existing library image or restore original artwork. Shared SVG illustrations can also be replaced wherever they appear.
- **Page text:** search 271 editable pieces of page copy or browse by section, including headings, descriptions, navigation labels, buttons, footer, appointment and privacy copy. Shared wording changes in all places that use it. Hero heading/introduction fields remain under Hospital settings.
- **Services:** edit names, summaries, full introductions, preparation, aftercare, artwork, category, search keywords, topics and their images, reasons to visit, questions/answers and related services. Existing service URLs stay stable.
- **Care categories / Care steps:** edit category names, descriptions, artwork and the explanations of each stage of care.
- **Care packages / Questions & answers / Hospital settings:** edit the existing structured content as before.

Uploads accept PNG, JPEG, WebP and GIF files up to 8 MB; the upload control checks image decoding and dimensions. Supplied SVG files remain available in the library, while new uploads use raster formats. Uploaded files have unique names and are stored in the database. Older uploads may also be present in `media` beside the configured SQLite database (normally `.local/media`). Back up both the database and any existing media folder. Rebuilding does not replace saved content or uploaded images. Older databases automatically receive missing editor fields without overwriting saved data. Uploading selects a draft image; saving the editor publishes it. The page layout and route structure remain part of the website design rather than a drag-and-drop page builder.

## Checks and build

```powershell
pnpm --filter @workspace/royal-veterinary-hospital typecheck
pnpm --filter @workspace/royal-veterinary-hospital build
pnpm --filter @workspace/api-server typecheck
pnpm --filter @workspace/api-server test
pnpm --filter @workspace/api-server build
```

The frontend build is written to `dist/public`. The full website now requires a Node backend and persistent storage; a static-only host cannot receive bookings or run the dashboard.

## Editing

- `src/content.ts`: phone number, directions link, featured homepage services, package prices, team and FAQs.
- `src/services-data.ts`: the complete service catalogue, individual guide content, FAQs, related services and supplied icon mappings.
- `src/service-experience.tsx`: searchable directory, category filters, service guide pages and related care navigation.
- `src/services.css`: responsive directory and guide layouts.
- `src/sections.tsx`: homepage sections reused on interior pages.
- `src/site-pages.tsx`: facilities page.
- `src/booking-page.tsx`: appointment review/submission and privacy notice.
- `src/admin.tsx`, `src/admin.css`: administrator interface.
- `src/site-state.tsx`: public content loading and shared API client.
- `src/site-defaults.ts`: initial hospital settings.
- `../api-server/src/royal-api.mjs`: authenticated API, validation and SQLite storage.
- `src/site-ui.tsx`: navigation, footer, buttons and shared presentation.
- `src/index.css`: typography, colours, desktop and mobile layouts, reduced-motion support.
- `public/rvh/assets`: supplied Royal photography and illustrations. Service photos use CSS crops of the supplied services artwork; text and controls are real HTML.

## Appointment behaviour

The form validates required fields, phone format, a real future date within the next year and current service choices. Visitors review their details before explicitly sending to the hospital. Requests persist in SQLite and appear as `new` in the dashboard. Retries use an idempotency key to avoid duplicate submissions. WhatsApp remains an alternative. A submitted request is not a confirmed appointment: staff must contact the owner, agree a date/time, then mark it confirmed. Dashboard updates do not automatically notify owners.

## Storage and deployment

The default database is `.local/royal.sqlite` at the repository root. Source defaults seed a new database once; later builds preserve saved content. `ROYAL_DATABASE` may point to an absolute persistent storage path. Back up the database with a SQLite-aware backup tool, or stop the API cleanly before copying its database and journal files. Do not put runtime files under `public` or `dist`. Tests use isolated temporary databases; the visual QA server uses an in-memory database.

For a self-hosted deployment, build both apps and run `pnpm --filter @workspace/api-server start` with `APP_ORIGIN=https://your-actual-hostname` and `ROYAL_DATABASE` set to persistent storage. Set `PORT` as needed. The API serves the built frontend and application-route fallback. Terminate HTTPS at a trusted local reverse proxy; the server listens on `0.0.0.0` by default and trusts one proxy hop in production. Restrict direct access to the application port so requests pass through the trusted proxy. Production cookies require HTTPS.

Passwords use salted scrypt hashes. Sessions are server-side, expire after eight hours, use HttpOnly/SameSite cookies and are revoked on sign-out or password changes. Mutations require an approved Origin. Login, bootstrap and public submissions are rate-limited. Edits check version numbers to prevent silent overwrites, and appointment records are unavailable through the public content endpoint. The API does not log submitted contact details or passwords.

References: [Node SQLite](https://nodejs.org/api/sqlite.html), [Express security guidance](https://expressjs.com/en/advanced/best-practice-security/).

Business details, clinician names and package amounts come from the existing project. Confirm them with the hospital before public launch.

## Service coverage

The catalogue covers the 28 services in the user-provided Modern Vet directory, plus Royal’s existing imaging and diagnostics service. The user confirmed equivalent service scope. Original Royal copy explains each service, what it can involve, reasons to enquire, preparation, aftercare and FAQs. The reference’s prices, partnerships, credentials, travel rules and location-specific claims have not been transferred.

Directory search matches service names, descriptions, categories and useful synonyms. Category links from the homepage use `?category=`. Each guide links to three related services and a preselected appointment request. Emergency care uses direct telephone actions and is excluded from routine appointment choices.

Reference and route mapping: [service-content-sources.md](service-content-sources.md).

## Languages and homepage

The homepage follows the supplied Royal hero reference, with live editable headings, a telephone action, booking link and four care highlights. The Kurdish/English switch remembers the visitor’s preference. Sorani Kurdish includes public page copy, service guides, plans, FAQs and booking labels; the hospital workspace remains English.

Edit translations in **Page text → Kurdish** groups. **Kurdish · Custom text** adds translations for new English wording, including new staff specialties or service descriptions. English booking values and service routes stay unchanged when the visitor switches languages. Images remain independently editable.

Translation source files are in `src/locales/ckb-*.json`. `node sync-locales.mjs` registers them with the copy editor; both app builds run this automatically. Saved dashboard edits take precedence over bundled wording.

External PostgreSQL connections require TLS with certificate and hostname verification. Localhost and Railway private-network hostnames use their private network connection. Rate limits are stored in the same database and apply across instances using that database. Ensure the database has persistent storage and access is restricted to the application.

Use `pnpm start` to run the built project in production mode. The application port must only be reachable through the configured TLS reverse proxy when the production proxy setting is used. Set `HOST=127.0.0.1` when the proxy runs on the same host.
