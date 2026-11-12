import { SiteImage, useCopy } from "./website-content";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowUpRight,
  ArrowRight,
  Phone,
  Heart,
  Menu,
  X,
  MapPin,
  HeartPulse,
  MessageCircle,
} from "lucide-react";
import { useHospital, useSite } from "./site-state";
import { LanguageSwitch } from "./language";
import { RoyalWave } from "./RoyalWave";
export function BookLink({
  children,
  className = "button",
  service = "",
}: {
  children?: ReactNode;
  className?: string;
  service?: string;
}) {
  const t = useCopy();
  const { content } = useSite();
  const localized = useHospital();
  const selected = localized.services.find(
    (s) => s.title === service || s.slug === service,
  );
  const planIndex = localized.plans.findIndex(
    (p) => `${p.name} package` === service,
  );
  const canonical = selected
    ? content.services.find((s) => s.slug === selected.slug)?.title || service
    : planIndex >= 0
      ? `${content.plans[planIndex].name} package`
      : service;
  return (
    <Link
      className={className}
      href={`/appointment${canonical ? `?service=${encodeURIComponent(canonical)}` : ""}`}
    >
      {children || t("Book an appointment")}
      <ArrowUpRight size={18} />
    </Link>
  );
}
export function SectionHead({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
const primaryNavigation = [
  ["/", "Home", "navHome", null], ["/services", "Services", "navServices", "pageServices"], ["/team", "Our Team", "navTeam", "pageTeam"],
  ["/about", "About Us", "navAbout", "pageAbout"], ["/gallery", "Gallery", "navGallery", "pageGallery"], ["/contact", "Contact", "navContact", "pageContact"],
] as const;
export function Header() {
  const t = useCopy();
  const { sections } = useSite().content;

  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  const links = primaryNavigation.filter(([, , key, page]) => sections[key] !== false && (!page || sections[page] !== false)).map(([href, label]) => [href, t(label)]);
  return (
    <>
      <a className="skip-link" href="#main">
        {t("Skip to content")}
      </a>
      <header className="header royal-header">
        <div className="header-inner">
          <Link
            href="/"
            className="brand"
            aria-label={t("Royal Veterinary Hospital home")}
          >
            <SiteImage
              src={"/rvh/assets/royal-logo-transparent.png"}
              mediaKey="logo"
              alt={t("Royal Veterinary Hospital")}
            />
          </Link>
          <nav className="desktop-nav" aria-label={t("Main navigation")}>
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={
                  location === href ||
                  (href === "/services" && location.startsWith("/service-"))
                    ? "active"
                    : ""
                }
                aria-current={location === href ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <LanguageSwitch />
          <div className="header-actions">
            <button
              ref={menuButton}
              className="menu-toggle icon-button"
              aria-label={open ? t("Close menu") : t("Open menu")}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        <nav
          inert={!open}
          hidden={!open}
          id="mobile-navigation"
          className="mobile-nav"
          aria-label={t("Mobile navigation")}
        >
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={location === href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
              <ArrowUpRight size={18} />
            </Link>
          ))}
          {sections.navPackages && sections.pagePackages && <Link href="/packages">{t("Packages")}</Link>}
          <BookLink />
        </nav>
      </header>
    </>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
  imageKey,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  imageKey?: string;
}) {
  const t = useCopy();

  return (
    <div className="royal-page-hero">
      <div className="royal-page-hero-inner">
        <div className="royal-page-copy">
          <h1 className="royal-page-hero-title">{title}</h1>
          {description && <p className="royal-page-hero-desc">{description}</p>}
        </div>
        <div className="royal-page-art" aria-hidden="true">
          <img className="royal-page-rings" src="/rvh/assets/figma-hero-circles.svg" alt="" />
          <SiteImage className="royal-page-pets" mediaKey={imageKey} src="/rvh/assets/figma-hero-companions.png" alt="" />
        </div>
      </div>
      <RoyalWave className="royal-wave hero-wave" />
    </div>
  );
}
export function Footer() {
  const t = useCopy();
  const { sections } = useSite().content;
  const { PHONE, settings } = useHospital();

  return (
    <>
      <RoyalWave className="royal-wave footer-wave" />
      <footer className="royal-soft-footer">
      <div className="royal-soft-footer-inner">
        {/* Brand & Mission */}
        <div className="footer-soft-brand">
          <Link href="/" className="footer-soft-logo">
            <SiteImage mediaKey="logo" src="/rvh/assets/royal-logo-transparent.png" alt={t("Royal Veterinary Hospital")} />
          </Link>
          <p className="footer-soft-tagline">
            {t("Quality always first. Dedicated to the health, comfort, and wellbeing of your pets with modern veterinary care.")}
          </p>
          <div className="footer-soft-address">
            <MapPin size={15} />
            <span>{settings.address}, {settings.city}</span>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="footer-soft-col">
          <span className="footer-soft-heading">{t("Hospital")}</span>
          <nav className="footer-soft-links">
            {sections.navHome && <Link href="/">{t("Home")}</Link>}
            {sections.navAbout && sections.pageAbout && <Link href="/about">{t("About Us")}</Link>}
            {sections.navTeam && sections.pageTeam && <Link href="/team">{t("Our Team")}</Link>}
            {sections.navFacilities && sections.pageFacilities && <Link href="/facilities">{t("Our facilities")}</Link>}
            {sections.navGallery && sections.pageGallery && <Link href="/gallery">{t("Gallery")}</Link>}
            {sections.navPackages && sections.pagePackages && <Link href="/packages">{t("Packages")}</Link>}
            {sections.navContact && sections.pageContact && <Link href="/contact">{t("Contact")}</Link>}
          </nav>
        </div>

        {/* Services */}
        {sections.navServices && sections.pageServices && <div className="footer-soft-col">
          <span className="footer-soft-heading">{t("Our Services")}</span>
          <nav className="footer-soft-links">
            <Link href="/service-general-care">{t("Consultation")}</Link>
            <Link href="/service-vaccination">{t("Vaccination")}</Link>
            <Link href="/service-surgery">{t("Surgery")}</Link>
            <Link href="/service-dental-care">{t("Dental Care")}</Link>
            <Link href="/service-grooming">{t("Grooming")}</Link>
            {sections.pageServices && <Link href="/services">{t("All services")}</Link>}
          </nav>
        </div>}

        {/* Contact & Figma Pills */}
        <div className="footer-soft-col footer-soft-actions-col">
          <span className="footer-soft-heading">{t("Care & Inquiries")}</span>
          <p className="footer-soft-hours">
            {t("Open 24/7 for pet emergencies & daily veterinary appointments.")}
          </p>
          <div className="footer-soft-pills">
            <a href={`tel:${PHONE}`} className="royal-action solid royal-phone-pill">
              <span className="action-circle-icon">
                <Phone size={15} fill="currentColor" />
              </span>
              <bdi>{settings.phoneDisplay}</bdi>
            </a>
            <Link href="/appointment" className="royal-action royal-appoint-pill">
              <img src="/rvh/assets/appointment-calendar.svg" width="22" height="22" alt="" aria-hidden="true" />
              <span>{t("Appointment")}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="royal-soft-footer-bottom">
        <div className="royal-soft-footer-bottom-inner">
          <span>© {new Date().getFullYear()} {t("Royal Veterinary Hospital. All rights reserved.")}</span>
          <div className="footer-soft-bottom-links">
            <Link href="/privacy">{t("Privacy")}</Link>
            <Link href="/admin">{t("Staff access")}</Link>
            <a href="#top">{t("Back to top ↑")}</a>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
export function NotFound() {
  const t = useCopy();

  return (
    <section className="section not-found">
      <span className="eyebrow">404</span>
      <h1>{t("A little off the trail.")}</h1>
      <p>
        {t(
          "This page couldn’t be found. Let’s get you back to familiar ground.",
        )}
      </p>
      <Link className="button" href="/">
        {t("Back to Royal")}
        <ArrowRight size={18} />
      </Link>
    </section>
  );
}
