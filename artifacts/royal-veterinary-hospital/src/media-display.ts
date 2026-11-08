import type { CSSProperties } from "react";
import { featuredServices } from "./content";

// The supplied services artwork contains six photos in one image.
// Keep editor previews and public cards on the same crop.
export function servicePhotoStyle(index: number, src: string): CSSProperties {
  const sprite = src.split("?")[0].endsWith("/royal-services.png");
  return {
    backgroundImage: `url("${src}")`,
    backgroundPosition: sprite
      ? `${(featuredServices[index].x / (2172 - 270)) * 100}% 44.5%`
      : "center",
    backgroundSize: sprite ? "804.444% auto" : "cover",
    backgroundRepeat: "no-repeat",
  };
}
