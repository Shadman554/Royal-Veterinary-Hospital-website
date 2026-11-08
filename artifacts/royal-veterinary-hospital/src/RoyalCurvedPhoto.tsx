import { useId } from 'react';

/**
 * Exact curved-frame geometry extracted from your Group 2.svg.
 * Only the image content changes: the curved mask and green ribbon stay intact.
 * Use <RoyalCurvedPhoto src="/assets/hospital.jpg" alt="Hospital exterior" />.
 */
export type RoyalCurvedPhotoProps = {
  src: string;
  alt: string;
  className?: string;
};

const RIBBON_PATH = "M934.128 1994.85H998.276C861.934 2012.51 759.276 2184.85 754.276 2287.85C752.276 2327.85 770.618 2362.5 802.618 2362.5C721.128 2362.5 700.128 2334 702.128 2287.85C707.128 2172 797.786 2012.51 934.128 1994.85Z";
const PHOTO_PATH = "M998.276 1994.85C1134.62 1977.19 1589.28 1994.85 1589.28 1994.85C1616.28 1994.85 1637.28 2014.85 1637.28 2040.85V2299.85C1417.12 2257 1174.62 2362.5 802.618 2362.5C770.618 2362.5 752.276 2327.85 754.276 2287.85C759.276 2184.85 861.934 2012.51 998.276 1994.85Z";

export function RoyalCurvedPhoto({ src, alt, className = '' }: RoyalCurvedPhotoProps) {
  const uid = useId().replace(/[^A-Za-z0-9_-]/g, '_');
  const clipId = `royal-photo-${uid}`;
  const gradientId = `royal-green-${uid}`;
  return (
    <svg
      className={className}
      viewBox="695 1985 950 390"
      width="100%"
      role="img"
      aria-label={alt}
      style={{ display: 'block', overflow: 'visible', height: 'auto' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="850.138" y1="1994.85" x2="850.138" y2="2362.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8ED171" />
          <stop offset=".45" stopColor="#A6DBA6" stopOpacity=".9" />
          <stop offset="1" stopColor="#DEF5DE" stopOpacity=".08" />
        </linearGradient>
        <clipPath id={clipId}><path d={PHOTO_PATH} /></clipPath>
      </defs>
      <path d={RIBBON_PATH} fill={`url(#${gradientId})`} />
      <image
        href={src}
        x="753" y="1982" width="889" height="389"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
}
