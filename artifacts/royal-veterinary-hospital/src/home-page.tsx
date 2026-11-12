import { Link } from "wouter";
import { useLayoutEffect, useState } from "react";
import {
  ArrowRight,
  Clock3,
  Heart,
  Hospital,
  MapPin,
  Phone,
  UsersRound,
} from "lucide-react";
import { featuredServices } from "./content";
import { services as defaultServices } from "./services-data";
import { useHospital, useSite } from "./site-state";
import { assetUrl, SiteImage, useCopy } from "./website-content";
import { RoyalCurvedPhoto } from "./RoyalCurvedPhoto";
import { RoyalWave } from "./RoyalWave";
import { FAQ } from "./sections";
import { OrderedPage, OrderedSection } from "./OrderedSection";
import { optimizedImageUrl } from "./image-performance";

const cards = [
  ["Consultation", "Comprehensive health check for your pets"],
  [
    "Vaccination",
    "Core and lifestyle vaccines for long-term protection",
  ],
  ["Surgery", "Safe procedures with modern equipment"],
  ["Dental Care", "Cleaner teeth, healthier pets"],
  ["Grooming", "Professional grooming for cleanliness and comfort"],
  ["Diagnostics", "X-ray, ultrasound, and laboratory services"],
] as const;

const benefits = [
  [Clock3, "Emergency Care"],
  [UsersRound, "Experienced Team"],
  [Hospital, "Modern Facilities"],
  [Heart, "Compassionate Care"],
] as const;

function HeroHeadline({ first, second, speed }: { first: string; second: string; speed: string }) {
  const [count, setCount] = useState<number | null>(null);
  const segment = (text: string) =>
    typeof Intl.Segmenter === "function"
      ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), (part) => part.segment)
      : Array.from(text);
  const firstChars = segment(first);
  const secondChars = segment(second);
  const length = firstChars.length + secondChars.length;
  const delay = Math.min(150, Math.max(20, Number(speed) || 55));

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(null);
      return;
    }
    setCount(0);
    let current = 0;
    const timer = window.setInterval(() => {
      current += 1;
      setCount(current);
      if (current >= length) window.clearInterval(timer);
    }, delay);
    return () => window.clearInterval(timer);
  }, [first, second, length, delay]);

  const firstVisible = count === null ? first : firstChars.slice(0, count).join("");
  const secondVisible = count === null ? second : secondChars.slice(0, Math.max(0, count - firstChars.length)).join("");

  return (
    <h1 className="royal-hero-headline" aria-label={`${first} ${second}`}>
      <span className="royal-hero-headline-reserve" aria-hidden="true">
        <span>{first}</span><span>{second}</span>
      </span>
      <span className="royal-hero-headline-animated" aria-hidden="true">
        <span>{firstVisible}</span><span>{secondVisible}</span>
      </span>
    </h1>
  );
}

export function HomePage() {
  const t = useCopy();
  const { settings, PHONE, MAP, services, team, media } = useHospital();
  const { content } = useSite();
  const { sections } = content;

  return (
    <OrderedPage>
      {/* 1. HERO SECTION (FIGMA GROUP 2) */}
      {sections.homeHero && <OrderedSection id="homeHero"><section className="royal-hero">
        <div className="royal-hero-copy">
          <HeroHeadline first={settings.heroLine1} second={settings.heroLine2} speed={settings.heroTypingSpeed} />
          <p className="royal-hero-desc">{settings.heroDescription}</p>
          <div className="royal-hero-actions">
            <a href={`tel:${PHONE}`} className="royal-action solid royal-phone-pill">
              <span className="action-circle-icon">
                <Phone size={17} fill="currentColor" />
              </span>
              <bdi>{settings.phoneDisplay}</bdi>
            </a>
            <Link href="/appointment" className="royal-action royal-appoint-pill">
              <img src="/rvh/assets/appointment-calendar.svg" width="26" height="26" alt="" aria-hidden="true" />
              <span>{t("Appointment")}</span>
            </Link>
          </div>
        </div>

        <div className="royal-hero-art" aria-hidden="true">
          <img
            src="/rvh/assets/figma-hero-circles.svg"
            alt=""
            className="royal-hero-circles-bg"
          />
          <picture>
            <source media="(max-width: 760px)" srcSet={optimizedImageUrl(media.heroMobile.src)} />
            <img
              src={optimizedImageUrl(media.heroDesktop.src)}
              alt=""
              className="royal-hero-companions-img"
              fetchPriority="high"
            />
          </picture>
        </div>
      </section>

      {/* Hero bottom green wave */}
      <RoyalWave className="royal-wave hero-wave" /></OrderedSection>}

      {sections.homeBenefits && <OrderedSection id="homeBenefits"><div className="royal-body">
        {/* 2. BENEFITS / PERKS */}
        <div className="royal-benefits">
          {benefits.map(([Icon, label]) => (
            <div key={label}>
              <Icon />
              <span>{t(label)}</span>
            </div>
          ))}
        </div>
      </div></OrderedSection>}

        {/* 3. OUR SERVICES SECTION */}
      {sections.homeServices && <OrderedSection id="homeServices"><div className="royal-body"><section className="royal-services" id="services">
          <div className="royal-heading">
            <span>{t("Our Services")}</span>
            <h2>
              {sections.pageServices ? <Link href="/services">{t("Comprehensive Veterinary Care")}</Link> : t("Comprehensive Veterinary Care")}
            </h2>
          </div>
          <div className="royal-cards">
            {content.homepageServices
              .map((slug) => ({ slug, index: featuredServices.findIndex((item) => item.slug === slug) }))
              .filter(({ slug }) => services.some((item) => item.slug === slug && !item.hidden))
              .slice(0, Math.max(1, Math.min(60, Number(settings.homepageServiceCount) || 5)))
              .map(({ slug, index: i }) => {
              const service = services.find(
                (item) => item.slug === slug && !item.hidden,
              );
              if (!service) return null;
              const stored = content.services.find(
                (item) => item.slug === slug,
              );
              const original = defaultServices.find(
                (item) => item.slug === slug,
              );
              const [title, description] = cards[i] ?? [service.title, service.short];
              return (
                <Link
                  className="royal-card care-card-royal home-service-card"
                  key={slug}
                  href={`/service-${slug}`}
                >
                  <div className="royal-card-visual">
                    <SiteImage className="royal-service-icon" src={assetUrl(service.icon)} alt="" loading="lazy" />
                  </div>
                  <h3>
                      {stored?.title === original?.title
                        ? t(title)
                        : service.title}
                  </h3>
                  <p>
                      {stored?.short === original?.short
                        ? t(description)
                        : service.short}
                  </p>
                </Link>
              );
            })}
          </div>
          {sections.pageServices && <div className="royal-services-more">
            <Link href="/services" className="royal-action royal-appoint-pill">
              {t("Show all services")} <ArrowRight size={17} />
            </Link>
          </div>}
        </section></div></OrderedSection>}

      {/* Wave divider after services */}
      {sections.homeAbout && <OrderedSection id="homeAbout"><RoyalWave className="royal-wave section-wave" />

      <div className="royal-body">
        {/* 4. ABOUT US SECTION */}
        <section className="royal-about" id="about">
          <div className="royal-heading">
            <span>{t("About Us")}</span>
            <h2>{t("Royal Veterinary Hospital")}</h2>
            <p>
              {t(
                "At Royal Veterinary Hospital, we are committed to providing high-quality veterinary care with modern facilities, advanced equipment, and a compassionate team you can trust.",
              )}
            </p>
            {sections.pageAbout && <Link className="royal-action solid" href="/about">
              <span>{t("Our Story")}</span> <ArrowRight size={16} />
            </Link>}
          </div>
          <div className="royal-feature-visual">
            <RoyalCurvedPhoto
              src={media.about?.src || "/rvh/assets/royal-hospital.png"}
              alt={t("Royal Veterinary Hospital entrance")}
              className="royal-curved-frame"
            />
          </div>
        </section>
      </div></OrderedSection>}

      {/* Wave divider before team */}
      {sections.homeTeam && <OrderedSection id="homeTeam"><RoyalWave className="royal-wave section-wave flip-wave" />

      <div className="royal-body">
        {/* 5. OUR TEAM SECTION */}
        <section className="royal-team" id="team">
          <div className="royal-heading">
            <span>{t("Our Team")}</span>
            <h2>
              {sections.pageTeam ? <Link href="/team">{t("Experienced Veterinarians")}</Link> : t("Experienced Veterinarians")}
            </h2>
          </div>
          <div className="royal-roster">
            {team.slice(0, 4).map(([name, role, , file]) => (
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
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div></OrderedSection>}

      {/* Wave divider before visit */}
      {sections.homeVisit && <OrderedSection id="homeVisit"><RoyalWave className="royal-wave section-wave" />

      <div className="royal-body">
        {/* 6. VISIT US SECTION */}
        <section className="royal-visit" id="visit">
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
              src={media.visit?.src || "/rvh/assets/royal-hospital-map.png"}
              alt={t("Hospital location map")}
              className="royal-curved-frame"
            />
            <a href={MAP} target="_blank" rel="noreferrer" className="map-badge">
              <MapPin size={17} />
              {t("View on Map")}
            </a>
          </div>
        </section>
      </div></OrderedSection>}

      {/* Wave divider before FAQ */}
      {sections.homeFaq && <OrderedSection id="homeFaq"><RoyalWave className="royal-wave section-wave" />

      <div className="royal-body">
        {/* 7. FREQUENTLY ASKED QUESTIONS */}
        <FAQ />
      </div></OrderedSection>}
    </OrderedPage>
  );
}
