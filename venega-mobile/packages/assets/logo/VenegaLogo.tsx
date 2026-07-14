import React from 'react';

interface VenegaLogoProps {
  /** Width of the logo. Height auto-scales. */
  size?: number;
  /** Show wordmark below icon */
  showWordmark?: boolean;
  /** Custom className */
  className?: string;
  /** onClick handler */
  onClick?: () => void;
}

/**
 * Venega Logo — Camera aperture icon with 7 curved blades.
 * 6 emerald green blades + 1 gold blade (representing "whose turn").
 * 
 * Use `showWordmark={true}` for full logo with "Venega" text.
 * Use `showWordmark={false}` for icon-only (app icons, nav, etc).
 */
export const VenegaLogo: React.FC<VenegaLogoProps> = ({
  size = 120,
  showWordmark = true,
  className,
  onClick,
}) => {
  const viewBox = showWordmark ? '0 0 512 620' : '0 0 512 512';
  const height = showWordmark ? (size * 620) / 512 : size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="none"
      width={size}
      height={height}
      className={className}
      onClick={onClick}
      role="img"
      aria-label="Venega logo"
    >
      <defs>
        <clipPath id="venega-clip">
          <circle cx="256" cy={showWordmark ? 240 : 256} r={showWordmark ? 150 : 200} />
        </clipPath>
      </defs>

      {showWordmark ? (
        /* ── Full logo with wordmark ── */
        <>
          <g clipPath="url(#venega-clip)">
            {/* Blade 1 — GOLD */}
            <path d="M 256 240 C 272 180, 300 120, 350 90 C 395 62, 435 85, 440 140 C 445 192, 425 230, 395 252 Z" fill="#D9A441" />
            {/* Blade 2 */}
            <path d="M 256 240 C 325 208, 388 212, 428 248 C 462 280, 456 325, 425 360 C 396 390, 358 395, 325 376 Z" fill="#0F8563" />
            {/* Blade 3 */}
            <path d="M 256 240 C 300 286, 325 344, 312 399 C 300 442, 265 454, 228 434 C 195 416, 175 386, 175 354 Z" fill="#0B6E50" />
            {/* Blade 4 */}
            <path d="M 256 240 C 225 302, 182 356, 135 374 C 92 390, 62 362, 62 320 C 62 282, 80 254, 112 236 Z" fill="#063C2C" />
            {/* Blade 5 */}
            <path d="M 256 240 C 188 259, 125 252, 85 219 C 48 188, 52 146, 80 112 C 106 82, 140 72, 178 82 Z" fill="#074B36" />
            {/* Blade 6 */}
            <path d="M 256 240 C 210 189, 186 132, 198 84 C 210 40, 248 26, 282 40 C 315 52, 330 76, 330 109 Z" fill="#0F8563" />
            {/* Blade 7 */}
            <path d="M 256 240 C 278 194, 288 139, 272 92 C 258 50, 228 39, 202 54 C 178 69, 165 96, 172 132 Z" fill="#0A5C42" />
          </g>
          {/* White separators */}
          <g stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" clipPath="url(#venega-clip)">
            <path d="M 256 240 C 272 180, 300 120, 350 90" />
            <path d="M 256 240 C 325 208, 388 212, 428 248" />
            <path d="M 256 240 C 300 286, 325 344, 312 399" />
            <path d="M 256 240 C 225 302, 182 356, 135 374" />
            <path d="M 256 240 C 188 259, 125 252, 85 219" />
            <path d="M 256 240 C 210 189, 186 132, 198 84" />
            <path d="M 256 240 C 278 194, 288 139, 272 92" />
          </g>
          <circle cx="256" cy="240" r="28" fill="white" />
          {/* Wordmark */}
          <text
            x="256"
            y="515"
            textAnchor="middle"
            fontFamily="'Sora','Baloo 2','Outfit','Nunito',Arial,sans-serif"
            fontWeight="800"
            fontSize="86"
            fill="#074B36"
            letterSpacing="-2.5"
          >
            Venega
          </text>
        </>
      ) : (
        /* ── Icon only ── */
        <>
          <g clipPath="url(#venega-clip)">
            <path d="M 256 256 C 272 180, 300 120, 350 90 C 395 62, 435 85, 440 140 C 445 192, 425 230, 395 252 Z" fill="#D9A441" />
            <path d="M 256 256 C 325 228, 388 232, 428 268 C 462 300, 456 345, 425 380 C 396 410, 358 415, 325 396 Z" fill="#0F8563" />
            <path d="M 256 256 C 300 302, 325 360, 312 415 C 300 458, 265 470, 228 450 C 195 432, 175 402, 175 370 Z" fill="#0B6E50" />
            <path d="M 256 256 C 225 318, 182 372, 135 390 C 92 406, 62 378, 62 336 C 62 298, 80 270, 112 252 Z" fill="#063C2C" />
            <path d="M 256 256 C 188 275, 125 268, 85 235 C 48 204, 52 162, 80 128 C 106 98, 140 88, 178 98 Z" fill="#074B36" />
            <path d="M 256 256 C 210 205, 186 148, 198 100 C 210 56, 248 42, 282 56 C 315 68, 330 92, 330 125 Z" fill="#0F8563" />
            <path d="M 256 256 C 278 210, 288 155, 272 108 C 258 66, 228 55, 202 70 C 178 85, 165 112, 172 148 Z" fill="#0A5C42" />
          </g>
          <g stroke="white" strokeWidth="5.5" strokeLinecap="round" fill="none" clipPath="url(#venega-clip)">
            <path d="M 256 256 C 272 180, 300 120, 350 90" />
            <path d="M 256 256 C 325 228, 388 232, 428 268" />
            <path d="M 256 256 C 300 302, 325 360, 312 415" />
            <path d="M 256 256 C 225 318, 182 372, 135 390" />
            <path d="M 256 256 C 188 275, 125 268, 85 235" />
            <path d="M 256 256 C 210 205, 186 148, 198 100" />
            <path d="M 256 256 C 278 210, 288 155, 272 108" />
          </g>
          <circle cx="256" cy="256" r="35" fill="white" />
        </>
      )}
    </svg>
  );
};

export default VenegaLogo;
