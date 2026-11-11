import { useCopy } from "./website-content";
import { useEffect, useLayoutEffect, useRef, lazy, Suspense } from "react";
import { Route, Switch, Router, useLocation } from "wouter";
import { Header, Footer, PageIntro, NotFound } from "./site-ui";
import {
  About,
  CareJourney,
  Packages,
  Team,
  FAQ,
  Visit,
} from "./sections";
import { Facilities } from "./site-pages";
import { Appointment, Privacy } from "./booking-page";
const Admin = lazy(() =>
  import("./admin").then((module) => ({ default: module.Admin })),
);
import { useHospital } from "./site-state";
import { HomePage } from "./home-page";
import { ServiceDetail, ServiceDirectory } from "./service-experience";
import { useLanguage } from "./language";
import { RoyalWave } from "./RoyalWave";
import { OrderedPage, OrderedSection } from "./OrderedSection";

function DocumentLanguage() {
  const { language } = useLanguage();
  const [location] = useLocation();
  useLayoutEffect(() => {
    const active = location === "/admin" ? "en" : language;
    document.documentElement.lang = active;
    document.documentElement.dir = active === "ckb" ? "rtl" : "ltr";
  }, [language, location]);
  return null;
}

function Content() {
  const t = useCopy();

  const { services, settings, sections } = useHospital();
  const [location] = useLocation();
  const main = useRef<HTMLElement>(null);
  const previousLocation = useRef(location);
  const historyNavigation = useRef(false);

  useEffect(() => {
    const onPopState = () => { historyNavigation.current = true; };
    const onPushState = () => { historyNavigation.current = false; };
    window.addEventListener("popstate", onPopState, true);
    window.addEventListener("pushState", onPushState, true);
    return () => {
      window.removeEventListener("popstate", onPopState, true);
      window.removeEventListener("pushState", onPushState, true);
    };
  }, []);

  useLayoutEffect(() => {
    if (previousLocation.current === location) return;
    previousLocation.current = location;
    if (!historyNavigation.current && !window.location.hash) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    historyNavigation.current = false;
    main.current?.focus({ preventScroll: true });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const entry = main.current?.animate(
      [{ opacity: 0.72 }, { opacity: 1 }],
      { duration: 200, easing: "ease-out" },
    );
    return () => entry?.cancel();
  }, [location]);
  useEffect(() => {
    const currentService = services.find(
      (service) => location === `/service-${service.slug}`,
    );
    const label =
      currentService?.title ||
      (location === "/"
        ? `${settings.heroLine1} ${settings.heroLine2}`
        : location
            .slice(1)
            .replaceAll("-", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()));
    document.title = `${t(label)} | Royal Veterinary Hospital`;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute(
      "content",
      currentService
        ? `${currentService.title} at Royal Veterinary Hospital, ${settings.city}. ${currentService.short} Explore treatment, visit preparation and common questions.`
        : `Expert veterinary care in ${settings.city}. Explore ${services.filter((s) => !s.hidden).length} services, from preventive health and specialist medicine to surgery, rehabilitation and everyday support.`,
    );
    const structuredData = document.querySelector("#hospital-structured-data");
    if (structuredData)
      structuredData.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "VeterinaryCare",
        name: "Royal Veterinary Hospital",
        telephone: settings.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: settings.address,
          addressLocality: settings.city,
          addressRegion: settings.region,
          addressCountry: "IQ",
        },
      });
  }, [location, services, settings]);
  return (
    <main id="main" ref={main} tabIndex={-1}>
      <Switch>
        <Route path="/">
          <HomePage />
        </Route>
        <Route path="/services">
          {sections.pageServices ? <ServiceDirectory /> : <NotFound />}
        </Route>
        {services.map((service) => (
          <Route key={service.slug} path={`/service-${service.slug}`}>
            <ServiceDetail slug={service.slug} />
          </Route>
        ))}
        <Route path="/packages">
          {sections.pagePackages ? <OrderedPage>
            {sections.plansIntro && <OrderedSection id="plansIntro"><PageIntro
              eyebrow={t("CARE PACKAGES")}
              title={
                <>
                  {t("More happy years.")}
                  <br />
                  <span>{t("Together.")}</span>
                </>
              }
              description={t(
                "Care plans built around life’s little beginnings, everyday adventures and golden years.",
              )}
            /></OrderedSection>}
            {sections.plansList && <OrderedSection id="plansList"><Packages full /></OrderedSection>}
            {sections.plansJourney && <OrderedSection id="plansJourney"><RoyalWave className="royal-wave section-wave" />
            <CareJourney /></OrderedSection>}
            {sections.plansFaq && <OrderedSection id="plansFaq"><RoyalWave className="royal-wave section-wave" />
            <div className="royal-body">
              <FAQ />
            </div></OrderedSection>}
          </OrderedPage> : <NotFound />}
        </Route>
        <Route path="/team">
          {sections.pageTeam ? <OrderedPage>
            {sections.teamIntro && <OrderedSection id="teamIntro"><PageIntro
              eyebrow={t("THE ROYAL TEAM")}
              title={
                <>
                  {t("Their wellbeing.")}
                  <br />
                  <span>{t("Our shared purpose.")}</span>
                </>
              }
              description={t(
                "Get to know the people who care for your companion. A team of different specialties, brought together by a love of animals.",
              )}
            /></OrderedSection>}
            {sections.teamMembers && <OrderedSection id="teamMembers"><Team full /></OrderedSection>}
            {sections.teamVisit && <OrderedSection id="teamVisit"><RoyalWave className="royal-wave section-wave" />
            <Visit /></OrderedSection>}
          </OrderedPage> : <NotFound />}
        </Route>
        <Route path="/about">
          {sections.pageAbout ? <OrderedPage>
            {sections.aboutIntro && <OrderedSection id="aboutIntro"><PageIntro
              eyebrow={t("OUR STORY")}
              title={
                <>
                  {t("Rooted in care.")}
                  <br />
                  <span>{t("Right here at home.")}</span>
                </>
              }
              description={t("Royal Veterinary Hospital. A familiar place for pets and the people who love them in {city}.").replace("{city}", settings.city)}
            /></OrderedSection>}
            {sections.aboutStory && <OrderedSection id="aboutStory"><About full /></OrderedSection>}
            {sections.aboutTeam && <OrderedSection id="aboutTeam"><RoyalWave className="royal-wave section-wave flip-wave" />
            <Team /></OrderedSection>}
            {sections.aboutVisit && <OrderedSection id="aboutVisit"><RoyalWave className="royal-wave section-wave" />
            <Visit /></OrderedSection>}
          </OrderedPage> : <NotFound />}
        </Route>
        <Route path="/facilities">
          {sections.pageFacilities ? <Facilities /> : <NotFound />}
        </Route>
        <Route path="/contact">
          {sections.pageContact ? <OrderedPage>
            {sections.contactIntro && <OrderedSection id="contactIntro"><PageIntro
              eyebrow={t("COME SAY HELLO")}
              title={
                <>
                  {t("A friendly face.")}
                  <br />
                  <span>{t("A familiar place.")}</span>
                </>
              }
              description={t(
                "Call, message, or come in. Our team is here for you and your companion.",
              )}
            /></OrderedSection>}
            {sections.contactVisit && <OrderedSection id="contactVisit"><Visit full /></OrderedSection>}
            {sections.contactFaq && <OrderedSection id="contactFaq"><RoyalWave className="royal-wave section-wave" />
            <div className="royal-body">
              <FAQ />
            </div></OrderedSection>}
          </OrderedPage> : <NotFound />}
        </Route>
        <Route path="/appointment">
          <Appointment />
        </Route>
        <Route path="/privacy">
          <Privacy />
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </main>
  );
}
export default function App() {
  return (
    <Router base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <DocumentLanguage />
      <Switch>
        <Route path="/admin">
          <Suspense
            fallback={<div className="admin-loading">Loading workspace…</div>}
          >
            <Admin />
          </Suspense>
        </Route>
        <Route>
          <div id="top">
            <Header />
            <Content />
            <Footer />
          </div>
        </Route>
      </Switch>
    </Router>
  );
}
