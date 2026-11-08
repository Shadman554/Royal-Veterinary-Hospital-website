import { createContext, useContext, useState, type ReactNode } from "react";
import { Languages } from "lucide-react";
import staffStrings from "./locales/ckb-staff.json";
import { useSite } from "./site-state";
import { useLanguage, type Language } from "./language";

const dictionary: Record<string, string> = staffStrings;
const templates = Object.entries(dictionary)
  .filter(([key]) => key.includes("{"))
  .map(([key, translated]) => {
    const names: string[] = [];
    const pattern = key
      .split(/(\{\w+\})/)
      .map((part) => {
        if (part.startsWith("{")) {
          names.push(part.slice(1, -1));
          return "(.+?)";
        }
        return Array.from(part, (char) =>
          "\\^$.*+?()[]{}|".includes(char) ? "\\" + char : char,
        ).join("");
      })
      .join("");
    return { regex: new RegExp("^" + pattern + "$"), names, translated };
  });
const StaffContext = createContext({
  language: "en" as Language,
  setLanguage: (_: Language) => {},
  t: (text: string) => text,
});
export const useStaff = () => useContext(StaffContext);

export function StaffProvider({ children }: { children: ReactNode }) {
  const { language: visitorLanguage } = useLanguage();
  const { content } = useSite();
  const [language, set] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("royal-staff-language");
      if (saved === "en" || saved === "ckb") return saved;
    } catch {
      /* Storage may be disabled. */
    }
    return visitorLanguage;
  });
  const setLanguage = (next: Language) => {
    set(next);
    try {
      localStorage.setItem("royal-staff-language", next);
    } catch {
      /* Session only. */
    }
  };
  function t(text: string) {
    if (language === "en") return text;
    const key = text.trim().replace(/\s+/g, " ");
    const literal = dictionary[key] || content.copy["ckb::" + key];
    if (literal) return literal;
    for (const { regex, names, translated } of templates) {
      const match = key.match(regex);
      if (match)
        return translated.replace(/\{(\w+)\}/g, (_, name: string) => {
          const value = match[names.indexOf(name) + 1];
          return dictionary[value] || content.copy["ckb::" + value] || value;
        });
    }
    return text;
  }
  return (
    <StaffContext.Provider value={{ language, setLanguage, t }}>
      <div
        className="staff-workspace"
        lang={language}
        dir={language === "ckb" ? "rtl" : "ltr"}
      >
        {children}
      </div>
    </StaffContext.Provider>
  );
}

export function StaffSwitch() {
  const { language, setLanguage, t } = useStaff();
  return (
    <div
      className="staff-switch"
      role="group"
      aria-label={t("Staff language")}
      dir="ltr"
    >
      <Languages size={16} aria-hidden="true" />
      <button
        type="button"
        lang="en"
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
      >
        English
      </button>
      <button
        type="button"
        lang="ckb"
        aria-pressed={language === "ckb"}
        onClick={() => setLanguage("ckb")}
      >
        کوردی
      </button>
    </div>
  );
}
