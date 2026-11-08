import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStaff } from "./staff-language";

export const TranslationDraft = createContext<{
  copy: Record<string, string>;
  edit: (key: string, value: string) => void;
} | null>(null);

export function BilingualField({
  label,
  value,
  source,
  onChange,
  long = false,
  shared = false,
  required = false,
  maxLength = 5000,
}: {
  label: string;
  value: string;
  source?: string;
  onChange?: (value: string) => void;
  long?: boolean;
  shared?: boolean;
  required?: boolean;
  maxLength?: number;
}) {
  const draft = useContext(TranslationDraft);
  const { t } = useStaff();
  const englishSource = (source ?? value).trim();
  const key = "ckb::" + englishSource;
  const startingPair = useRef({ key, translation: "" });
  function finishEnglishEdit() {
    const prior = startingPair.current;
    if (
      !shared &&
      !source &&
      englishSource &&
      prior.key !== key &&
      prior.translation &&
      draft &&
      !(key in draft.copy)
    ) {
      draft.edit(key, prior.translation);
    }
  }
  const Input = long ? "textarea" : "input";
  const english = (caption: ReactNode) => (
    <label>
      {caption}
      <Input
        lang="en"
        dir="ltr"
        value={value}
        readOnly={!onChange}
        required={required}
        maxLength={maxLength}
        onFocus={() => {
          startingPair.current = { key, translation: draft?.copy[key] ?? "" };
        }}
        onBlur={finishEnglishEdit}
        onKeyDown={(event) => {
          if (!long && event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  );
  if (!draft || shared) return english(t(label));
  return (
    <fieldset className="bilingual-field">
      <legend>{t(label)}</legend>
      <div>
        {english(t(onChange ? "English" : "English reference"))}
        <label>
          {t("Kurdish (Sorani)")}
          <Input
            lang="ckb"
            dir="rtl"
            disabled={!englishSource}
            value={draft.copy[key] ?? ""}
            placeholder={t("Enter a Kurdish translation")}
            maxLength={5000}
            onChange={(e) => draft.edit(key, e.target.value)}
          />
        </label>
      </div>
    </fieldset>
  );
}

export function BilingualList({
  label,
  values,
  onChange,
  limit,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  limit: number;
}) {
  const { t } = useStaff();
  return (
    <div className="bilingual-list">
      {values.map((value, i) => (
        <div key={i}>
          <BilingualField
            label={t(label) + " " + (i + 1)}
            value={value}
            onChange={(v) =>
              onChange(values.map((item, j) => (i === j ? v : item)))
            }
          />
          <button
            type="button"
            className="text-link"
            disabled={values.length === 1}
            onClick={() => onChange(values.filter((_, j) => i !== j))}
          >
            {t("Remove")}
          </button>
        </div>
      ))}
      <button
        type="button"
        className="outline-button"
        disabled={values.length >= limit}
        onClick={() => onChange([...values, ""])}
      >
        {t("Add")} +
      </button>
    </div>
  );
}
