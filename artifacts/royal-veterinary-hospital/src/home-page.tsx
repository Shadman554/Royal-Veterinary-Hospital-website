import { Link } from "wouter";
import {
  ArrowRight,
  Clock3,
  Heart,
  Hospital,
  MapPin,
  Monitor,
  Phone,
  Scissors,
  Stethoscope,
  Syringe,
  UsersRound,
} from "lucide-react";
import { featuredServices } from "./content";
import { services as defaultServices } from "./services-data";
import { useHospital, useSite } from "./site-state";
import { assetUrl, SiteImage, useCopy } from "./website-content";
import { RoyalCurvedPhoto } from "./RoyalCurvedPhoto";
import { RoyalWave } from "./RoyalWave";
import { servicePhotoStyle } from "./media-display";
import { FAQ } from "./sections";

function Tooth() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M12 4c-3-2-8-2-9 3-.6 3 1.2 5 2.3 10 .5 2.4 1.2 4 2.5 4 2.2 0 1.5-8 4.2-8s2 8 4.2 8c1.3 0 2-1.6 2.5-4C19.8 12 21.6 10 21 7c-1-5-6-5-9-3Z" />
    </svg>
  );
}

const cards = [
  ["Consultation", "Comprehensive health check for your pets", Stethoscope],
  [
    "Vaccination",
    "Core and lifestyle vaccines for long-term protection",
    Syringe,
  ],
  ["Surgery", "Safe procedures with modern equipment", Scissors],
  ["Dental Care", "Cleaner teeth, healthier pets", Tooth],
  ["Grooming", "Professional grooming for cleanliness and comfort", Scissors],
  ["Diagnostics", "X-ray, ultrasound, and laboratory services", Monitor],
] as const;

const benefits = [
  [Clock3, "Emergency Care"],
  [UsersRound, "Experienced Team"],
  [Hospital, "Modern Facilities"],
  [Heart, "Compassionate Care"],
] as const;

export function HomePage() {
  const t = useCopy();
  const { settings, PHONE, MAP, services, team, media } = useHospital();
  const { content } = useSite();

  return (
    <div className="royal-home">
      {/* 1. HERO SECTION (FIGMA GROUP 2) */}
      <section className="royal-hero">
        <div className="royal-hero-copy">
          <h1>
            {settings.heroLine1}
            <span>{settings.heroLine2}</span>
          </h1>
          <p className="royal-hero-desc">{settings.heroDescription}</p>
          <div className="royal-hero-actions">
            <a href={`tel:${PHONE}`} className="royal-action solid royal-phone-pill">
              <span className="action-circle-icon">
                <Phone size={17} fill="currentColor" />
              </span>
              <bdi>{settings.phoneDisplay}</bdi>
            </a>
            <Link href="/appointment" className="royal-action royal-appoint-pill">
              <img src="/rvh/assets/appointment-calendar.svg" width="18" height="18" alt="" aria-hidden="true" />
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
            <source media="(max-width: 760px)" srcSet={media.heroMobile.src} />
            <img
              src={media.heroDesktop.src}
              alt=""
              className="royal-hero-companions-img"
              fetchPriority="high"
            />
          </picture>
        </div>
      </section>

      {/* Hero bottom green wave */}
      <RoyalWave className="royal-wave hero-wave" />

      <div className="royal-body">
        {/* 2. BENEFITS / PERKS */}
        <div className="royal-benefits">
          {benefits.map(([Icon, label]) => (
            <div key={label}>
              <Icon />
              <span>{t(label)}</span>
            </div>
          ))}
        </div>

        {/* 3. OUR SERVICES SECTION */}
        <section className="royal-services" id="services">
          <div className="royal-heading">
            <span>{t("Our Services")}</span>
            <h2>
              <Link href="/services">{t("Comprehensive Veterinary Care")}</Link>
            </h2>
          </div>
          <div className="royal-cards">
            {featuredServices.slice(0, 5).map(({ slug }, i) => {
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
              const [title, description, Icon] = cards[i];
              const entry = media[`featured-${i}`] || { src: "/rvh/assets/royal-services.png" };
              return (
                <Link
                  className="royal-card"
                  key={slug}
                  href={`/service-${slug}`}
                >
                  <div className="royal-card-visual">
                    <div className="royal-card-photo" style={servicePhotoStyle(i, entry.src)} aria-hidden="true" />
                    <Icon className="royal-card-pill-icon" />
                  </div>
                  <div className="royal-card-content">
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
                    <span className="royal-card-link">
                      {t("Learn More")} <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="royal-services-more">
            <Link href="/services" className="royal-action royal-appoint-pill">
              {t("Show all services")} <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </div>

      {/* Wave divider after services */}
      <RoyalWave className="royal-wave section-wave" />

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
            <Link className="royal-action solid" href="/about">
              <span>{t("Our Story")}</span> <ArrowRight size={16} />
            </Link>
          </div>
          <div className="royal-feature-visual">
            <RoyalCurvedPhoto
              src={media.about?.src || "/rvh/assets/royal-hospital.png"}
              alt={t("Royal Veterinary Hospital entrance")}
              className="royal-curved-frame"
            />
          </div>
        </section>
      </div>

      {/* Wave divider before team */}
      <RoyalWave className="royal-wave section-wave flip-wave" />

      <div className="royal-body">
        {/* 5. OUR TEAM SECTION */}
        <section className="royal-team" id="team">
          <div className="royal-heading">
            <span>{t("Our Team")}</span>
            <h2>
              <Link href="/team">{t("Experienced Veterinarians")}</Link>
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
      </div>

      {/* Wave divider before visit */}
      <RoyalWave className="royal-wave section-wave" />

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
      </div>

      {/* Wave divider before FAQ */}
      <RoyalWave className="royal-wave section-wave" />

      <div className="royal-body">
        {/* 7. FREQUENTLY ASKED QUESTIONS */}
        <FAQ />
      </div>
    </div>
  );
}
