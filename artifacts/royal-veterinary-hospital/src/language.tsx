import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "en" | "ckb";
const LanguageContext = createContext({
  language: "en" as Language,
  setLanguage: (_: Language) => {},
});
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, update] = useState<Language>(() => {
    try {
      return localStorage.getItem("royal-language") === "ckb" ? "ckb" : "en";
    } catch {
      return "en";
    }
  });
  const setLanguage = (next: Language) => {
    update(next);
    try {
      localStorage.setItem("royal-language", next);
    } catch {
      /* Private browsing still supports switching. */
    }
  };
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
export const useLanguage = () => useContext(LanguageContext);

export function translate(
  original: string,
  language: Language,
  copy: Record<string, string>,
) {
  const english = copy[original] ?? original;
  return language === "ckb"
    ? copy[`ckb::${original}`] || copy[`ckb::${english}`] || english
    : english;
}

// Routing keys and media paths stay stable across languages.
const fixedKeys = new Set([
  "slug",
  "id",
  "category",
  "icon",
  "related",
  "src",
  "image",
  "phone",
  "phoneDisplay",
  "price",
]);
export function localize<T>(value: T, copy: Record<string, string>): T {
  if (typeof value === "string") return (copy[`ckb::${value}`] || value) as T;
  if (Array.isArray(value))
    return value.map((item) => localize(item, copy)) as T;
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        fixedKeys.has(key) ? item : localize(item, copy),
      ]),
    ) as T;
  return value;
}

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  return (
    <div
      className="language-switch"
      role="group"
      aria-label="Language / زمان"
      dir="ltr"
    >
      <button
        type="button"
        lang="ckb"
        aria-label="کوردی"
        aria-pressed={language === "ckb"}
        onClick={() => setLanguage("ckb")}
      >
        کوردی
      </button>
      <span aria-hidden="true" />
      <button
        type="button"
        lang="en"
        aria-label="English"
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
    </div>
  );
}
