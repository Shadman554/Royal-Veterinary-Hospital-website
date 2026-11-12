import { StaffProvider, StaffSwitch, useStaff } from "./staff-language";
import {
  BilingualField,
  BilingualList,
  TranslationDraft,
} from "./bilingual-fields";
import { useEffect, useState, useRef, type FormEvent } from "react";
import { Link } from "wouter";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Languages,
  ListTree,
  Footprints,
  CalendarDays,
  Stethoscope,
  Settings2,
  UsersRound,
  UserRound,
  Package,
  MessageCircle,
  ArrowUpRight,
  LogOut,
  Search,
  RefreshCw,
  X,
  Check,
  Plus,
  ShieldCheck,
  Download,
  Clock3,
  ArrowRight,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { ASSETS } from "./content";
import { api, useSite, type SiteContent } from "./site-state";
import { categories, type Service } from "./services-data";
import "./admin.css";
import {
  ImageField,
  CopyEditor,
  MediaEditor,
  ServiceFields,
  TextField,
} from "./cms-fields";
import { SiteImage, assetUrl } from "./website-content";
import { pageSections } from "./page-sections";

type Booking = {
  id: string;
  name: string;
  phone: string;
  pet: string;
  species: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  doctor: string;
  status: string;
  staff_note: string;
  confirmed_date: string;
  confirmed_time: string;
  version: number;
  created_at: string;
};
type Activity = { id: number; action: string; created_at: string };
const statuses = ["new", "contacted", "confirmed", "completed", "cancelled"];
const dateLabel = (value: string, language: string) =>
  new Intl.DateTimeFormat(language === "ckb" ? "ckb-IQ" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Baghdad",
  }).format(new Date(value.length === 10 ? `${value}T12:00:00` : value));
const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "services", label: "Services", icon: Stethoscope },
  { id: "plans", label: "Care packages", icon: Package },
  { id: "team", label: "Our team", icon: UsersRound },
  { id: "faqs", label: "Questions & answers", icon: MessageCircle },
  { id: "settings", label: "Hospital and homepage", icon: Settings2 },
  { id: "sections", label: "Page sections", icon: LayoutDashboard },
  { id: "sectionOrder", label: "Section order", icon: ListTree },
  { id: "customSections", label: "Custom sections", icon: LayoutDashboard },
  { id: "homepageServices", label: "Homepage services", icon: Stethoscope },
  { id: "media", label: "Images & branding", icon: ImageIcon },
  { id: "library", label: "Media library", icon: ImageIcon },
  { id: "gallery", label: "Gallery & facilities", icon: ImageIcon },
  { id: "copy", label: "Text & translations", icon: Languages },
  { id: "categories", label: "Care categories", icon: ListTree },
  { id: "categorySteps", label: "Care steps", icon: Footprints },
  { id: "activity", label: "Activity & account", icon: ShieldCheck },
  { id: "staff", label: "Staff accounts", icon: UsersRound },
  { id: "history", label: "Version history", icon: Clock3 },
  { id: "backup", label: "Backup & restore", icon: Download },
];
const navGroups = [
  { label: "Daily work", ids: ["overview", "appointments"] },
  {
    label: "Website editing",
    ids: ["sections", "sectionOrder", "customSections", "homepageServices", "copy", "settings", "gallery", "media", "library", "team", "faqs"],
  },
  {
    label: "Care guides",
    ids: ["services", "categories", "categorySteps", "plans"],
  },
  { label: "Administration", ids: ["activity", "staff", "history", "backup"] },
];
const labels: Record<string, string> = {
  phone: "Phone with country code",
  phoneDisplay: "Phone shown to visitors",
  address: "Street address",
  city: "City",
  region: "Region / country",
  routineHours: "Regular opening hours",
  fridayHours: "Friday opening hours",
  heroLine1: "Hero heading, first line",
  heroLine2: "Hero heading, second line",
  heroDescription: "Homepage introduction",
  title: "Service name",
  short: "Short description",
  intro: "Service introduction",
  prep: "Before the visit",
  after: "After the visit",
  name: "Package name",
  label: "Package label",
  desc: "Description",
  price: "Price in IQD",
};

export function Admin() {
  return (
    <StaffProvider>
      <StaffDashboard />
    </StaffProvider>
  );
}
function StaffDashboard() {
  const { t } = useStaff();
  const [user, setUser] = useState<{ email: string; role: "admin" | "staff" } | null>(null);
  const [setup, setSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    document.title = "Royal Admin | Hospital workspace";
    void api<{ required: boolean }>("/admin/setup-status")
      .then(async (result) => {
        setSetup(result.required);
        if (!result.required) {
          try {
            setUser(await api("/admin/session"));
          } catch (e) {
            if ((e as { status?: number }).status !== 401) throw e;
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  if (loading)
    return (
      <div className="admin-loading">
        <ShieldCheck />
        <p>{t("Opening your hospital workspace…")}</p>
      </div>
    );
  if (error)
    return (
      <main className="admin-loading">
        <ShieldCheck aria-hidden="true" />
        <h1>{t("Admin access is unavailable")}</h1>
        <p role="alert">{t(error)}</p>
        <button className="button" type="button" onClick={() => window.location.reload()}>
          {t("Try again")}
        </button>
        <Link href="/">{t("View website")}</Link>
        <StaffSwitch />
      </main>
    );
  if (!user)
    return <AdminLogin setup={setup} initialError={error} onLogin={setUser} />;
  return (
    <Workspace
      email={user.email}
      role={user.role}
      onLogout={() => {
        setUser(null);
        setSetup(false);
      }}
    />
  );
}
function AdminLogin({
  setup,
  initialError,
  onLogin,
}: {
  setup: boolean;
  initialError: string;
  onLogin: (u: { email: string; role: "admin" | "staff" }) => void;
}) {
  const { t } = useStaff();
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      onLogin(
        await api(setup ? "/admin/setup" : "/admin/login", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-auth">
      <div className="admin-auth-panel">
        <div className="admin-auth-header">
          <Link href="/" className="admin-auth-brand" aria-label={t("Royal Veterinary Hospital")}>
            <SiteImage mediaKey="logo" src={`${ASSETS}royal-logo-transparent.png`} alt={t("Royal Veterinary Hospital")} />
          </Link>
          <StaffSwitch />
        </div>
        <form onSubmit={submit}>
          <h2>{setup ? t("Make it your workspace.") : t("Welcome back.")}</h2>
          <p>
            {setup
              ? t(
                  "Create the hospital’s administrator account. You’ll use these details to sign in.",
                )
              : t("Sign in to keep the little things running smoothly.")}
          </p>
          {setup && (
            <>
              <label>
                {t("One-time setup key")}
                <input
                  name="setupKey"
                  required
                  autoComplete="off"
                  type="password"
                  maxLength={100}
                />
              </label>
              <small className="admin-hint">
                {t("Use the one-time key configured on the server. For local SQLite, find it in .local/admin-setup-key.txt.")}
              </small>
            </>
          )}
          <label>
            {t("Email address")}
            <input
              type="email"
              name="email"
              dir="ltr"
              required
              autoComplete="username"
              maxLength={150}
            />
          </label>
          <label>
            {t("Password")}
            <input
              type="password"
              name="password"
              dir="ltr"
              required
              minLength={setup ? 12 : 1}
              maxLength={128}
              autoComplete={setup ? "new-password" : "current-password"}
            />
          </label>
          {setup && (
            <small className="admin-hint">
              {t(
                "Use at least 12 characters. Your password is stored as a salted hash.",
              )}
            </small>
          )}
          {error && (
            <p className="admin-error" role="alert">
              {t(error)}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy
              ? t("Please wait…")
              : setup
                ? t("Create administrator account")
                : t("Sign in")}
            <ArrowRight size={17} />
          </button>
          <p className="admin-auth-note">
            {t("Access is restricted to hospital staff. Sessions expire after 8 hours.")}
          </p>
          <Link href="/" className="admin-auth-site-link">
            {t("View website")} <ArrowUpRight size={16} />
          </Link>
        </form>
      </div>
    </div>
  );
}
function Workspace({
  email,
  role,
  onLogout,
}: {
  email: string;
  role: "admin" | "staff";
  onLogout: () => void;
}) {
  const { t, language } = useStaff();
  const { content, update, refresh } = useSite();
  const [section, setSection] = useState("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState("");
  const visibleGroups = role === "admin" ? navGroups : [
    { label: "Daily work", ids: ["overview", "appointments"] },
    { label: "Administration", ids: ["activity"] },
  ];
  async function load() {
    setBusy(true);
    setError("");
    try {
      const [rows, events, saved] = await Promise.all([
        api<Booking[]>("/admin/appointments"),
        role === "admin" ? api<Activity[]>("/admin/activity") : Promise.resolve([]),
        api<SiteContent>("/content"),
      ]);
      setBookings(rows);
      setActivity(events);
      update(saved);
      setRevision((v) => v + 1);
      setReady(true);
    } catch (e) {
      if ((e as { status?: number }).status === 401) onLogout();
      else setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void api<Booking[]>("/admin/appointments").then(setBookings).catch(() => {});
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const navigate = (next: string) => {
    if (!visibleGroups.some((group) => group.ids.includes(next))) return;
    if (
      next === section ||
      (dirty && !window.confirm(t("Discard your unsaved changes?")))
    )
      return;
    setDirty(false);
    window.scrollTo(0, 0);
    setSection(next);
    setNotice("");
    setError("");
  };
  const signOut = async () => {
    if (dirty && !window.confirm(t("Discard changes and sign out?"))) return;
    try {
      await api("/admin/logout", { method: "POST", body: "{}" });
      onLogout();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Baghdad",
  }).format(new Date());
  const upcoming = bookings
    .filter((b) => b.status === "confirmed" && b.confirmed_date >= today)
    .sort((a, b) =>
      `${a.confirmed_date}${a.confirmed_time}`.localeCompare(
        `${b.confirmed_date}${b.confirmed_time}`,
      ),
    );
  const metrics = [
    {
      label: "Waiting for a reply",
      value: bookings.filter((b) => b.status === "new").length,
      note: "New appointment requests",
      icon: MessageCircle,
    },
    {
      label: "Today’s appointments",
      value: upcoming.filter((b) => b.confirmed_date === today).length,
      note: "Confirmed with your team",
      icon: CalendarDays,
    },
    {
      label: "Upcoming visits",
      value: upcoming.length,
      note: "Today and the days ahead",
      icon: Clock3,
    },
    {
      label: "Services on your website",
      value: content.services.length,
      note: "Across six care categories",
      icon: Stethoscope,
    },
  ];
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-brand">
          <SiteImage mediaKey="logo"
            src={`${ASSETS}royal-logo-transparent.png`}
            alt={t("Royal Veterinary Hospital")}
          />
        </Link>
        <details
          className="admin-mobile-account"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false;
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.currentTarget.open = false;
              event.currentTarget.querySelector("summary")?.focus();
            }
          }}
        >
          <summary aria-label={t(role === "admin" ? "Administrator" : "Staff")}><UserRound size={20} /></summary>
          <div className="admin-mobile-account-menu">
            <strong>{t(role === "admin" ? "Administrator" : "Staff")}</strong>
            <span dir="ltr">{email}</span>
            <button type="button" onClick={signOut}><LogOut size={17} />{t("Sign out")}</button>
          </div>
        </details>
        <label className="staff-mobile-nav">
          {t("Go to section")}
          <select value={section} onChange={(e) => navigate(e.target.value)}>
            {visibleGroups.map((g) => (
              <optgroup key={g.label} label={t(g.label)}>
                {g.ids.map((id) => (
                  <option key={id} value={id}>
                    {t(navigation.find((n) => n.id === id)!.label)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <nav aria-label={t("Admin navigation")}>
          {visibleGroups.map((g) => (
            <div className="staff-nav-group" key={g.label}>
              <h2>{t(g.label)}</h2>
              {g.ids
                .map((id) => navigation.find((item) => item.id === id)!)
                .map((item) => (
                  <button
                    key={item.id}
                    aria-current={section === item.id ? "page" : undefined}
                    className={section === item.id ? "active" : ""}
                    onClick={() => navigate(item.id)}
                  >
                    <item.icon size={18} />
                    {t(item.label)}
                    {item.id === "appointments" &&
                      bookings.some((b) => b.status === "new") && (
                        <span className="admin-nav-count">
                          {bookings.filter((b) => b.status === "new").length}
                        </span>
                      )}
                  </button>
                ))}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/" onClick={(event) => {
            if (dirty && !window.confirm(t("Discard your unsaved changes?"))) event.preventDefault();
          }}>
            {t("Open website")}
            <ArrowUpRight size={16} />
          </Link>
          <span className="admin-user">
            <span>{t("R")}</span>
            <span>
              <strong>{t(role === "admin" ? "Administrator" : "Staff")}</strong>
              <small>{email}</small>
            </span>
          </span>
          <button onClick={signOut}>
            <LogOut size={16} />
            {t("Sign out")}
          </button>
        </div>
      </aside>
      <main className="admin-main" id="main">
        <header className="admin-topbar">
          <span>
            {t("Royal")}
            <span>/</span>{" "}
            {t(navigation.find((n) => n.id === section)?.label ?? "")}
          </span>
          <div>
            <StaffSwitch />
            <button
              onClick={() => {
                if (
                  !dirty ||
                  window.confirm(t("Discard changes and refresh?"))
                ) {
                  setDirty(false);
                  void load();
                }
              }}
              disabled={busy}
              aria-label={t("Refresh dashboard")}
            >
              <RefreshCw size={17} className={busy ? "spinning" : ""} />
            </button>
            <Link href="/" className="admin-view-site" onClick={(event) => {
              if (dirty && !window.confirm(t("Discard your unsaved changes?"))) event.preventDefault();
            }}>
              {t("View website")}
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </header>
        <div className="admin-body">
          {error && (
            <p className="admin-error" role="alert">
              {t(error)}
            </p>
          )}
          {!ready ? (
            <p role="status">
              {busy
                ? t("Loading hospital data…")
                : t("Unable to load hospital data. Use Refresh to try again.")}
            </p>
          ) : (
            <>
              {section === "overview" && (
                <>
                  <div className="admin-page-heading">
                    <div>
                      <span className="eyebrow">
                        {dateLabel(today, language)}
                      </span>
                      <h1>{t("Hospital overview")}</h1>
                      <p>{t("Appointments and website updates")}</p>
                    </div>
                    <button
                      className="button"
                      onClick={() => navigate("appointments")}
                    >
                      {t("Open appointment inbox")}
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                  <div className="admin-metrics">
                    {metrics.map((m) => (
                      <div key={m.label}>
                        <div>
                          <span>{t(m.label)}</span>
                          <m.icon size={20} />
                        </div>
                        <strong>{m.value.toString().padStart(2, "0")}</strong>
                        <small>{t(m.note)}</small>
                      </div>
                    ))}
                  </div>
                  {role === "admin" && <section className="admin-panel admin-quick-links">
                    <div>
                      <span className="eyebrow">{t("WEBSITE CONTENT")}</span>
                      <h2>{t("Manage website content")}</h2>
                    </div>
                    {[
                      {
                        id: "copy",
                        label: "Edit text and translations",
                        note: "English and Kurdish",
                        icon: Languages,
                      },
                      {
                        id: "team",
                        label: "Edit team profiles",
                        note: "People, roles & specialties",
                        icon: UsersRound,
                      },
                      {
                        id: "settings",
                        label: "Hospital details",
                        note: "Contact, hours & homepage",
                        icon: Settings2,
                      },
                    ].map((item) => (
                      <button key={item.id} onClick={() => navigate(item.id)}>
                        <item.icon />
                        <strong>{t(item.label)}</strong>
                        <small>{t(item.note)}</small>
                        <ArrowUpRight size={17} />
                      </button>
                    ))}
                  </section>}
                  <div className="admin-overview-grid">
                    <section className="admin-panel">
                      <div className="admin-panel-title">
                        <div>
                          <h2>{t("Latest requests")}</h2>
                          <p>{t("A good next step starts with a reply.")}</p>
                        </div>
                        <button
                          className="text-link"
                          onClick={() => navigate("appointments")}
                        >
                          {t("View all")}
                          <ArrowRight size={14} />
                        </button>
                      </div>
                      <BookingTable
                        rows={bookings.slice(0, 5)}
                        onSelect={setSelected}
                      />
                    </section>
                    <section className="admin-panel admin-day-plan">
                      <span className="eyebrow">{t("ON THE CALENDAR")}</span>
                      <h2>{t("Coming in soon")}</h2>
                      {upcoming.length ? (
                        upcoming.slice(0, 4).map((b) => (
                          <button key={b.id} onClick={() => setSelected(b)}>
                            <span>
                              {b.confirmed_time}
                              <small>
                                {dateLabel(b.confirmed_date, language)}
                              </small>
                            </span>
                            <span>
                              <strong>{b.pet}</strong>
                              <small>{t(b.service)}</small>
                            </span>
                            <ArrowUpRight size={16} />
                          </button>
                        ))
                      ) : (
                        <div className="admin-empty compact">
                          <CalendarDays />
                          <h3>{t("No confirmed visits")}</h3>
                          <p>
                            {t(
                              "Confirmed visits will appear here once you agree a date and time with the owner.",
                            )}
                          </p>
                        </div>
                      )}
                    </section>
                  </div>
                </>
              )}
              {section === "appointments" && (
                <AppointmentInbox rows={bookings} onSelect={setSelected} />
              )}
              {[
                "services",
                "settings",
                "sections",
                "sectionOrder",
                "customSections",
                "homepageServices",
                "plans",
                "team",
                "faqs",
                "copy",
                "media",
                "gallery",
                "categories",
                "categorySteps",
              ].includes(section) && (
                <>
                  {notice && (
                    <p className="admin-success" role="status">
                      {t(notice)}
                    </p>
                  )}
                  <ContentEditor
                    key={`${section}-${revision}`}
                    section={section}
                    content={content}
                    onDirty={(value) => {
                      setDirty(value);
                      setNotice("");
                    }}
                    onSave={async (saved) => {
                      update(saved);
                      setDirty(false);
                      setNotice("Changes saved. Your website is up to date.");
                      try {
                        setActivity(await api("/admin/activity"));
                      } catch {
                        /* The content save already succeeded. */
                      }
                    }}
                  />
                </>
              )}
              {section === "activity" && (
                <>
                  <div className="admin-page-heading">
                    <div>
                      <span className="eyebrow">{t("A CLEAR RECORD")}</span>
                      <h1>{t("Activity & account")}</h1>
                      <p>
                        {t("Recent changes made in your hospital workspace.")}
                      </p>
                    </div>
                  </div>
                  <div className="admin-overview-grid">
                    {role === "admin" && <section className="admin-panel">
                      <div className="admin-panel-title">
                        <h2>{t("Recent activity")}</h2>
                      </div>
                      <div className="admin-activity">
                        {activity.map((a) => (
                          <div key={a.id}>
                            <Check size={17} />
                            <span>
                              {t(a.action)}
                              <small>
                                {dateLabel(a.created_at, language)} ·{" "}
                                {new Date(a.created_at).toLocaleTimeString(
                                  language === "ckb" ? "ckb-IQ" : "en-GB",
                                  {
                                    timeZone: "Asia/Baghdad",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </small>
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>}
                    <PasswordForm />
                  </div>
                </>
              )}
              {section === "staff" && role === "admin" && <StaffAccounts />}
              {section === "history" && role === "admin" && <ContentHistory content={content} onRestore={(saved) => { update(saved); setRevision((v) => v + 1); }} />}
              {section === "backup" && role === "admin" && <BackupSettings onRestore={onLogout} />}
              {section === "library" && role === "admin" && <MediaLibrary content={content} />}
            </>
          )}
        </div>
        <footer className="admin-footer">
          {t("Royal Veterinary Hospital")}{" "}
          <span>{t("Thoughtful care starts behind the scenes.")}</span>
        </footer>
      </main>
      {selected && (
        <BookingDrawer
          key={`${selected.id}-${selected.version}`}
          booking={selected}
          onClose={() => setSelected(null)}
          onSave={async () => {
            setSelected(null);
            await load();
          }}
        />
      )}
    </div>
  );
}
function BookingTable({
  rows,
  onSelect,
}: {
  rows: Booking[];
  onSelect: (b: Booking) => void;
}) {
  const { t, language } = useStaff();
  return rows.length ? (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>{t("Pet & owner")}</th>
            <th>{t("Care requested")}</th>
            <th>{t("Preferred visit")}</th>
            <th>{t("Status")}</th>
            <th>
              <span className="sr-only">{t("Details")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id}>
              <td data-label={t("Pet & owner")}>
                <strong>
                  {b.pet} <small>{t(b.species)}</small>
                </strong>
                <span>{b.name}</span>
              </td>
              <td data-label={t("Care requested")}>{t(b.service)}</td>
              <td data-label={t("Preferred visit")}>
                {dateLabel(b.date, language)}
                <span>{t(b.time)}</span>
              </td>
              <td data-label={t("Status")}>
                <span className={`admin-status ${b.status}`}>
                  {t(b.status)}
                </span>
              </td>
              <td className="admin-request-action">
                <button
                  aria-label={t(`Open request for ${b.pet}`)}
                  onClick={() => onSelect(b)}
                >
                  <ArrowUpRight size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="admin-empty">
      <MessageCircle />
      <h3>{t("No requests to show.")}</h3>
      <p>
        {t(
          "Requests sent through the website appear here. Try changing the filters if you expected to see one.",
        )}
      </p>
      <Link className="text-link" href="/appointment">
        {t("View the booking form")}
        <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}
function AppointmentInbox({
  rows,
  onSelect,
}: {
  rows: Booking[];
  onSelect: (b: Booking) => void;
}) {
  const { t } = useStaff();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [day, setDay] = useState("");
  const shown = rows.filter(
    (b) =>
      (status === "all" || b.status === status) &&
      (!day || b.date === day || b.confirmed_date === day) &&
      `${b.pet} ${b.name} ${b.phone} ${b.service}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const exportCsv = () => {
    const escape = (v: string) =>
      `"${(/^[\s\u0000-\u001f]*[=+@\-\t\r]/.test(v) ? "'" : "") + v.replaceAll('"', '""')}"`;
    const csv = [
      [
        "Reference",
        "Pet",
        "Owner",
        "Phone",
        "Service",
        "Requested date",
        "Requested time",
        "Status",
        "Confirmed date",
        "Confirmed time",
      ],
      ...shown.map((b) => [
        b.id,
        b.pet,
        b.name,
        b.phone,
        b.service,
        b.date,
        b.time,
        b.status,
        b.confirmed_date,
        b.confirmed_time,
      ]),
    ]
      .map((row) => row.map(escape).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "royal-appointments.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">{t("THE APPOINTMENT INBOX")}</span>
          <h1>{t("Appointment requests")}</h1>
          <p>
            {t("Review the details, contact the owner, then update the visit.")}
          </p>
        </div>
        <button
          className="outline-button"
          onClick={exportCsv}
          disabled={!shown.length}
        >
          <Download size={16} />
          {t("Export filtered list")}
        </button>
      </div>
      <div className="admin-panel">
        <div className="admin-filters">
          <label className="admin-search">
            <Search size={18} />
            <input
              aria-label={t("Search appointments")}
              placeholder={t("Search pets, owners or services")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label>
            <select
              aria-label={t("Filter status")}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">{t("All statuses")}</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {t(s)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <input
              aria-label={t("Filter date")}
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </label>
          <button
            onClick={() => {
              setQuery("");
              setStatus("all");
              setDay("");
            }}
          >
            {t("Reset")}
          </button>
        </div>
        <div className="admin-results" role="status">
          {shown.length} {shown.length === 1 ? t("request") : t("requests")}
        </div>
        <BookingTable rows={shown} onSelect={onSelect} />
      </div>
    </>
  );
}
function BookingDrawer({
  booking,
  onClose,
  onSave,
}: {
  booking: Booking;
  onClose: () => void;
  onSave: () => Promise<void>;
}) {
  const { t, language } = useStaff();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(booking.status);
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const controls = [
          ...(panel.current?.querySelectorAll<HTMLElement>(
            "a[href],button:not(:disabled),input,select,textarea",
          ) || []),
        ];
        const first = controls[0],
          last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("keydown", close);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/admin/appointments/${booking.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...Object.fromEntries(new FormData(e.currentTarget)),
          version: booking.version,
        }),
      });
      await onSave();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-drawer-backdrop">
      <section
        ref={panel}
        className="admin-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={t(`Request for ${booking.pet}`)}
      >
        <div className="admin-drawer-heading">
          <span className="eyebrow">{t("APPOINTMENT REQUEST")}</span>
          <button aria-label={t("Close request")} onClick={onClose}>
            <X />
          </button>
        </div>
        <h2>
          {booking.pet}
          <span>{t(booking.species)}</span>
        </h2>
        <p>
          {t("Reference")} {booking.id.slice(0, 8).toUpperCase()}
        </p>
        <dl className="admin-request-details">
          {[
            ["Owner", booking.name],
            ["Phone", booking.phone],
            ["Care", booking.service],
            [
              "Preferred visit",
              `${dateLabel(booking.date, language)} · ${booking.time}`,
            ],
            ...(booking.doctor
              ? [["Requested clinician", booking.doctor]]
              : []),
            ["Owner’s notes", booking.notes || "No notes provided."],
          ].map(([k, v]) => (
            <div key={k}>
              <dt>{t(k)}</dt>
              <dd dir="auto">{k === "Care" ? t(v) : v}</dd>
            </div>
          ))}
        </dl>
        <a
          className="outline-button"
          href={`tel:${booking.phone.replace(/[^+\d]/g, "")}`}
        >
          {t("Call owner")}
          <ArrowUpRight size={16} />
        </a>
        <form onSubmit={save}>
          <h3>{t("Manage this request")}</h3>
          <label>
            {t("Status")}
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {t(s)}
                </option>
              ))}
            </select>
          </label>
          <div className="admin-form-grid">
            <label>
              {t("Agreed date")}
              <input
                name="confirmed_date"
                type="date"
                defaultValue={booking.confirmed_date}
                required={status === "confirmed"}
              />
            </label>
            <label>
              {t("Agreed time")}
              <input
                name="confirmed_time"
                type="time"
                defaultValue={booking.confirmed_time}
                required={status === "confirmed"}
              />
            </label>
          </div>
          <label>
            {t("Internal staff note")}
            <textarea
              name="staff_note"
              defaultValue={booking.staff_note}
              maxLength={2000}
              rows={4}
            />
          </label>
          <p className="admin-hint">
            {t(
              "Status changes are internal. Contact the owner separately to agree or change their appointment.",
            )}
          </p>
          {error && (
            <p className="admin-error" role="alert">
              {t(error)}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? t("Saving…") : t("Save request")}
            <Check size={17} />
          </button>
        </form>
      </section>
    </div>
  );
}
function BackupSettings({ onRestore }: { onRestore: () => void }) {
  const { t } = useStaff();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { void api<{ available: boolean }>("/admin/backup/status").then((value) => setAvailable(value.available)).catch((e) => setError(e.message)); }, []);
  async function backup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/backup/export", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      if (!response.ok) { const result = await response.json(); throw new Error(result.error); }
      const url = URL.createObjectURL(await response.blob()); const link = document.createElement("a"); link.href = url; link.download = "royal-backup.rvh"; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); form.reset();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function restore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const file = data.get("file");
    if (!(file instanceof File) || !file.size) { setError("Choose a backup file."); return; }
    if (file.size > 60 * 1024 * 1024 + 64) { setError("The backup exceeds the size limit."); return; }
    if (!window.confirm(t("Restore this backup? Current data will be replaced and everyone will be signed out."))) return;
    setBusy(true); setError("");
    try {
      const encoded = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error("Could not read the backup file.")); reader.onload = () => resolve(String(reader.result).split(",")[1]); reader.readAsDataURL(file); });
      await api("/admin/backup/restore", { method: "POST", body: JSON.stringify({ password: data.get("password"), backup: encoded }) });
      onRestore();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <><div className="admin-page-heading"><div><h1>{t("Backup & restore")}</h1><p>{t("Download an encrypted backup of accounts, bookings, website content and uploaded images.")}</p></div></div>
    {error && <p className="admin-error" role="alert">{t(error)}</p>}
    {available === false ? <p>{t("Configure ROYAL_BACKUP_KEY on the server to use backups.")}</p> : available === null ? <p>{t("Loading…")}</p> : <div className="admin-overview-grid">
      <section className="admin-panel"><h2>{t("Download backup")}</h2><p>{t("Keep the backup file and server keys in a safe place. The media library is limited to 40 MB per backup.")}</p><form className="admin-account-form" onSubmit={(event) => void backup(event)}><label>{t("Current password")}<input name="password" type="password" required autoComplete="current-password" /></label><button className="button" disabled={busy}>{t("Download backup")}</button></form></section>
      <section className="admin-panel"><h2>{t("Restore backup")}</h2><p>{t("Restoring replaces current data and signs everyone out. Use the original backup server key.")}</p><form className="admin-account-form" onSubmit={(event) => void restore(event)}><label>{t("Backup file")}<input type="file" name="file" accept=".rvh" required /></label><label>{t("Current password")}<input name="password" type="password" required autoComplete="current-password" /></label><button className="outline-button" disabled={busy}>{t("Restore backup")}</button></form></section>
    </div>}
  </>;
}

function MediaLibrary({ content }: { content: SiteContent }) {
  const { t, language } = useStaff();
  const [images, setImages] = useState<{ filename: string; src: string; created_at: string }[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { void api<typeof images>("/admin/media").then(setImages).catch((e) => setError(e.message)); }, []);
  const references = JSON.stringify(content);
  const shown = images.filter((image) => image.filename.toLowerCase().includes(query.toLowerCase()));
  return <><div className="admin-page-heading"><div><h1>{t("Media library")}</h1><p>{t("Uploaded images are available in every image selector.")}</p></div></div>
    {error && <p className="admin-error" role="alert">{t(error)}</p>}
    <section className="admin-panel"><label className="admin-library-search">{t("Search filenames")}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      {shown.length ? <div className="admin-library-grid">{shown.map((image) => <article key={image.filename}><img src={image.src} alt="" loading="lazy" /><span>{references.includes(image.src) ? t("Used on website") : t("Not currently used")}</span><small>{dateLabel(image.created_at, language)}</small><small dir="ltr">{image.filename}</small></article>)}</div> : <p>{t("No uploaded images found.")}</p>}
    </section></>;
}

function StaffAccounts() {
  const { t } = useStaff();
  const [accounts, setAccounts] = useState<{ id: string; email: string; role: string }[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => api<typeof accounts>("/admin/staff").then(setAccounts).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, []);
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setBusy(true); setError(""); setMessage("");
    try {
      await api("/admin/staff", { method: "POST", body: JSON.stringify(data) });
      form.reset(); await load(); setMessage("Staff account created.");
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!window.confirm(t("Remove this staff account? Their active sessions will end."))) return;
    setBusy(true); setError(""); setMessage("");
    try { await api(`/admin/staff/${id}`, { method: "DELETE", body: "{}" }); await load(); setMessage("Staff account removed."); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <div className="admin-page-heading-block">
    <div className="admin-page-heading"><div><h1>{t("Staff accounts")}</h1><p>{t("Staff can manage appointments and their own password.")}</p></div></div>
    {error && <p className="admin-error" role="alert">{t(error)}</p>}{message && <p className="admin-success" role="status">{t(message)}</p>}
    <div className="admin-overview-grid">
      <section className="admin-panel"><h2>{t("Accounts")}</h2>{accounts.map((account) => <div className="admin-account-row" key={account.id}><span><strong dir="ltr">{account.email}</strong><small>{t(account.role === "admin" ? "Administrator" : "Staff")}</small></span>{account.role === "staff" && <button type="button" disabled={busy} onClick={() => void remove(account.id)}>{t("Remove")}</button>}</div>)}</section>
      <section className="admin-panel"><h2>{t("Add staff account")}</h2><form className="admin-account-form" onSubmit={add}><label>{t("Email address")}<input name="email" type="email" autoComplete="off" required maxLength={150} /></label><label>{t("Temporary password")}<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} /></label><p>{t("Use at least 12 characters. Staff can change this password after signing in.")}</p><button className="button" disabled={busy}>{t("Create account")}</button></form></section>
    </div>
  </div>;
}
function ContentHistory({ content, onRestore }: { content: SiteContent; onRestore: (content: SiteContent) => void }) {
  const { t, language } = useStaff();
  const [versions, setVersions] = useState<{ version: number; saved_at: string; actor: string }[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => api<typeof versions>("/admin/history").then(setVersions).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, []);
  async function restore(version: number) {
    if (!window.confirm(t("Restore this version of the entire website? Appointments and accounts will not be changed."))) return;
    setBusy(true); setError(""); setMessage("");
    try { const saved = await api<SiteContent>(`/admin/history/${version}/restore`, { method: "POST", body: JSON.stringify({ version: content.version }) }); onRestore(saved); await load(); setMessage("Website version restored."); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <><div className="admin-page-heading"><div><h1>{t("Version history")}</h1><p>{t("Restore earlier saved website content. Appointments and accounts are separate.")}</p></div></div>
    {error && <p className="admin-error" role="alert">{t(error)}</p>}{message && <p className="admin-success" role="status">{t(message)}</p>}
    <section className="admin-panel">{versions.length === 0 ? <p>{t("Earlier versions will appear here after you save changes.")}</p> : versions.map((item) => <div className="admin-account-row" key={item.version}><span><strong>{t("Version")} {item.version}</strong><small>{dateLabel(item.saved_at, language)} · <span dir="ltr">{item.actor}</span></small></span><button type="button" disabled={busy} onClick={() => void restore(item.version)}>{t("Restore")}</button></div>)}</section>
  </>;
}

function ContentEditor({
  section,
  content,
  onDirty,
  onSave,
}: {
  section: string;
  content: SiteContent;
  onDirty: (d: boolean) => void;
  onSave: (c: SiteContent) => Promise<void>;
}) {
  const { t } = useStaff();
  const [draft, setDraft] = useState(() => structuredClone(content));
  const [selected, setSelected] = useState(content.services[0].slug);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  function change(callback: (next: SiteContent) => void) {
    const next = structuredClone(draft);
    callback(next);
    setDraft(next);
    onDirty(true);
    setSaved(false);
  }
  const field = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    long = false,
  ) => (
    <BilingualField
      key={label}
      label={label}
      value={value}
      onChange={onChange}
      long={long}
      required
      maxLength={long ? 1500 : 200}
      shared={[labels.phone, labels.phoneDisplay, labels.price].includes(label)}
    />
  );
  async function save(e: FormEvent) {
    e.preventDefault();
    if (
      (e.currentTarget as HTMLFormElement).querySelector(
        '[data-uploading="true"]',
      )
    ) {
      setError("Wait for the image upload to finish before saving.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const next = await api<SiteContent>(`/admin/content/${section}`, {
        method: "PUT",
        body: JSON.stringify({
          version: content.version,
          value: draft[section as keyof SiteContent],
          ...(section === "homepageServices" && { homepageServiceCount: draft.settings.homepageServiceCount }),
          ...(section !== "copy" && {
            translations: Object.fromEntries(
              Object.entries(draft.copy).filter(
                ([key, text]) =>
                  key.startsWith("ckb::") && content.copy[key] !== text,
              ),
            ),
          }),
        }),
      });
      setDraft(structuredClone(next));
      await onSave(next);
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const service =
    draft.services.find((s) => s.slug === selected) || draft.services[0];

  function handleAddService() {
    const title = window.prompt(t("Enter new service name:"))?.trim();
    if (!title) return;
    if (
      draft.services.some((s) => s.title.toLowerCase() === title.toLowerCase())
    ) {
      alert(t("A service with this name already exists."));
      return;
    }
    const baseSlug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "service";
    let newSlug = baseSlug;
    let counter = 1;
    while (draft.services.some((s) => s.slug === newSlug)) {
      newSlug = `${baseSlug}-${counter++}`;
    }
    const newService: Service = {
      slug: newSlug,
      title,
      short: `Comprehensive ${title.toLowerCase()} care for your companion.`,
      category: (draft.categories[0]?.id as any) || "wellness",
      icon: "pet-consultation.svg",
      intro: `Dedicated ${title.toLowerCase()} tailored to your pet's health and comfort.`,
      topics: [
        [
          "Consultation",
          "Detailed examination and discussion.",
          "care-category-wellness.svg",
        ],
      ],
      signs: ["Regular checkup", "Preventive monitoring"],
      prep: "Bring any previous veterinary records and a list of current medications.",
      after: "Follow home instructions and contact us if any symptoms persist.",
      faqs: [
        [
          "How do I prepare my pet?",
          "Please arrive a few minutes early so your companion can settle in.",
        ],
      ],
      related: [],
      hidden: false,
    };
    change((next) => {
      next.services.push(newService);
    });
    setSelected(newSlug);
  }

  function handleDeleteService(slugToDelete: string) {
    if (draft.services.length <= 1) {
      alert(t("At least one service must remain."));
      return;
    }
    const targetService = draft.services.find((s) => s.slug === slugToDelete);
    if (!targetService) return;
    if (
      window.confirm(
        t(
          `Are you sure you want to delete "${targetService.title}"? Click "Save changes" afterwards to apply to the website.`,
        ),
      )
    ) {
      const remaining = draft.services.filter((s) => s.slug !== slugToDelete);
      change((next) => {
        next.services = remaining;
      });
      setSelected(remaining[0].slug);
    }
  }

  function handleToggleHideService(slugToToggle: string) {
    change((next) => {
      const target = next.services.find((s) => s.slug === slugToToggle);
      if (target) {
        target.hidden = !target.hidden;
      }
    });
  }

  function handleAddPlan() {
    const name = window.prompt(t("Enter new care package name:"))?.trim();
    if (!name) return;
    if (draft.plans.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      alert(t("A package with this name already exists."));
      return;
    }
    const newPlan = {
      name,
      label: "COMPREHENSIVE CARE",
      price: "150,000",
      desc: "Complete preventive care package for your companion.",
      features: [
        "Annual health examination",
        "Routine vaccination booster",
        "Deworming and parasite prevention",
      ],
      hidden: false,
    };
    change((next) => {
      next.plans.push(newPlan);
    });
  }

  function handleDeletePlan(indexToDelete: number) {
    if (draft.plans.length <= 1) {
      alert(t("At least one care package must remain."));
      return;
    }
    const targetPlan = draft.plans[indexToDelete];
    if (!targetPlan) return;
    if (
      window.confirm(
        t(
          `Are you sure you want to delete the "${targetPlan.name}" package? Click "Save changes" afterwards to apply to the website.`,
        ),
      )
    ) {
      change((next) => {
        next.plans.splice(indexToDelete, 1);
      });
    }
  }

  function handleToggleHidePlan(indexToToggle: number) {
    change((next) => {
      const target = next.plans[indexToToggle];
      if (target) {
        target.hidden = !target.hidden;
      }
    });
  }

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">{t("WEBSITE CONTENT")}</span>
          <h1>{t(navigation.find((n) => n.id === section)?.label ?? "")}</h1>
          <p>{t("Changes appear on the public website after you save.")}</p>
        </div>
      </div>
      <TranslationDraft.Provider
        value={{
          copy: draft.copy,
          edit: (key, text) =>
            change((next) => {
              next.copy[key] = text;
            }),
        }}
      >
        <form onSubmit={save} className="admin-content-form">
          <div className="admin-editor-toolbar">
            <button type="button" className="outline-button" onClick={() => {
              try {
                sessionStorage.setItem("royal-preview-draft", JSON.stringify(draft));
                const preview = window.open("/?preview=1", "_blank");
                if (!preview) setError("Allow pop-ups to open the preview.");
              } catch { setError("Preview is unavailable in this browser."); }
            }}><Eye size={16} />{t("Preview changes")}</button>
            {section === "services" && <span>{t(`${draft.services.length} service guides`)}</span>}
            <div>
              {saved && (
                <span className="admin-saved" role="status">
                  <Check size={15} />
                  {t("Saved")}
                </span>
              )}
              <button className="button" disabled={busy}>
                {busy ? t("Saving…") : t("Save changes")}
                <Check size={16} />
              </button>
            </div>
          </div>
          {error && (
            <p className="admin-error" role="alert">
              {t(error)}
            </p>
          )}
          <fieldset className="admin-editor-inputs" disabled={busy}>
            {section === "gallery" ? (
              <div className="admin-editor-fields gallery-editor">
                <p>{t("Add hospital memories to the gallery or add photos of rooms and equipment to the facilities page.")}</p>
                {draft.gallery.map((item, index) => (
                  <section className="admin-repeat-item" key={item.id}>
                    <div className="admin-repeat-heading">
                      <strong>{item.title || t("New photo")}</strong>
                      <button type="button" className="outline-button" onClick={() => change((next) => { next.gallery.splice(index, 1); })}>
                        <Trash2 size={16} /> {t("Remove")}
                      </button>
                    </div>
                    <label>{t("Show this photo in")}
                      <select value={item.category} onChange={(e) => change((next) => {
                        next.gallery[index].category = e.target.value as "memories" | "facilities";
                      })}>
                        <option value="memories">{t("Hospital memories")}</option>
                        <option value="facilities">{t("Rooms and equipment")}</option>
                      </select>
                    </label>
                    <ImageField label="Photo" value={item.image} onChange={(value) => change((next) => { next.gallery[index].image = value; })} />
                    <BilingualField label="Photo title" value={item.title} required maxLength={150} onChange={(value) => change((next) => { next.gallery[index].title = value; })} />
                    <BilingualField label="Photo description" value={item.description} long maxLength={1000} onChange={(value) => change((next) => { next.gallery[index].description = value; })} />
                  </section>
                ))}
                <button type="button" className="outline-button" onClick={() => change((next) => {
                  next.gallery.push({ id: crypto.randomUUID(), category: "memories", image: "", title: "", description: "" });
                })}><Plus size={16} /> {t("Add photo")}</button>
              </div>
            ) : section === "customSections" ? (
              <div className="admin-editor-fields staff-setting-groups">
                <p>{t("Add text and optional photos to a page. Choose where each section appears; move, hide or remove it at any time.")}</p>
                {draft.customSections.map((item, index) => {
                  const pages = ["/", "/about", "/team", "/packages", "/contact", "/facilities", "/services", "/gallery"];
                  const group = pageSections[pages.indexOf(item.page)];
                  return <section className="admin-repeat-item" key={item.id}>
                    <div className="admin-repeat-heading"><strong>{item.title || t("New section")}</strong><div>
                      <button type="button" className="outline-button" disabled={index === 0} onClick={() => change((next) => { [next.customSections[index - 1], next.customSections[index]] = [next.customSections[index], next.customSections[index - 1]]; })} aria-label={t("Move up")}>↑</button>{" "}
                      <button type="button" className="outline-button" disabled={index === draft.customSections.length - 1} onClick={() => change((next) => { [next.customSections[index + 1], next.customSections[index]] = [next.customSections[index], next.customSections[index + 1]]; })} aria-label={t("Move down")}>↓</button>{" "}
                      <button type="button" className="outline-button" onClick={() => { if (window.confirm(t("Remove this section?"))) change((next) => { next.customSections.splice(index, 1); }); }}><Trash2 size={16} />{t("Remove")}</button>
                    </div></div>
                    <label>{t("Page")}<select value={item.page} onChange={(event) => change((next) => { next.customSections[index].page = event.target.value; next.customSections[index].after = "start"; })}>{pages.map((page, i) => <option value={page} key={page}>{t(pageSections[i].page)}</option>)}</select></label>
                    <label>{t("Position")}<select value={item.after} onChange={(event) => change((next) => { next.customSections[index].after = event.target.value; })}><option value="start">{t("At the beginning")}</option>{group.sections.map(([key, label]) => <option key={key} value={key}>{t("After")} {t(label)}</option>)}</select></label>
                    <label className="admin-section-toggle"><span>{t("Show section")}</span><input type="checkbox" checked={item.visible} onChange={(event) => change((next) => { next.customSections[index].visible = event.target.checked; })} /></label>
                    <BilingualField label="Section title" value={item.title} required maxLength={150} onChange={(value) => change((next) => { next.customSections[index].title = value; })} />
                    <BilingualField label="Section text" value={item.body} long maxLength={3000} onChange={(value) => change((next) => { next.customSections[index].body = value; })} />
                    <ImageField label="Optional photo" value={item.image} onChange={(value) => change((next) => { next.customSections[index].image = value; })} />
                    {item.image && <button type="button" className="text-link" onClick={() => change((next) => { next.customSections[index].image = ""; })}>{t("Remove photo")}</button>}
                  </section>;
                })}
                <button type="button" className="outline-button" onClick={() => change((next) => { next.customSections.push({ id: crypto.randomUUID(), page: "/", after: "start", title: "", body: "", image: "", visible: true }); })}><Plus size={16} />{t("Add section")}</button>
              </div>
            ) : section === "sectionOrder" ? (
              <div className="admin-editor-fields staff-setting-groups admin-section-settings">
                <p>{t("Use the arrows to change the order of sections on each page.")}</p>
                {pageSections.slice(0, 8).map(({ page, sections }) => {
                  const ordered = [...sections].sort((a, b) => draft.sectionOrder[a[0]] - draft.sectionOrder[b[0]]);
                  return <section key={page}><h2>{t(page)}</h2>
                    {ordered.map(([key, label], index) => (
                      <div className="admin-section-order-row" key={key}>
                        <span>{t(label)}</span><div>
                          {[-1, 1].map((direction) => <button type="button" key={direction}
                            disabled={index + direction < 0 || index + direction >= ordered.length}
                            aria-label={`${t(direction < 0 ? "Move up" : "Move down")}: ${t(label)}`}
                            onClick={() => change((next) => {
                              const other = ordered[index + direction][0];
                              [next.sectionOrder[key], next.sectionOrder[other]] = [next.sectionOrder[other], next.sectionOrder[key]];
                            })}>{direction < 0 ? "↑" : "↓"}</button>)}
                        </div>
                      </div>
                    ))}
                  </section>;
                })}
              </div>
            ) : section === "homepageServices" ? (
              <div className="admin-editor-fields staff-setting-groups admin-section-settings">
                <p>{t("Select the services to show on the homepage. Hidden services will not appear until you show them in Services.")}</p>
                <label>
                  {t("Maximum number of service cards")}
                  <select value={draft.settings.homepageServiceCount} onChange={(e) => change((next) => {
                    next.settings.homepageServiceCount = e.target.value;
                  })}>
                    {Array.from({ length: 60 }, (_, index) => index + 1).map((count) => (
                      <option key={count} value={String(count)}>{count}</option>
                    ))}
                  </select>
                </label>
                <section>
                  {draft.services.map((service) => (
                    <label className="admin-section-toggle" key={service.slug}>
                      <span>{t(service.title)}{service.hidden ? ` · ${t("HIDDEN")}` : ""}</span>
                      <input type="checkbox" checked={draft.homepageServices.includes(service.slug)}
                        onChange={(event) => change((next) => {
                          next.homepageServices = event.target.checked
                            ? [...next.homepageServices, service.slug]
                            : next.homepageServices.filter((slug) => slug !== service.slug);
                          if (event.target.checked && Number(next.settings.homepageServiceCount) < next.homepageServices.length)
                            next.settings.homepageServiceCount = String(next.homepageServices.length);
                        })} />
                    </label>
                  ))}
                </section>
              </div>
            ) : section === "sections" ? (
              <div className="admin-editor-fields staff-setting-groups admin-section-settings">
                <p>{t("Choose which sections appear on each page. Hidden sections keep their content and can be shown again.")}</p>
                <p>{t("Hidden pages cannot be opened. Navigation settings only control menu links.")}</p>
                {pageSections.map(({ page, sections }) => (
                  <section key={page}>
                    <h2>{t(page)}</h2>
                    {sections.map(([key, label]) => (
                      <label className="admin-section-toggle" key={key}>
                        <span>{t(label)}</span>
                        <input type="checkbox" checked={draft.sections[key] !== false}
                          onChange={(event) => change((next) => { next.sections[key] = event.target.checked; })} />
                      </label>
                    ))}
                  </section>
                ))}
              </div>
            ) : section === "copy" ? (
              <CopyEditor
                value={draft.copy}
                onChange={(key, value) =>
                  change((next) => {
                    next.copy[key] = value;
                  })
                }
              />
            ) : section === "media" ? (
              <MediaEditor
                value={draft.media}
                onChange={(key, field, value) =>
                  change((next) => {
                    next.media[key][field] = value;
                  })
                }
              />
            ) : section === "categories" ? (
              <div className="admin-editor-fields">
                {draft.categories.map((c, i) => (
                  <section className="cms-nested-item" key={c.id}>
                    <TextField
                      label="Category name"
                      value={c.title}
                      onChange={(v) =>
                        change((next) => {
                          next.categories[i].title = v;
                        })
                      }
                    />
                    <TextField
                      label="Category description"
                      value={c.short}
                      onChange={(v) =>
                        change((next) => {
                          next.categories[i].short = v;
                        })
                      }
                    />
                    <ImageField
                      label="Category artwork"
                      value={c.icon}
                      original={
                        categories.find((category) => category.id === c.id)
                          ?.icon
                      }
                      onChange={(v) =>
                        change((next) => {
                          next.categories[i].icon = v;
                        })
                      }
                    />
                  </section>
                ))}
              </div>
            ) : section === "categorySteps" ? (
              <div className="admin-editor-fields">
                {draft.categories.map((c) => (
                  <section className="cms-nested-item" key={c.id}>
                    <h2>{t(c.title)}</h2>
                    {draft.categorySteps[c.id].map((row, i) => (
                      <div className="cms-nested-item" key={i}>
                        <TextField
                          label={`Step ${i + 1} title`}
                          value={row[0]}
                          onChange={(v) =>
                            change((next) => {
                              next.categorySteps[c.id][i][0] = v;
                            })
                          }
                        />
                        <TextField
                          label="Description"
                          long
                          value={row[1]}
                          onChange={(v) =>
                            change((next) => {
                              next.categorySteps[c.id][i][1] = v;
                            })
                          }
                        />
                      </div>
                    ))}
                  </section>
                ))}
              </div>
            ) : section === "services" ? (
              <div className="admin-service-editor">
                <aside>
                  <div className="admin-aside-top">
                    <button
                      type="button"
                      className="button button-small admin-btn-add"
                      onClick={handleAddService}
                    >
                      <Plus size={14} />
                      {t("Add service")}
                    </button>
                  </div>
                  <label className="admin-search">
                    <Search size={17} />
                    <input
                      aria-label={t("Find a service to edit")}
                      placeholder={t("Find a service")}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                  <div className="admin-service-list">
                    {draft.services
                      .filter((s) =>
                        (s.title + " " + (draft.copy["ckb::" + s.title] || ""))
                          .toLowerCase()
                          .includes(query.toLowerCase()),
                      )
                      .map((s) => (
                        <button
                          type="button"
                          className={`${selected === s.slug ? "active" : ""} ${s.hidden ? "is-hidden" : ""}`}
                          key={s.slug}
                          aria-pressed={selected === s.slug}
                          onClick={() => setSelected(s.slug)}
                        >
                          <SiteImage src={assetUrl(s.icon)} alt="" />
                          <span className="admin-service-list-name">
                            <span>{t(s.title)}</span>
                            {s.hidden && (
                              <span className="admin-badge-hidden">
                                {t("HIDDEN")}
                              </span>
                            )}
                          </span>
                        </button>
                      ))}
                  </div>
                </aside>
                {service ? (
                  <div className="admin-editor-fields">
                    <div className="admin-editor-title">
                      <div className="admin-editor-title-info">
                        <span className="eyebrow">
                          {t(
                            categories.find((c) => c.id === service.category)
                              ?.title ?? "",
                          )}
                        </span>
                        {service.hidden && (
                          <span className="admin-pill-hidden">
                            <EyeOff size={13} />
                            {t("Hidden from website")}
                          </span>
                        )}
                      </div>
                      <div className="admin-editor-title-actions">
                        <button
                          type="button"
                          className={`button button-small ${service.hidden ? "admin-btn-unhide" : "admin-btn-secondary"}`}
                          onClick={() => handleToggleHideService(service.slug)}
                          title={
                            service.hidden
                              ? t("Show on website")
                              : t("Hide from website")
                          }
                        >
                          {service.hidden ? (
                            <>
                              <Eye size={14} />
                              {t("Show on website")}
                            </>
                          ) : (
                            <>
                              <EyeOff size={14} />
                              {t("Hide service")}
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="button button-small admin-btn-danger"
                          onClick={() => handleDeleteService(service.slug)}
                          title={t("Delete service")}
                        >
                          <Trash2 size={14} />
                          {t("Delete service")}
                        </button>
                        <Link
                          href={`/service-${service.slug}`}
                          target="_blank"
                          className="text-link"
                        >
                          {t("Preview guide")}
                          <ArrowUpRight size={15} />
                        </Link>
                      </div>
                    </div>
                    {service.hidden && (
                      <div className="admin-banner-notice">
                        <EyeOff size={16} />
                        <span>
                          <strong>
                            {t("This service is currently hidden.")}
                          </strong>
                          {t(
                            "It will not be shown in the public services directory or appointment booking form. Direct preview links still work.",
                          )}
                        </span>
                      </div>
                    )}
                    <label>
                      {t("Service web URL slug")}
                      <input
                        value={service.slug}
                        onChange={(e) => {
                          const newSlug = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "");
                          change((next) => {
                            const target = next.services.find(
                              (s) => s.slug === selected,
                            );
                            if (target) {
                              target.slug = newSlug;
                            }
                          });
                          setSelected(newSlug);
                        }}
                        pattern="[a-z0-9-]+"
                        required
                        maxLength={80}
                      />
                      <small className="admin-hint">
                        {t("Public address: /service-")}
                        {service.slug}
                      </small>
                    </label>
                    {(
                      ["title", "short", "intro", "prep", "after"] as const
                    ).map((key) =>
                      field(
                        labels[key],
                        service[key],
                        (value) =>
                          change((next) => {
                            const target = next.services.find(
                              (s) => s.slug === selected,
                            );
                            if (target) target[key] = value;
                          }),
                        !["title", "short"].includes(key),
                      ),
                    )}
                    <ServiceFields
                      service={service}
                      services={draft.services}
                      categories={draft.categories}
                      onChange={(value) =>
                        change((next) => {
                          const idx = next.services.findIndex(
                            (s) => s.slug === selected,
                          );
                          if (idx >= 0) next.services[idx] = value;
                        })
                      }
                    />
                  </div>
                ) : (
                  <div className="admin-editor-fields">
                    <p>{t("No service selected.")}</p>
                  </div>
                )}
              </div>
            ) : section === "settings" ? (
              <div className="admin-editor-fields staff-setting-groups">
                {(
                  [
                    [
                      "Homepage banner",
                      ["heroLine1", "heroLine2", "heroDescription"],
                    ],
                    [
                      "Contact details",
                      ["phone", "phoneDisplay", "address", "city", "region"],
                    ],
                    ["Opening hours", ["routineHours", "fridayHours"]],
                  ] as const
                ).map(([title, keys]) => (
                  <section key={title}>
                    <h2>{t(title)}</h2>
                    {keys.map((key) =>
                      field(
                        labels[key],
                        draft.settings[key],
                        (value) =>
                          change((next) => {
                            next.settings[key] = value;
                          }),
                        key === "heroDescription",
                      ),
                    )}
                    {title === "Homepage banner" && (
                      <label>
                        {t("Headline writing speed")}
                        <select
                          value={draft.settings.heroTypingSpeed}
                          onChange={(e) => change((next) => {
                            next.settings.heroTypingSpeed = e.target.value;
                          })}
                        >
                          <option value="30">{t("Fast")}</option>
                          <option value="55">{t("Normal")}</option>
                          <option value="90">{t("Slow")}</option>
                          <option value="130">{t("Very slow")}</option>
                        </select>
                        <small className="admin-hint">{t("Controls how quickly the homepage headline is written.")}</small>
                      </label>
                    )}
                  </section>
                ))}
              </div>
            ) : section === "plans" ? (
              <div>
                <div className="admin-plans-toolbar">
                  <p className="admin-hint">
                    {t(
                      "Manage the care packages displayed on the website. You can hide packages temporarily, delete them, or add new packages.",
                    )}
                  </p>
                  <button
                    type="button"
                    className="button button-small admin-btn-add"
                    onClick={handleAddPlan}
                  >
                    <Plus size={14} />
                    {t("Add care package")}
                  </button>
                </div>
                <div className="admin-repeat-grid">
                  {draft.plans.map((plan, i) => (
                    <section
                      className={`admin-editor-fields ${plan.hidden ? "admin-plan-card-hidden" : ""}`}
                      key={i}
                    >
                      <div className="admin-plan-card-header">
                        <div className="admin-plan-header-title">
                          <span className="eyebrow">
                            {t("CARE PACKAGE 0")}
                            {i + 1}
                          </span>
                          {plan.hidden && (
                            <span className="admin-badge-hidden">
                              {t("HIDDEN")}
                            </span>
                          )}
                        </div>
                        <div className="admin-plan-card-actions">
                          <button
                            type="button"
                            className={`button button-small ${plan.hidden ? "admin-btn-unhide" : "admin-btn-secondary"}`}
                            onClick={() => handleToggleHidePlan(i)}
                            title={
                              plan.hidden
                                ? t("Show package on website")
                                : t("Hide package from website")
                            }
                          >
                            {plan.hidden ? (
                              <>
                                <Eye size={13} />
                                {t("Show")}
                              </>
                            ) : (
                              <>
                                <EyeOff size={13} />
                                {t("Hide")}
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            className="button button-small admin-btn-danger"
                            onClick={() => handleDeletePlan(i)}
                            title={t("Delete package")}
                          >
                            <Trash2 size={13} />
                            {t("Delete")}
                          </button>
                        </div>
                      </div>
                      {(["name", "label", "desc", "price"] as const).map(
                        (key) =>
                          field(
                            labels[key],
                            plan[key],
                            (value) =>
                              change((next) => {
                                next.plans[i][key] = value;
                              }),
                            key === "desc",
                          ),
                      )}
                      <BilingualList
                        label="Inclusion"
                        values={plan.features}
                        limit={10}
                        onChange={(features) =>
                          change((next) => {
                            next.plans[i].features = features;
                          })
                        }
                      />
                    </section>
                  ))}
                </div>
              </div>
            ) : (
              <div className="admin-editor-fields">
                {(section === "team" ? draft.team : draft.faqs).map(
                  (row, i) => (
                    <section className="admin-repeat-item" key={i}>
                      <div className="admin-repeat-heading">
                        <span className="eyebrow">
                          {section === "team"
                            ? t("TEAM MEMBER")
                            : t("QUESTION")}{" "}
                          {i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            change((next) => {
                              (section === "team"
                                ? next.team
                                : next.faqs
                              ).splice(i, 1);
                            })
                          }
                        >
                          {t("Remove")}
                          <X size={14} />
                        </button>
                      </div>
                      {section === "team" && (
                        <ImageField
                          label={`Portrait for ${row[0] || "team member"}`}
                          portrait
                          value={row[3]}
                          onChange={(value) =>
                            change((next) => {
                              next.team[i][3] = value;
                            })
                          }
                        />
                      )}
                      {(section === "team"
                        ? ["Full name", "Role", "Specialty"]
                        : ["Question", "Answer"]
                      ).map((label, j) =>
                        field(
                          label,
                          row[j],
                          (value) =>
                            change((next) => {
                              (section === "team" ? next.team : next.faqs)[i][
                                j
                              ] = value;
                            }),
                          section === "faqs" && j === 1,
                        ),
                      )}
                    </section>
                  ),
                )}
                <button
                  className="outline-button"
                  type="button"
                  onClick={() =>
                    change((next) => {
                      if (section === "team")
                        next.team.push(["", "", "", "pet-consultation.svg"]);
                      else next.faqs.push(["", ""]);
                    })
                  }
                >
                  <Plus size={16} />
                  {t("Add")}
                  {section === "team" ? t("team member") : t("question")}
                </button>
              </div>
            )}
          </fieldset>
        </form>
      </TranslationDraft.Provider>
    </>
  );
}
function PasswordForm() {
  const { t } = useStaff();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="admin-panel admin-password"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setBusy(true);
        try {
          await api("/admin/password", {
            method: "POST",
            body: JSON.stringify(Object.fromEntries(new FormData(form))),
          });
          form.reset();
          setMessage("Password updated. Other sessions have been signed out.");
        } catch (e) {
          setMessage((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <ShieldCheck />
      <h2>{t("Account security")}</h2>
      <p>{t("Update your password and sign out other sessions.")}</p>
      <label>
        {t("Current password")}
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
        />
      </label>
      <label>
        {t("New password")}
        <input
          name="password"
          type="password"
          required
          minLength={12}
          maxLength={128}
          autoComplete="new-password"
        />
      </label>
      <small className="admin-hint">{t("At least 12 characters.")}</small>
      <button className="button" disabled={busy}>
        {busy ? t("Updating…") : t("Update password")}
      </button>
      {message && <p role="status">{t(message)}</p>}
    </form>
  );
}
