import { SiteImage, assetUrl } from "./website-content";
import { useCopy } from "./website-content";
import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowUpRight,
  ArrowRight,
  Phone,
  Clock3,
  Heart,
  PawPrint,
  UsersRound,
  Plus,
  Minus,
  Check,
  MapPin,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useHospital } from "./site-state";
import { BookLink, SectionHead } from "./site-ui";
import { RoyalCurvedPhoto } from "./RoyalCurvedPhoto";
import { RoyalWave } from "./RoyalWave";

export function About({ full = false }: { full?: boolean }) {
  const t = useCopy();
  const { media } = useHospital();

  return (
    <section className="royal-about royal-body" id="about" style={{ padding: 'clamp(40px, 5vw, 70px) 0' }}>
      <div className="royal-about-visual royal-feature-visual">
        <RoyalCurvedPhoto
          src={media.about?.src || "/rvh/assets/royal-hospital.png"}
          alt={t("Royal Veterinary Hospital entrance")}
          className="royal-curved-frame"
        />
      </div>
      <div className="royal-heading">
        <span>{t("About Us")}</span>
        <h2>{t("Dedicated To Pet Health & Happiness")}</h2>
        <p>
          {t(
            "Royal Veterinary Hospital provides compassionate, high-standard veterinary care in Sulaymaniyah. Our multidisciplinary team and modern clinic environment ensure every pet receives the attention and expertise they deserve.",
          )}
        </p>
        <p>
          {t(
            "At Royal Veterinary Hospital, we bring thoughtful veterinary medicine and a personal approach together. We listen first, explain clearly, and make time for the little things that help your pet feel safe.",
          )}
        </p>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '22px' }}>
          <Link href={full ? "/team" : "/about"} className="royal-action royal-more-pill">
            {full ? t("Meet Our Team") : t("Learn More")}
            <ArrowRight size={16} />
          </Link>
          <Link href="/appointment" className="royal-action solid">
            {t("Book an appointment")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
export function CareJourney() {
  const t = useCopy();

  const steps = [
    [
      t("Let’s get acquainted"),
      t(
        "Tell us about your companion. We’ll help you find the right visit and a time that suits you.",
      ),
    ],
    [
      t("A visit at their pace"),
      t(
        "A warm welcome, a careful examination, and plenty of room for all your questions.",
      ),
    ],
    [
      t("Good care goes home"),
      t(
        "Leave with clear next steps and a team you can turn to as your pet’s needs change.",
      ),
    ],
  ];
  return (
    <section className="journey-section">
      <div className="container">
        <div className="journey-heading">
          <span className="eyebrow">{t("THE ROYAL EXPERIENCE")}</span>
          <h2>
            {t("A little less worry.")}
            <br />
            <span>{t("A lot more care.")}</span>
          </h2>
          <PawPrint aria-hidden="true" />
        </div>
        <div className="journey-grid">
          {steps.map(([title, description], i) => (
            <article key={title}>
              <div className="step-line">
                <span>0{i + 1}</span>
                <ArrowRight size={22} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
export function Packages({ full = false }: { full?: boolean }) {
  const t = useCopy();

  const { plans } = useHospital();
  const icons = [PawPrint, ShieldCheck, Heart];
  return (
    <section className="royal-body" id="packages" style={{ padding: 'clamp(40px, 5vw, 70px) 0' }}>
      <div className="royal-heading" style={{ marginBottom: 'clamp(24px, 3vw, 40px)' }}>
        <span>{t("PLAN FOR MORE HAPPY YEARS")}</span>
        <h2>{t("Good care. Made simpler.")}</h2>
        <p style={{ maxWidth: '640px', margin: '12px 0 0', color: 'var(--muted)', fontSize: 'clamp(14px, 1.2vw, 17px)' }}>
          {t("Thoughtfully bundled care for every chapter of their life. Find the starting point that feels right for your pet.")}
        </p>
      </div>
      <div className="plans-grid">
        {plans
          .filter((plan) => !plan.hidden)
          .map((plan, i) => {
            const Icon = icons[i % icons.length] || PawPrint;
            return (
            <article
              key={plan.name}
              className={`plan ${i === 1 ? "featured-plan" : ""}`}
            >
              <div className="plan-top">
                <Icon size={27} />
                <span>{plan.label}</span>
              </div>
              <h3>{plan.name}</h3>
              <p>{plan.desc}</p>
              <div className="plan-price">
                <strong>{plan.price}</strong>
                <span>{t("IQD / package")}</span>
              </div>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
              <BookLink
                className="royal-action solid"
                service={`${plan.name} package`}
              >
                {t("Choose this plan")}
              </BookLink>
            </article>
          );
        })}
      </div>
      <p className="fine-print">
        {t(
          "Our team will confirm the right plan, inclusions and final pricing for your pet before booking.",
        )}
      </p>
    </section>
  );
}
export function Team({ full = false }: { full?: boolean }) {
  const t = useCopy();
  const { team } = useHospital();
  const count = full ? team.length : 4;

  return (
    <section className="royal-team royal-body" id="team" style={{ padding: 'clamp(40px, 5vw, 70px) 0' }}>
      {!full && (
        <div className="royal-heading" style={{ marginBottom: 'clamp(24px, 3vw, 40px)' }}>
          <span>{t("Our Team")}</span>
          <h2>{t("Experienced Veterinarians")}</h2>
          <p style={{ maxWidth: '640px', margin: '12px 0 0', color: 'var(--muted)', fontSize: 'clamp(14px, 1.2vw, 17px)' }}>
            {t("Different specialties. One shared purpose: helping your companion feel their very best.")}
          </p>
        </div>
      )}
      <div className="royal-roster">
        {team.slice(0, count).map(([name, role, focus, file]) => (
          <Link
            key={name}
            href={`/appointment?doctor=${encodeURIComponent(name)}`}
            className="team-card"
          >
            <div className="team-avatar-wrap">
              <SiteImage src={assetUrl(file)} alt={name} loading="lazy" />
              <span className="team-arrow-badge" aria-hidden="true">
                <ArrowRight size={16} />
              </span>
            </div>
            <div className="team-info">
              <h3>{name}</h3>
              <small>{role}</small>
              {focus && <small style={{ color: 'var(--green)', fontWeight: 600 }}>{focus}</small>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
export function FAQ() {
  const t = useCopy();

  const { PHONE, faqs } = useHospital();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="section faq-section" id="faq">
      <div className="container faq-grid">
        <div className="faq-intro">
          <span className="eyebrow">{t("A LITTLE REASSURANCE")}</span>
          <h2>
            {t("Good questions.")}
            <br />
            <span className="green">{t("Thoughtful answers.")}</span>
          </h2>
          <p>
            {t("Getting ready for a visit? Let’s make it a little easier.")}
          </p>
          <a className="text-link" href={`tel:${PHONE}`}>
            {t("Ask us anything")}
            <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer], i) => {
            const isOpen = open === i;
            return (
              <div
                key={question}
                className={`faq-item ${isOpen ? "is-open" : ""}`}
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${i}`}
                  >
                    <span>{t(question)}</span>
                    <span className="faq-icon-wrap" aria-hidden="true">
                      <ChevronDown size={18} className="faq-chevron" />
                    </span>
                  </button>
                </h3>
                <div
                  className="faq-answer"
                  id={`faq-answer-${i}`}
                  aria-hidden={!isOpen}
                >
                  <div className="faq-answer-inner">
                    <p>{t(answer)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
export function Visit({ full = false }: { full?: boolean }) {
  const t = useCopy();
  const { PHONE, MAP, settings, media } = useHospital();

  return (
    <section className="royal-visit royal-body" id="visit" style={{ padding: 'clamp(40px, 5vw, 70px) 0' }}>
      <div className="royal-heading">
        <span>{t("Visit Us")}</span>
        <h2>
          {t("Same Compassion.")}
          <br />
          {t("A Healthier Tomorrow.")}
        </h2>
        <p className="royal-address">
          <MapPin size={20} />
          <span>
            {settings.address}, {settings.city}
            <br />
            {settings.region}
          </span>
        </p>
        <div className="royal-directions">
          <a href={`tel:${PHONE}`}>
            <Phone fill="currentColor" size={17} />
            <bdi>{settings.phoneDisplay}</bdi>
          </a>
          <a href={MAP} target="_blank" rel="noreferrer">
            {t("Directions")} <ArrowRight size={16} />
          </a>
        </div>
      </div>
      <div className="royal-reception royal-feature-visual">
        <RoyalCurvedPhoto
          src={media.visit?.src || "/rvh/assets/reference-reception.jpg"}
          alt={t("Hospital reception")}
          className="royal-curved-frame"
        />
        <a href={MAP} target="_blank" rel="noreferrer" className="map-badge">
          <MapPin size={17} />
          {t("View on Map")}
        </a>
      </div>
    </section>
  );
}
