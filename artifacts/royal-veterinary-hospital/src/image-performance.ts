const optimizedAssets: Record<string, string> = {
  "/rvh/assets/figma-hero-companions.png": "/rvh/assets/hero-companions-optimized.webp",
  "/rvh/assets/royal-hospital-map.png": "/rvh/assets/hospital-map-optimized.webp",
  "/rvh/assets/royal-logo-transparent.png": "/rvh/assets/royal-logo-optimized.webp",
  "/rvh/assets/royal-hospital.png": "/rvh/assets/hospital-optimized.webp",
  "/rvh/assets/royal-pets.png": "/rvh/assets/pets-optimized.webp",
};

export function optimizedImageUrl(src: string): string {
  return optimizedAssets[src] || src;
}
