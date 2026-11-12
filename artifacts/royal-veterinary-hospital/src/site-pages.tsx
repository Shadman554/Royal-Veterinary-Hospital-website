import { useCopy } from "./website-content";
import { Link } from "wouter";
import {
  Stethoscope,
  Microscope,
  HeartPulse,
} from "lucide-react";
import { PageIntro } from "./site-ui";
import { About, Visit } from "./sections";
import { RoyalWave } from "./RoyalWave";
import { useSite } from "./site-state";
import { OrderedPage, OrderedSection } from "./OrderedSection";
import { GalleryPhotos } from "./gallery";

export function Facilities() {
  const t = useCopy();
  const { sections } = useSite().content;

  const facilities = [
    {
      Icon: Stethoscope,
      title: "Consultation & examination",
      desc: "Space to talk, listen and examine your pet with care.",
    },
    {
      Icon: Microscope,
      title: "Laboratory & imaging",
      desc: "Diagnostic support that helps the team plan the next step.",
    },
    {
      Icon: HeartPulse,
      title: "Surgery & recovery",
      desc: "Dedicated attention through treatment and recovery.",
    },
  ];
  return (
    <OrderedPage>
      {sections.facilitiesIntro && <OrderedSection id="facilitiesIntro"><PageIntro
        eyebrow={t("OUR FACILITIES")}
        title={t("A space for better care.")}
        description={t(
          "A welcoming environment, thoughtful spaces and the tools to understand your companion’s needs.",
        )}
      /></OrderedSection>}
      {sections.facilitiesAbout && <OrderedSection id="facilitiesAbout"><About full /></OrderedSection>}
      {sections.facilitiesList && <OrderedSection id="facilitiesList"><RoyalWave className="royal-wave section-wave" />
      <div className="royal-body" style={{ padding: 'clamp(40px, 5vw, 70px) 0' }}>
        <div className="royal-heading" style={{ marginBottom: 'clamp(24px, 3vw, 40px)' }}>
          <span>{t("Modern Infrastructure")}</span>
          <h2>{t("Equipped For Complete Care")}</h2>
        </div>
        <div className="royal-cards" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          {facilities.map(({ Icon, title, desc }) => (
            <div key={title} className="royal-card">
              <div className="royal-card-visual">
                <Icon className="royal-card-pill-icon" />
              </div>
              <h3>{t(title)}</h3>
              <p>{t(desc)}</p>
            </div>
          ))}
        </div>
      </div></OrderedSection>}
      {sections.facilitiesVisit && <OrderedSection id="facilitiesVisit"><RoyalWave className="royal-wave section-wave" />
      <Visit /></OrderedSection>}
      {sections.facilitiesPhotos && <OrderedSection id="facilitiesPhotos"><GalleryPhotos category="facilities" /></OrderedSection>}
    </OrderedPage>
  );
}
