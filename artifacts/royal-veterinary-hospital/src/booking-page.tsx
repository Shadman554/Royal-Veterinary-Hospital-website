import { SiteImage, assetUrl } from "./website-content";
import { useCopy } from "./website-content";
import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowLeft,
  Phone,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { PageIntro } from "./site-ui";
import { ASSETS } from "./content";
import { api, useHospital, useSite } from "./site-state";
export function Appointment() {
  const t = useCopy();

  const { services, plans, PHONE, settings } = useHospital();
  const { content } = useSite();
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("service") || "";
  const choices = [
    ...content.services
      .filter((s) => s.category !== "emergency" && !s.hidden)
      .map((s) => ({ value: s.title, label: t(s.title) })),
    ...content.plans
      .filter((p) => !p.hidden)
      .map((p) => ({
        value: `${p.name} package`,
        label: `${t(p.name)} ${t("package")}`,
      })),
    { value: "Help choosing care", label: t("Help choosing care") },
  ];
  const [draft, setDraft] = useState<Record<string, string>>({
    service: initial,
    doctor: params.get("doctor") || "",
  });
  const [review, setReview] = useState(false);
  const [sent, setSent] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [requestKey, setRequestKey] = useState(() => crypto.randomUUID());
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Baghdad",
  }).format(new Date());
  const message = `Hello Royal Veterinary Hospital, I would like to request a visit.\n${[
    "name",
    "phone",
    "pet",
    "species",
    "service",
    "date",
    "time",
    "doctor",
    "notes",
  ]
    .filter((key) => draft[key])
    .map((key) => `${key}: ${draft[key]}`)
    .join("\n")}\nPlease confirm availability.`;
  function prepare(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDraft({
      ...(Object.fromEntries(new FormData(e.currentTarget)) as Record<
        string,
        string
      >),
      doctor: params.get("doctor") || "",
    });
    setReview(true);
    setError("");
  }
  async function send() {
    setBusy(true);
    setError("");
    try {
      const result = await api<{ id: string }>("/appointments", {
        method: "POST",
        body: JSON.stringify({ ...draft, requestKey }),
      });
      setSent(result.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="royal-home">
      <PageIntro
        eyebrow={t("LET’S PLAN YOUR VISIT")}
        title={
          <>
            {t("Their next happy chapter")}
            <br />
            <span>{t("starts here.")}</span>
          </>
        }
        description={t(
          "Tell us a little about your companion. Our team will contact you to agree a visit.",
        )}
      />
      <section className="section">
        <div className="container booking-layout">
          <div className="booking-form-wrap">
            {sent ? (
              <div className="request-review" role="status">
                <span className="review-icon">
                  <CheckCircle2 size={30} />
                </span>
                <span className="eyebrow">{t("REQUEST RECEIVED")}</span>
                <h2>{t("We’ll take it from here.")}</h2>
                <p>
                  {t("Your request for")}
                  {draft.pet}
                  {t(
                    "is now in the hospital’s appointment inbox. Our team will contact you to agree the date and time. This is not yet a confirmed appointment.",
                  )}
                </p>
                <p>
                  <strong>
                    {t("Reference:")}
                    {sent.slice(0, 8).toUpperCase()}
                  </strong>
                </p>
                <Link className="button" href="/">
                  {t("Back to Royal")}
                  <ArrowRight size={18} />
                </Link>
              </div>
            ) : review ? (
              <div className="request-review">
                <span className="eyebrow">{t("CHECK THE LITTLE DETAILS")}</span>
                <h2>{t("Ready to send?")}</h2>
                <p>
                  {t(
                    "Review your request, then send it securely to the hospital.",
                  )}
                </p>
                <dl>
                  {[
                    ["Your name", draft.name],
                    ["Phone", draft.phone],
                    ["Your pet", `${draft.pet} · ${t(draft.species || "")}`],
                    ["Care", draft.service],
                    [
                      "Preferred visit",
                      `${draft.date} · ${t(draft.time || "")}`,
                    ],
                    ...(draft.doctor
                      ? [["Preferred clinician", draft.doctor]]
                      : []),
                    ...(draft.notes ? [["Notes", draft.notes]] : []),
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{t(label)}</dt>
                      <dd>
                        {choices.find((choice) => choice.value === value)
                          ?.label || t(value || "")}
                      </dd>
                    </div>
                  ))}
                </dl>
                {error && (
                  <p role="alert" className="admin-error">
                    {error}
                  </p>
                )}
                <button
                  className="button"
                  onClick={() => void send()}
                  disabled={busy}
                >
                  {busy ? t("Sending…") : t("Send request to Royal")}
                  <ArrowRight size={18} />
                </button>
                <div className="review-actions">
                  <button
                    className="text-link"
                    onClick={() => {
                      setReview(false);
                      setRequestKey(crypto.randomUUID());
                    }}
                    disabled={busy}
                  >
                    <ArrowLeft size={16} />
                    {t("Edit details")}
                  </button>
                  <a
                    className="text-link"
                    href={`https://wa.me/${PHONE.slice(1)}?text=${encodeURIComponent(message)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={16} />
                    {t("Use WhatsApp instead")}
                  </a>
                </div>
                <p className="fine-print">
                  {t(
                    "We’ll confirm the appointment after contacting you. For urgent concerns, call the hospital.",
                  )}
                </p>
              </div>
            ) : (
              <form onSubmit={prepare}>
                <div className="form-heading">
                  <span className="step-badge">01</span>
                  <div>
                    <h3>{t("A little about you & your pet")}</h3>
                    <p>
                      {t("All fields are required unless marked optional.")}
                    </p>
                  </div>
                </div>
                <div className="form-grid">
                  <label>
                    {t("Your full name")}
                    <input
                      name="name"
                      required
                      maxLength={100}
                      autoComplete="name"
                      defaultValue={draft.name}
                    />
                  </label>
                  <label>
                    {t("Phone number")}
                    <input
                      name="phone"
                      type="tel"
                      required
                      pattern="[+]?[0-9][0-9 ()\-]{6,24}"
                      maxLength={25}
                      autoComplete="tel"
                      defaultValue={draft.phone}
                    />
                  </label>
                  <label>
                    {t("Your pet’s name")}
                    <input
                      name="pet"
                      required
                      maxLength={80}
                      defaultValue={draft.pet}
                    />
                  </label>
                  <label>
                    {t("Your companion")}
                    <select
                      name="species"
                      required
                      defaultValue={draft.species || ""}
                    >
                      <option value="" disabled>
                        {t("Select pet type")}
                      </option>
                      <option value="Dog">{t("Dog")}</option>
                      <option value="Cat">{t("Cat")}</option>
                      <option value="Bird">{t("Bird")}</option>
                      <option value="Other">{t("Other companion")}</option>
                    </select>
                  </label>
                </div>
                <div className="form-heading second">
                  <span className="step-badge">02</span>
                  <div>
                    <h3>{t("Let’s find the right visit")}</h3>
                    <p>{t("We’ll agree the details with you personally.")}</p>
                  </div>
                </div>
                {draft.doctor && (
                  <p className="preferred-doctor">
                    {t("Preferred clinician:")}
                    {draft.doctor}
                  </p>
                )}
                <label>
                  {t("What can we help with?")}
                  <select
                    name="service"
                    required
                    defaultValue={
                      choices.some((choice) => choice.value === draft.service)
                        ? draft.service
                        : ""
                    }
                  >
                    <option value="" disabled>
                      {t("Select a service or care plan")}
                    </option>
                    {choices.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="form-grid">
                  <label>
                    {t("Preferred date")}
                    <input
                      type="date"
                      name="date"
                      min={today}
                      max={new Date(Date.now() + 366 * 86400000)
                        .toISOString()
                        .slice(0, 10)}
                      required
                      defaultValue={draft.date}
                    />
                  </label>
                  <label>
                    {t("Preferred time")}
                    <select
                      name="time"
                      required
                      defaultValue={draft.time || ""}
                    >
                      <option value="" disabled>
                        {t("Choose a time of day")}
                      </option>
                      <option value="Morning">{t("Morning")}</option>
                      <option value="Afternoon">{t("Afternoon")}</option>
                      <option value="Evening">{t("Evening")}</option>
                      <option value="Any available time">
                        {t("Any available time")}
                      </option>
                    </select>
                  </label>
                </div>
                <label>
                  {t("Anything you’d like us to know? (optional)")}
                  <textarea
                    name="notes"
                    rows={4}
                    maxLength={1500}
                    defaultValue={draft.notes}
                  />
                </label>
                <label className="booking-honeypot" aria-hidden="true">
                  {t("Website")}
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
                <p className="form-note">
                  <ShieldCheck size={17} />
                  {t("We use these details to arrange your pet’s care.")}{" "}
                  <Link href="/privacy">{t("Read our privacy notice.")}</Link>
                </p>
                <button className="button">
                  {t("Review appointment request")}
                  <ArrowRight size={18} />
                </button>
                <p className="fine-print">
                  {t(
                    "Nothing is sent until you review and choose “Send request to Royal”.",
                  )}
                </p>
              </form>
            )}
          </div>
          <aside className="booking-aside">
            <SiteImage
              src={"/rvh/assets/royal-pets.png"}
              mediaKey="booking"
              alt={t("A dog and cat at Royal")}
            />
            <div>
              <h3>{t("You’re in good company.")}</h3>
              <p>
                {t(
                  "A first visit or a familiar face. We’re happy you’re here.",
                )}
              </p>
              <hr />
              <h3>{t("Something urgent?")}</h3>
              <p>
                {t("Call us directly. Please don’t wait for an online reply.")}
              </p>
              <a className="text-link" href={`tel:${PHONE}`}>
                <Phone size={17} />
                {settings.phoneDisplay}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
export function Privacy() {
  const t = useCopy();

  const { PHONE, settings } = useHospital();
  return (
    <div className="royal-home">
      <PageIntro
        eyebrow={t("YOUR INFORMATION")}
        title={t("Privacy, with care.")}
        description={t("How information entered on this website is used.")}
      />
      <section className="section">
        <div className="container privacy-copy">
          <h2>{t("Appointment requests")}</h2>
          <p>
            {t(
              "When you send a request, Royal stores your name, phone number, pet details, preferred visit and any notes you provide. Hospital administrators use this information to contact you, arrange care and manage your request. A request does not confirm an appointment.",
            )}
          </p>
          <h2>{t("Staff access")}</h2>
          <p>
            {t(
              "Appointment details are restricted to signed-in administrators. The staff dashboard uses an essential session cookie to keep administrators signed in. Public visitors do not need an account.",
            )}
          </p>
          <h2>{t("WhatsApp and maps")}</h2>
          <p>
            {t(
              "If you choose WhatsApp, your prepared message opens in WhatsApp and you decide whether to send it. Map links open Google Maps. Those services handle information under their own privacy policies.",
            )}
          </p>
          <h2>{t("Questions or corrections")}</h2>
          <p>
            {t(
              "Contact Royal to ask about information held for your request, request a correction, or discuss deletion and any clinical record obligations. Please avoid sending information unrelated to your pet’s care.",
            )}
          </p>
          <a className="text-link" href={`tel:${PHONE}`}>
            {t("Contact Royal ·")}
            {settings.phoneDisplay}
          </a>
        </div>
      </section>
    </div>
  );
}
