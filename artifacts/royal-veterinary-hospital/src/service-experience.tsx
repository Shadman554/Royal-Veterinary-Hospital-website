import { SiteImage, assetUrl } from "./website-content";
import { useCopy } from "./website-content";
import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Phone,
  Search,
  SlidersHorizontal,
  X,
  Plus,
  Check,
  HeartPulse,
  Clock3,
} from "lucide-react";
import { ASSETS, PHONE, featuredServices } from "./content";
import { servicePhotoStyle } from "./media-display";
import {
  categories,
  services,
  categorySteps,
  type Service,
} from "./services-data";
import { BookLink, NotFound, PageIntro } from "./site-ui";
import { RoyalWave } from "./RoyalWave";
import { useHospital } from "./site-state";
import { OrderedPage, OrderedSection } from "./OrderedSection";

function CareCard({ service }: { service: Service }) {
  const t = useCopy();
  const { media } = useHospital();
  const index = featuredServices.findIndex((item) => item.slug === service.slug);
  const photo = index >= 0 ? media[`featured-${index}`] : undefined;

  return (
    <Link href={`/service-${service.slug}`} className="royal-card care-card-royal">
      <div className="royal-card-visual">
        {photo ? (
          <div className="care-card-photo" style={servicePhotoStyle(index, photo.src)} aria-hidden="true" />
        ) : (
          <SiteImage src={assetUrl(service.icon)} alt="" loading="lazy" style={{ width: "64px", height: "64px", objectFit: "contain" }} />
        )}
      </div>
      <h3>{service.title}</h3>
      <p>{service.short}</p>
    </Link>
  );
}

export function ServiceDirectory() {
  const t = useCopy();

  const { services, PHONE, settings, categories, categorySteps, sections } =
    useHospital();
  const visibleServices = services.filter((service) => !service.hidden);
  const [category, setCategory] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get(
      "category",
    );
    return categories.some((c) => c.id === requested) ? requested! : "all";
  });
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const normalise = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  const words = normalise(query).split(/\s+/).filter(Boolean);
  const filtered = visibleServices.filter((service) => {
    const haystack = normalise(
      `${service.title} ${service.short} ${service.keywords || ""} ${service.intro} ${categories.find((c) => c.id === service.category)?.title}`,
    );
    return (
      (category === "all" || category === service.category) &&
      words.every((word) => haystack.includes(word))
    );
  });
  const reset = () => {
    setCategory("all");
    setQuery("");
  };
  return (
    <OrderedPage>
      {sections.servicesIntro && <OrderedSection id="servicesIntro"><PageIntro
        imageKey="directory"
        eyebrow={t("THE WHOLE PICTURE OF CARE")}
        title={
          <>
            {t("Every Little Need.")}
            <br />
            <span>{t("Every Stage Of Life.")}</span>
          </>
        }
        description={t(
          "From a first check-up to complex medical and surgical support. Discover the care that’s right for your companion.",
        )}
      /></OrderedSection>}
      {sections.servicesDirectory && <OrderedSection id="servicesDirectory"><section className="care-directory section" id="care-directory">
        <div className="container">
          <div className="directory-heading">
            <div>
              <h2>{t("How can we help?")}</h2>
            </div>
            <div className="directory-search-row">
            <label className="care-search">
              <Search size={20} />
              <span className="sr-only">{t("Search services")}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("Search services")}
                type="search"
              />
              {query && (
                <button
                  aria-label={t("Clear search")}
                  onClick={() => setQuery("")}
                >
                  <X size={18} />
                </button>
              )}
            </label>
            <button
              type="button"
              className="care-filter-toggle"
              aria-label={t("Service categories")}
              aria-expanded={filtersOpen}
              aria-controls="service-categories"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal size={20} />
              {category !== "all" && <span className="care-filter-dot" />}
            </button>
            </div>
          </div>
          <div className="directory-layout">
            <aside className="directory-sidebar">
              <nav
                aria-label={t("Service categories")}
                id="service-categories"
                className={`care-categories${filtersOpen ? " filters-open" : ""}`}
              >
                <button
                  aria-pressed={category === "all"}
                  className={category === "all" ? "active" : ""}
                  onClick={() => { setCategory("all"); setFiltersOpen(false); }}
                >
                  <span>{t("All services")}</span>
                  <span>{visibleServices.length}</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    aria-pressed={category === c.id}
                    className={category === c.id ? "active" : ""}
                    onClick={() => { setCategory(c.id); setFiltersOpen(false); }}
                  >
                    <span>{c.title}</span>
                    <span>
                      {visibleServices.filter((s) => s.category === c.id).length}
                    </span>
                  </button>
                ))}
              </nav>
              <div className="directory-help">
                <HeartPulse size={27} />
                <h3>{t("A little guidance?")}</h3>
                <p>
                  {t(
                    "Tell us what you’ve noticed. We’ll help you find the right place to start.",
                  )}
                </p>
                <a className="text-link" href={`tel:${PHONE}`}>
                  {t("Talk to our team")}
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </aside>
            <div className="directory-results">
              <div className="results-meta" role="status" aria-live="polite">
                <span>
                  {category !== "all" && <><strong>{categories.find((item) => item.id === category)?.title}</strong> · </>}
                  {filtered.length}{" "}
                  {filtered.length === 1 ? t("service") : t("services")}
                  {query && (
                    <>
                      {t("matching “")}
                      {query}”
                    </>
                  )}
                </span>
                {(query || category !== "all") && (
                  <button onClick={reset}>
                    {t("Reset filters")}
                    <X size={13} />
                  </button>
                )}
              </div>
              {filtered.length === 0 && (
                <div className="care-empty">
                  <Search size={32} />
                  <h3>{t("Let’s try another word.")}</h3>
                  <p>
                    {t(
                      "Search by a service, your pet or a concern. You can also call us for guidance.",
                    )}
                  </p>
                  <button className="outline-button" onClick={reset}>
                    {t("Show all services")}
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
              {categories.map((c) => {
                const group = filtered.filter((s) => s.category === c.id);
                if (!group.length) return null;
                return (
                  <section
                    className={`care-group ${c.id === "emergency" ? "emergency-group" : ""}`}
                    key={c.id}
                    aria-labelledby={`group-${c.id}`}
                  >
                    <div className="care-group-heading">
                      <div>
                        <h2 id={`group-${c.id}`}>{c.title}</h2>
                        <p>{c.short}</p>
                      </div>
                      <span className="group-count">
                        {group.length.toString().padStart(2, "0")}
                      </span>
                    </div>
                    {c.id === "emergency" ? (
                      <div className="directory-emergency">
                        <div>
                          <span className="emergency-cross">
                            <Plus size={27} />
                          </span>
                          <h3>{t("When it can’t wait, we’re here.")}</h3>
                          <p>
                            {t(
                              "Breathing difficulty, collapse, serious injury or suspected poisoning? Call us immediately.",
                            )}
                          </p>
                          <Link
                            href="/service-emergency-pet-care"
                            className="text-link"
                          >
                            {t("Read our emergency guide")}
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                        <a href={`tel:${PHONE}`} className="button">
                          <Phone size={18} />
                          {settings.phoneDisplay}
                        </a>
                      </div>
                    ) : (
                      <div className="care-card-grid">
                        {group.map((s) => (
                          <CareCard service={s} key={s.slug} />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </section></OrderedSection>}
      {sections.servicesContact && <OrderedSection id="servicesContact"><section className="care-bottom-note">
        <div className="container">
          <div>
            <h2>{t("One conversation.")} {t("A clearer way forward.")}</h2>
          </div>
          <div>
            <p>
              {t(
                "You don’t need to know which service to choose. Start with a consultation and we’ll work through your pet’s needs together.",
              )}
            </p>
            <BookLink service="Pet consultation" />
          </div>
        </div>
      </section></OrderedSection>}
    </OrderedPage>
  );
}

export function ServiceDetail({ slug }: { slug: string }) {
  const t = useCopy();

  const { services, PHONE, settings, categories, categorySteps, sections } =
    useHospital();
  const service = services.find((s) => s.slug === slug);
  if (!service) return <NotFound />;
  const category = categories.find((c) => c.id === service.category)!;
  const emergency = service.category === "emergency";
  const convenience = service.category === "everyday";
  const related = service.related
    .map((slug) => services.find((s) => s.slug === slug))
    .filter((s): s is Service => !!s && !s.hidden);
  return (
    <div className="royal-home">
      <section className={`care-detail-hero ${emergency ? "urgent-hero" : ""}`}>
        <div className="container">
          <div className="breadcrumbs">
            <Link href="/">{t("Home")}</Link>
            <span>/</span>
            {sections.pageServices && <><Link href="/services">{t("Our services")}</Link>
            <span>/</span></>}
            <span>{service.title}</span>
          </div>
          <div className="care-detail-heading">
            <div>
              <span className="eyebrow">{category.title}</span>
              <h1>{service.title}</h1>
              <p>{service.short}</p>
              <div className="care-detail-actions">
                {emergency ? (
                  <a className="button" href={`tel:${PHONE}`}>
                    <Phone size={18} />
                    {t("Call the emergency team")}
                  </a>
                ) : (
                  <BookLink service={service.title}>
                    {convenience
                      ? t("Enquire about this service")
                      : t("Arrange a consultation")}
                  </BookLink>
                )}
                <a className="text-link" href="#care-overview">
                  {t("Explore the care")}
                  <ArrowRight size={17} />
                </a>
              </div>
            </div>
            <div className="care-detail-emblem">
              <SiteImage src={assetUrl(service.icon)} alt="" />
              <span>{t("ROYAL VETERINARY HOSPITAL")}</span>
            </div>
          </div>
        </div>
      </section>
      <RoyalWave className="royal-wave hero-wave" />
      <div className="care-jump-bar">
        <nav className="container" aria-label={t("On this page")}>
          <span>{t("IN THIS GUIDE")}</span>
          <a href="#care-overview">{t("Overview")}</a>
          <a href="#care-includes">{t("What we offer")}</a>
          <a href="#care-visit">
            {convenience ? t("When to enquire") : t("When to visit")}
          </a>
          <a href="#care-prepare">{t("Your visit")}</a>
          <a href="#care-questions">{t("Questions")}</a>
        </nav>
      </div>
      <section className="section care-guide-section">
        <div className="container care-guide-layout">
          <article className="care-guide">
            <section id="care-overview">
              <span className="eyebrow">{t("UNDERSTANDING THE CARE")}</span>
              <h2>{service.short}</h2>
              <p className="care-lead">{service.intro}</p>
            </section>
            <section id="care-includes">
              <div className="guide-section-title">
                <span>01</span>
                <h2>{t("What we can help with")}</h2>
              </div>
              <div className="care-topics">
                {service.topics.map(([title, text, icon]) => (
                  <div className="care-topic" key={title}>
                    <SiteImage src={assetUrl(icon)} alt="" loading="lazy" />
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section id="care-visit" className="care-signs">
              <span className="eyebrow">
                {convenience
                  ? t("MAKING LIFE A LITTLE EASIER")
                  : t("KNOWING WHEN TO REACH OUT")}
              </span>
              <h2>
                {emergency
                  ? t("Call immediately if you notice")
                  : convenience
                    ? t("This service may help with")
                    : t("When to arrange a visit")}
              </h2>
              <ul>
                {service.signs.map((sign) => (
                  <li key={sign}>
                    <Check size={18} />
                    {sign}
                  </li>
                ))}
              </ul>
              {!convenience && (
                <p className="care-signs-note">
                  <HeartPulse size={18} />
                  {t(
                    "If your pet is suddenly very unwell, call us instead of waiting for an online appointment.",
                  )}
                </p>
              )}
            </section>
            <section id="care-prepare">
              <div className="guide-section-title">
                <span>02</span>
                <h2>
                  {emergency
                    ? t("What happens next")
                    : t("Your visit, step by step")}
                </h2>
              </div>
              <ol className="care-steps">
                {categorySteps[service.category].map(([title, text], i) => (
                  <li key={title}>
                    <span>0{i + 1}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="care-preparation">
                <div>
                  <span className="eyebrow">{t("BEFORE YOUR VISIT")}</span>
                  <h3>{t("A little preparation helps.")}</h3>
                  <p>{service.prep}</p>
                </div>
                <div>
                  <span className="eyebrow">{t("AFTER YOUR VISIT")}</span>
                  <h3>{t("Care carries on at home.")}</h3>
                  <p>{service.after}</p>
                </div>
              </div>
            </section>
            <section id="care-questions">
              <div className="guide-section-title">
                <span>03</span>
                <h2>{t("A few common questions")}</h2>
              </div>
              <div className="care-faqs">
                {[
                  ...service.faqs,
                  [
                    "How do I arrange this service?",
                    emergency
                      ? `Call ${settings.phoneDisplay} immediately. Tell the team what has happened and follow their advice on arrival.`
                      : `Use the enquiry button or call ${settings.phoneDisplay}. The team will confirm the right appointment, preparation and expected costs. Online requests are confirmed only after you hear from us.`,
                  ],
                ].map(([q, a]) => (
                  <details key={q}>
                    <summary>
                      {q}
                      <Plus size={19} />
                    </summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </section>
            <p className="care-guide-footnote">
              {t(
                "This guide explains the service in general. Your pet’s examination and individual needs determine the advice, tests and treatment recommended.",
              )}
            </p>
            {sections.pageServices && <Link href="/services" className="text-link">
              <ArrowLeft size={16} />
              {t("Back to all services")}
            </Link>}
          </article>
          <aside className="care-guide-aside">
            <div className="care-booking-card">
              <SiteImage src={assetUrl(service.icon)} alt="" />
              <span className="eyebrow">{t("HERE FOR YOU BOTH")}</span>
              <h3>
                {emergency ? t("Let’s help them now.") : t("A good next step.")}
              </h3>
              <p>
                {emergency
                  ? t("Call us now. Please do not wait for an online reply.")
                  : t(
                      "Tell us a little about your companion. We’ll help you arrange the right care.",
                    )}
              </p>
              {emergency ? (
                <a className="button" href={`tel:${PHONE}`}>
                  <Phone size={17} />
                  {t("Call now")}
                </a>
              ) : (
                <BookLink service={service.title}>
                  {convenience ? t("Enquire now") : t("Request a visit")}
                </BookLink>
              )}
              <a className="care-booking-phone" href={`tel:${PHONE}`}>
                <Phone size={16} />
                {settings.phoneDisplay}
              </a>
              <small>
                {emergency
                  ? t("Emergency care · 24 hours a day")
                  : t("A request is confirmed by our team before your visit.")}
              </small>
            </div>
            <div className="care-aside-photo">
              <SiteImage
                src={"/rvh/assets/royal-hospital.png"}
                mediaKey="serviceHospital"
                alt={t("Royal Veterinary Hospital entrance")}
                loading="lazy"
              />
              <span>
                {t("Your familiar place for care.")}
                <br />
                <strong>
                  {t("Royal ·")}
                  {settings.city}
                </strong>
              </span>
            </div>
          </aside>
        </div>
      </section>
      <section className="care-related section">
        <div className="container">
          <div className="related-heading">
            <div>
              <span className="eyebrow">{t("CONNECTED CARE")}</span>
              <h2>{t("You might also explore")}</h2>
            </div>
            {sections.pageServices && <Link href="/services" className="text-link">
              {t("All services")}
              <ArrowRight size={17} />
            </Link>}
          </div>
          <div className="care-card-grid">
            {related.map((s) => (
              <CareCard service={s} key={s.slug} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
