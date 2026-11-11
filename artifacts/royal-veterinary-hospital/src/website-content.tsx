import type { ImgHTMLAttributes } from "react";
import { useSite } from "./site-state";
import { translate, useLanguage } from "./language";
import { optimizedImageUrl } from "./image-performance";

export function useCopy() {
  const { content } = useSite();
  const { language } = useLanguage();
  return (original: string) => translate(original, language, content.copy);
}
export const assetUrl = (value: string) =>
  value.startsWith("/") ? value : `/rvh/assets/${value}`;

export function SiteImage({
  mediaKey,
  src = "",
  alt = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { mediaKey?: string }) {
  const { content } = useSite();
  const t = useCopy();
  const entry = content.media[mediaKey || src];
  const url = optimizedImageUrl(entry?.src || src);
  return (
    <img
      {...props}
      src={url}
      onError={(event) => {
        // Recover old failed upload requests without refreshing the whole page.
        const img = event.currentTarget;
        if (url.startsWith("/api/media/") && img.getAttribute("src") === url) {
          img.src = `${url}${url.includes("?") ? "&" : "?"}retry=${Date.now()}`;
        } else props.onError?.(event);
      }}
      alt={t(entry?.alt ?? alt)}
      data-photo={!url.split("?")[0].endsWith(".svg") || undefined}
    />
  );
}
