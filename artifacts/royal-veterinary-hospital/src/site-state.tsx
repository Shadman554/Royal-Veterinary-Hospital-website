import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { services, categories, categorySteps } from "./services-data";
import copyDefaults from "./copy-defaults.json";
import mediaDefaults from "./media-defaults.json";
import { plans, team, faqs } from "./content";
import { defaultSettings } from "./site-defaults";
import { defaultFeaturedServices, defaultSectionOrder, defaultSections } from "./page-sections";
import { localize, useLanguage } from "./language";
export const initialContent = {
  services,
  plans: plans as (typeof plans[number] & { hidden?: boolean })[],
  team,
  faqs,
  settings: defaultSettings,
  sections: defaultSections,
  sectionOrder: defaultSectionOrder,
  homepageServices: defaultFeaturedServices,
  gallery: [] as { id: string; category: "memories" | "facilities"; image: string; title: string; description: string }[],
  copy: copyDefaults as Record<string, string>,
  media: mediaDefaults as Record<
    string,
    { label: string; src: string; alt: string }
  >,
  categories: categories.map((c) => ({
    id: c.id,
    title: String(c.title),
    short: String(c.short),
    icon: String(c.icon),
  })),
  categorySteps,
  version: 0,
};
export type SiteContent = typeof initialContent;
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json().catch(() => {
    throw new Error(
      "The hospital server is unavailable. Please call or use WhatsApp.",
    );
  });
  if (!response.ok)
    throw Object.assign(
      new Error(data.error || "Unable to complete the request."),
      { status: response.status },
    );
  return data;
}
const SiteContext = createContext({
  content: initialContent,
  online: false,
  refresh: async () => {},
  update: (_content: SiteContent) => {},
});
const previousHeroCopy = {
  heroLine1: "Veterinary Care You Can Trust",
  heroLine2: "From an Experienced Team",
  heroDescription: "At Royal Veterinary Hospital, our experienced veterinary team provides examinations, treatment and medical care using modern equipment.",
};
const previousImages = {
  heroDesktop: "royal-hero.png", heroMobile: "royal-pets.png",
  about: "royal-hospital.png", visit: "royal-hospital.png", directory: "royal-pets.png",
  ...Object.fromEntries(Array.from({length: 6}, (_, i) => [`featured-${i}`, "royal-services.png"])),
};
function normalizeContent(data: SiteContent): SiteContent {
  const settings = { ...defaultSettings, ...data.settings };
  const media = { ...initialContent.media, ...data.media };
  for (const [key, oldValue] of Object.entries(previousHeroCopy)) {
    const field = key as keyof typeof previousHeroCopy;
    if (settings[field] === oldValue) settings[field] = defaultSettings[field];
  }
  for (const [key, filename] of Object.entries(previousImages)) {
    if (media[key]?.src === `/rvh/assets/${filename}`) media[key] = initialContent.media[key];
  }
  // Previous reference crops are defaults from an earlier homepage design.
  if (media.heroDesktop?.src === "/rvh/assets/reference-welcome.jpg") media.heroDesktop = initialContent.media.heroDesktop;
  if (media.heroMobile?.src === "/rvh/assets/reference-companions.jpg") media.heroMobile = initialContent.media.heroMobile;
  return { ...data, settings, sections: { ...defaultSections, ...data.sections }, sectionOrder: { ...defaultSectionOrder, ...data.sectionOrder }, homepageServices: data.homepageServices ?? defaultFeaturedServices, gallery: data.gallery ?? [], media, copy: { ...initialContent.copy, ...data.copy } };
}
export function SiteProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState(initialContent);
  const [online, setOnline] = useState(false);
  const [preview, setPreview] = useState(false);
  const update = (data: SiteContent) => setContent(normalizeContent(data));
  const refresh = async () => {
    try {
      const data = await api<SiteContent>("/content");
      update(data);
      setOnline(true);
    } catch {
      setOnline(false);
    }
  };
  useEffect(() => {
    const showPreview = new URLSearchParams(window.location.search).get("preview") === "1";
    if (showPreview) {
      void (async () => {
        try {
          const session = await api<{ role: string }>("/admin/session");
          const saved = sessionStorage.getItem("royal-preview-draft");
          if (session.role !== "admin" || !saved) throw new Error("Preview unavailable");
          update(JSON.parse(saved) as SiteContent);
          setPreview(true);
          setOnline(true);
          window.opener = null;
        } catch { await refresh(); }
      })();
    } else void refresh();
    const reload = () => {
      if (showPreview) return;
      // Admin drafts must survive switching windows; staff refresh explicitly.
      if (window.location.pathname.replace(/\/$/, "") === "/admin") return;
      void refresh();
    };
    window.addEventListener("focus", reload);
    return () => window.removeEventListener("focus", reload);
  }, []);
  return (
    <SiteContext.Provider value={{ content, online, refresh, update }}>
      {preview && <div role="status" style={{ background: "#173d2c", color: "white", textAlign: "center", padding: "0.65rem", fontSize: "0.9rem" }}>Preview · پێشبینین — Unpublished changes · گۆڕانکاریی پاشەکەوت نەکراو</div>}
      {children}
    </SiteContext.Provider>
  );
}
export function useSite() {
  return useContext(SiteContext);
}
export function useHospital() {
  const { content } = useSite();
  const { language } = useLanguage();
  const localized = useMemo(
    () =>
      language === "ckb"
        ? {
            ...content,
            settings: localize(content.settings, content.copy),
            services: localize(content.services, content.copy),
            plans: localize(content.plans, content.copy),
            team: localize(content.team, content.copy),
            faqs: localize(content.faqs, content.copy),
            gallery: localize(content.gallery, content.copy),
            categories: localize(content.categories, content.copy),
            categorySteps: localize(content.categorySteps, content.copy),
          }
        : content,
    [content, language],
  );
  return {
    ...localized,
    PHONE: content.settings.phone,
    MAP: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Royal Veterinary Hospital ${content.settings.address} ${content.settings.city}`)}`,
  };
}
