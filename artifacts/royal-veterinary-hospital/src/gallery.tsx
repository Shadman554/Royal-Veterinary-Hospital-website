import { useHospital } from "./site-state";
import { SiteImage, useCopy } from "./website-content";
import { PageIntro } from "./site-ui";
import { OrderedPage, OrderedSection } from "./OrderedSection";
import "./gallery.css";

export function GalleryPhotos({ category }: { category: "memories" | "facilities" }) {
  const t = useCopy();
  const { gallery } = useHospital();
  const photos = gallery.filter((item) => item.category === category);
  if (!photos.length) return category === "memories" ? <p className="royal-gallery-empty">{t("No photos have been added yet.")}</p> : null;
  return (
    <section className="royal-gallery royal-body">
      <div className="royal-heading">
        <h2>{t(category === "memories" ? "Hospital memories" : "Our rooms and equipment")}</h2>
      </div>
      <div className="royal-gallery-grid">
        {photos.map((photo) => (
          <figure key={photo.id} className="royal-gallery-item">
            <SiteImage src={photo.image} alt={photo.title} loading="lazy" decoding="async" />
            <figcaption><h3>{photo.title}</h3>{photo.description && <p>{photo.description}</p>}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Gallery() {
  const t = useCopy();
  const { sections } = useHospital();
  return (
    <OrderedPage>
      {sections.galleryIntro && <OrderedSection id="galleryIntro"><PageIntro eyebrow={t("GALLERY")} title={t("Hospital memories")} description={t("Moments and memories from Royal Veterinary Hospital.")} /></OrderedSection>}
      {sections.galleryPhotos && <OrderedSection id="galleryPhotos"><GalleryPhotos category="memories" /></OrderedSection>}
    </OrderedPage>
  );
}
