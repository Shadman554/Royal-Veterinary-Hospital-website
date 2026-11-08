/** Original two-direction green waves from Group 2.svg, independent of page photographs. */
const TOP = "M0 831.916C0 831.916 59.9845 824.625 138 851.191C210.484 875.873 298.534 903.023 368.5 915.917C659.074 969.466 1049.02 922.746 1326.5 873.748C1529.28 837.941 1672 865.917 1672 865.917V940.917H0V831.916Z";
const BOTTOM = "M1672 1050C1672 1050 1612.02 1057.29 1534 1030.73C1461.52 1006.04 1373.47 978.894 1303.5 966C1012.93 912.45 622.984 959.17 345.5 1008.17C142.722 1043.98 0 1016 0 1016V941L1672 941V1050Z";

export type RoyalWaveProps = {
  className?: string;
  variant?: 'both' | 'top' | 'bottom';
};

export function RoyalWave({ className = '', variant = 'both' }: RoyalWaveProps) {
  const isTopOnly = variant === 'top' || className.includes('footer-wave');

  if (isTopOnly) {
    return (
      <svg
        className={className}
        viewBox="0 0 1672 110"
        width="100%"
        height="56"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ display: 'block', marginBottom: '-1px' }}
      >
        <path d={TOP} transform="translate(0 -831)" fill="#B3DF9C" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 1672 225"
      width="100%"
      height="112"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path d={TOP} transform="translate(0 -830)" fill="#B3DF9C" />
      <path d={BOTTOM} transform="translate(0 -830)" fill="#B3DF9C" />
    </svg>
  );
}
