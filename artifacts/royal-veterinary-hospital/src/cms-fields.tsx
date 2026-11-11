import { BilingualField, BilingualList } from "./bilingual-fields";
import { useStaff } from "./staff-language";
import { useState } from "react";
import { Upload, ImageIcon, RotateCcw, Plus, X } from "lucide-react";
import { useSite } from "./site-state";
import { assetUrl } from "./website-content";
import mediaDefaults from "./media-defaults.json";
import copyGroups from "./copy-groups.json";
import copyDefaults from "./copy-defaults.json";
import type { Service } from "./services-data";
import { servicePhotoStyle } from "./media-display";

async function isAnimatedPng(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer);
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const size = view.getUint32(offset);
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    if (type === "acTL") return true;
    if (type === "IDAT" || type === "IEND" || size > bytes.length - offset - 12) break;
    offset += size + 12;
  }
  return false;
}

function ImagePreview({
  src,
  label,
  placement,
  portrait,
}: {
  src: string;
  label: string;
  placement?: string;
  portrait?: boolean;
}) {
  const { t } = useStaff();
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const url = retry
    ? `${src}${src.includes("?") ? "&" : "?"}preview=${retry}`
    : src;
  const featured = placement?.match(/^featured-([0-5])$/);
  const recover = () => {
    if (!retry && src.startsWith("/api/media/")) setRetry(Date.now());
    else setFailed(true);
  };
  return (
    <div
      className={`cms-image-preview${featured ? " cms-featured-preview" : ""}${portrait ? " cms-portrait-preview" : ""}`}
    >
      {failed ? (
        <div className="cms-image-unavailable" role="status">
          <ImageIcon size={22} aria-hidden="true" />
          <span>{t("Preview unavailable")}</span>
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              setRetry((n) => n + 1);
            }}
          >
            <RotateCcw size={13} />
            {t("Retry")}
          </button>
        </div>
      ) : featured ? (
        <div
          className="cms-cropped-photo"
          role="img"
          aria-label={t(`${label} preview`)}
          style={servicePhotoStyle(Number(featured[1]), url)}
        >
          <img src={url} alt="" aria-hidden="true" onError={recover} />
        </div>
      ) : (
        <img
          src={url}
          alt={t(`${label} preview`)}
          onError={recover}
          data-photo={!src.split("?")[0].endsWith(".svg") || undefined}
        />
      )}
    </div>
  );
}

export function ImageField({
  label,
  value,
  onChange,
  original,
  placement,
  portrait,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  original?: string;
  placement?: string;
  portrait?: boolean;
}) {
  const { t } = useStaff();
  const { content } = useSite();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const sources = [
    ...new Set([
      ...Object.values(mediaDefaults).map((m) => m.src),
      ...Object.values(content.media).map((m) => m.src),
      ...content.team.map((t) => assetUrl(t[3])),
      ...content.services.map((s) => assetUrl(s.icon)),
      ...content.categories.map((c) => assetUrl(c.icon)),
      assetUrl(value),
    ]),
  ];
  async function upload(file?: File) {
    if (!file) return;
    setError("");
    if (file.size > 8 * 1024 * 1024) {
      setError("Choose an image smaller than 8 MB.");
      return;
    }
    if (
      !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
        file.type,
      )
    ) {
      setError("Choose a PNG, JPEG, WebP or GIF image.");
      return;
    }
    setBusy(true);
    try {
      const bitmap = await createImageBitmap(file);
      if (bitmap.width > 12000 || bitmap.height > 12000) {
        bitmap.close();
        throw new Error(
          "Choose an image no larger than 12,000 pixels on either side.",
        );
      }
      let uploadBody: Blob = file;
      try {
        if (file.type === "image/jpeg" || (file.type === "image/png" && !(await isAnimatedPng(file)))) {
          const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(bitmap.width * scale));
          canvas.height = Math.max(1, Math.round(bitmap.height * scale));
          const context = canvas.getContext("2d");
          if (context) {
            context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            const optimized = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
            if (optimized?.type === "image/webp" && optimized.size < file.size) uploadBody = optimized;
          }
        }
      } catch {
        uploadBody = file;
      } finally {
        bitmap.close();
      }
      const response = await fetch("/api/admin/media", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": uploadBody.type },
        body: uploadBody,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed.");
      onChange(data.src);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="cms-image-field" data-uploading={busy || undefined}>
      <span className="cms-field-label">{t(label)}</span>
      <div className="cms-image-controls">
        <ImagePreview
          key={value}
          src={assetUrl(value)}
          label={label}
          placement={placement}
          portrait={portrait}
        />
        <div>
          <label className="outline-button cms-upload">
            <Upload size={16} />
            {busy ? t("Uploading…") : t("Upload image")}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              disabled={busy}
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          <label className="cms-library-label">
            {t("Or choose from your library")}
            <select
              value={assetUrl(value)}
              onChange={(e) => onChange(e.target.value)}
              disabled={busy}
            >
              {sources.map((src) => (
                <option key={src} value={src}>
                  {src.startsWith("/api/media/")
                    ? "Uploaded · " + src.split("/").pop()?.slice(0, 8)
                    : src.split("/").pop()?.replaceAll("-", " ")}
                </option>
              ))}
            </select>
          </label>
          {original && assetUrl(value) !== assetUrl(original) && (
            <button
              className="text-link"
              type="button"
              onClick={() => onChange(original)}
            >
              <RotateCcw size={13} />
              {t("Restore original")}
            </button>
          )}
          <small>
            {t(
              "PNG, JPEG, WebP or GIF · up to 8 MB. Save changes to publish your selection.",
            )}
          </small>
        </div>
      </div>
      {error && (
        <p className="admin-error" role="alert">
          {t(error)}
        </p>
      )}
    </div>
  );
}
export function TextField({
  label,
  value,
  onChange,
  long = false,
  direction,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  long?: boolean;
  direction?: "ltr" | "rtl";
}) {
  return (
    <BilingualField
      label={label}
      value={value}
      long={long}
      onChange={onChange}
    />
  );
}
export function CopyEditor({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  const { t } = useStaff();
  const [group, setGroup] = useState("Homepage");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [customSource, setCustomSource] = useState("");
  const [customTranslation, setCustomTranslation] = useState("");
  const groups: Record<string, string[]> = {};
  for (const [name, keys] of Object.entries(copyGroups)) {
    const section = name.replace(/^Kurdish · /, "");
    if (!keys.length) continue;
    groups[section] = [
      ...new Set([
        ...(groups[section] || []),
        ...keys.map((k) => k.replace(/^ckb::/, "")),
      ]),
    ];
  }
  groups["Custom text"] = Object.keys(value)
    .filter((k) => k.startsWith("ckb::") && !(k in copyDefaults))
    .map((k) => k.slice(5));
  const term = search.trim().toLowerCase();
  const rows = term
    ? [...new Set(Object.values(groups).flat())].filter((key) =>
        [key, value[key], value["ckb::" + key]].some((v) =>
          v?.toLowerCase().includes(term),
        ),
      )
    : groups[group];
  const pages = Math.max(1, Math.ceil(rows.length / 8));
  const current = Math.min(page, pages - 1);
  return (
    <div className="admin-editor-fields">
      <div className="cms-copy-filters">
        <label>
          {t("Page or section")}
          <select
            value={group}
            onChange={(e) => {
              setGroup(e.target.value);
              setPage(0);
              setSearch("");
            }}
          >
            {Object.keys(groups).map((g) => (
              <option key={g} value={g}>
                {t(g.replace(/([a-z])([A-Z])/g, "$1 $2"))}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Search both languages")}
          <input
            type="search"
            value={search}
            dir="auto"
            placeholder={t("Find text in either language")}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </label>
      </div>
      <p className="admin-hint">
        {t("The same wording shares one translation across the website.")}
      </p>
      {group === "Custom text" && !term && (
        <div className="cms-nested-item">
          <label>
            {t("Original English")}
            <input
              dir="ltr"
              value={customSource}
              maxLength={5000}
              onChange={(e) => setCustomSource(e.target.value)}
            />
          </label>
          <label>
            {t("Kurdish translation")}
            <textarea
              dir="rtl"
              lang="ckb"
              value={customTranslation}
              maxLength={5000}
              onChange={(e) => setCustomTranslation(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="outline-button"
            disabled={!customSource.trim() || !customTranslation.trim()}
            onClick={() => {
              onChange("ckb::" + customSource.trim(), customTranslation.trim());
              setCustomSource("");
              setCustomTranslation("");
            }}
          >
            {t("Add a translation")}
          </button>
        </div>
      )}
      {rows.slice(current * 8, current * 8 + 8).map((key) => (
        <div key={key}>
          <BilingualField
            label={key}
            source={key}
            value={value[key] ?? key}
            onChange={key in copyDefaults ? (v) => onChange(key, v) : undefined}
            long={
              Math.max(key.length, (value["ckb::" + key] || "").length) > 60
            }
          />
          {[key, "ckb::" + key]
            .filter(
              (k) =>
                k in copyDefaults &&
                value[k] !== (copyDefaults as Record<string, string>)[k],
            )
            .map((k) => (
              <button
                key={k}
                type="button"
                className="text-link"
                onClick={() =>
                  onChange(k, (copyDefaults as Record<string, string>)[k])
                }
              >
                {t("Restore original wording")} ·{" "}
                {t(k === key ? "English" : "Kurdish")}
              </button>
            ))}
        </div>
      ))}
      {!rows.length && <p>{t("No matching text.")}</p>}
      {pages > 1 && (
        <div className="staff-pager">
          <button
            type="button"
            className="outline-button"
            disabled={!current}
            onClick={() => setPage(current - 1)}
          >
            {t("Previous")}
          </button>
          <span>
            {current + 1} / {pages}
          </span>
          <button
            type="button"
            className="outline-button"
            disabled={current === pages - 1}
            onClick={() => setPage(current + 1)}
          >
            {t("Next")}
          </button>
        </div>
      )}
    </div>
  );
}
export function MediaEditor({
  value,
  onChange,
}: {
  value: Record<string, { label: string; src: string; alt: string }>;
  onChange: (key: string, field: "src" | "alt", value: string) => void;
}) {
  const { t } = useStaff();
  const [kind, setKind] = useState("photos");
  const [search, setSearch] = useState("");
  const entries = Object.entries(value).filter(
    ([key, m]) =>
      (kind === "all" ||
        (kind === "icons" ? key.startsWith("/") : !key.startsWith("/"))) &&
      m.label.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="admin-editor-fields">
      <div className="cms-copy-filters">
        <label>
          {t("Show")}
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="photos">{t("Website photos & branding")}</option>
            <option value="icons">{t("Shared icons & illustrations")}</option>
            <option value="all">{t("All images")}</option>
          </select>
        </label>
        <label>
          {t("Find image")}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search images")}
          />
        </label>
      </div>
      <p className="admin-hint">
        {t(
          "Each photo placement can be changed separately. Staff portraits are in Our team. Shared icons update wherever that artwork is used. Uploaded photos keep their natural colours.",
        )}
      </p>
      <div className="cms-media-grid">
        {entries.map(([key, m]) => (
          <section className="cms-media-card" key={key}>
            <ImageField
              label={m.label}
              placement={key}
              value={m.src}
              original={
                (mediaDefaults as Record<string, { src: string }>)[key]?.src
              }
              onChange={(v) => onChange(key, "src", v)}
            />
            <TextField
              label="Image description (alt text)"
              value={m.alt}
              onChange={(v) => onChange(key, "alt", v)}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
export function ServiceFields({
  service,
  services,
  categories,
  onChange,
}: {
  service: Service;
  services: Service[];
  categories: { id: string; title: string }[];
  onChange: (s: Service) => void;
}) {
  const { t } = useStaff();
  const patch = (value: Partial<Service>) => onChange({ ...service, ...value });
  return (
    <div className="cms-service-details">
      <ImageField
        label="Service artwork"
        value={service.icon}
        onChange={(icon) => patch({ icon })}
      />
      <label>
        {t("Care category")}
        <select
          value={service.category}
          onChange={(e) =>
            patch({ category: e.target.value as Service["category"] })
          }
        >
          {categories.map((c) => (
            <option value={c.id} key={c.id}>
              {t(c.title)}
            </option>
          ))}
        </select>
      </label>
      <TextField
        label="Search keywords"
        value={service.keywords || ""}
        onChange={(keywords) => patch({ keywords })}
      />
      <h3>{t("What this service includes")}</h3>
      {service.topics.map((row, i) => (
        <section className="cms-nested-item" key={i}>
          <div className="admin-repeat-heading">
            <strong>
              {t("Topic")} {i + 1}
            </strong>
            <button
              type="button"
              disabled={service.topics.length <= 1}
              onClick={() =>
                patch({ topics: service.topics.filter((_, n) => n !== i) })
              }
            >
              {t("Remove")}
              <X size={14} />
            </button>
          </div>
          {["Title", "Description"].map((label, j) => (
            <TextField
              key={label}
              label={label}
              value={row[j]}
              long={j === 1}
              onChange={(v) =>
                patch({
                  topics: service.topics.map((r, n) =>
                    n === i
                      ? (r.map((x, k) => (k === j ? v : x)) as [
                          string,
                          string,
                          string,
                        ])
                      : r,
                  ),
                })
              }
            />
          ))}
          <ImageField
            label={`Topic ${i + 1} image`}
            value={row[2]}
            onChange={(v) =>
              patch({
                topics: service.topics.map((r, n) =>
                  n === i ? [r[0], r[1], v] : r,
                ),
              })
            }
          />
        </section>
      ))}
      <button
        className="outline-button"
        type="button"
        disabled={service.topics.length >= 12}
        onClick={() =>
          patch({ topics: [...service.topics, ["", "", service.icon]] })
        }
      >
        <Plus size={15} />
        {t("Add topic")}
      </button>
      <h3>{t("Reasons to visit")}</h3>
      <BilingualList
        label="Reason"
        values={service.signs}
        limit={15}
        onChange={(signs) => patch({ signs })}
      />
      <h3>{t("Service questions & answers")}</h3>
      {service.faqs.map((row, i) => (
        <section className="cms-nested-item" key={i}>
          <div className="admin-repeat-heading">
            <strong>
              {t("Question")} {i + 1}
            </strong>
            <button
              type="button"
              disabled={service.faqs.length <= 1}
              onClick={() =>
                patch({ faqs: service.faqs.filter((_, n) => n !== i) })
              }
            >
              {t("Remove")}
              <X size={14} />
            </button>
          </div>
          {["Question", "Answer"].map((label, j) => (
            <TextField
              key={label}
              label={label}
              value={row[j]}
              long={j === 1}
              onChange={(v) =>
                patch({
                  faqs: service.faqs.map((r, n) =>
                    n === i
                      ? (r.map((x, k) => (k === j ? v : x)) as [string, string])
                      : r,
                  ),
                })
              }
            />
          ))}
        </section>
      ))}
      <button
        className="outline-button"
        type="button"
        disabled={service.faqs.length >= 15}
        onClick={() => patch({ faqs: [...service.faqs, ["", ""]] })}
      >
        <Plus size={15} />
        {t("Add question")}
      </button>
      <h3>{t("Related services")}</h3>
      <div className="cms-related">
        {services
          .filter((s) => s.slug !== service.slug)
          .map((s) => (
            <label key={s.slug}>
              <input
                type="checkbox"
                checked={service.related.includes(s.slug)}
                onChange={(e) =>
                  patch({
                    related: e.target.checked
                      ? [...service.related, s.slug]
                      : service.related.filter((slug) => slug !== s.slug),
                  })
                }
              />
              {t(s.title)}
            </label>
          ))}
      </div>
      <small>{t("Choose up to six related services.")}</small>
    </div>
  );
}
