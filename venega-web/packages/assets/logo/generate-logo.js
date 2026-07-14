/**
 * Venega Logo Generator v2
 * 
 * Generates a precise camera aperture iris SVG matching the reference image.
 * 7 overlapping curved blades with pinwheel swirl.
 * 
 * Key observations from reference:
 * - Blades are wide, organic, curved petals (not thin wedges)
 * - Strong swirl/pinwheel rotation (~40-45° twist)
 * - Gold blade at ~1 o'clock (top right)
 * - Green blades vary from lighter (#0F8563) to darker (#063C2C) around the circle
 * - White gaps are thin curved lines between blades
 * - Center has a small circular opening
 * - Blades overlap each other slightly, creating depth
 */

const fs = require('fs');
const path = require('path');

// ── Configuration ──
const CX = 256;
const CY = 256;
const R_OUTER = 150;
const R_INNER = 26;
const N = 7;
const TWIST = 42;      // stronger twist for more swirl (matching reference)
const GAP_WIDTH = 2.8;  // narrow white gaps

const ANGLE_STEP = 360 / N; // ~51.43°

// Colors ordered around the aperture, matching the reference image gradient
// Blade 0 = gold (top-right), then clockwise through greens
const BLADE_COLORS = [
  '#D9A441',  // 0: GOLD — top right (whose turn)
  '#0F8563',  // 1: lighter green  
  '#0B6E50',  // 2: mid-light green
  '#074B36',  // 3: mid green
  '#063C2C',  // 4: darkest green
  '#074B36',  // 5: mid-dark green
  '#0B6E50',  // 6: mid green
];

// Start angle offset to position the gold blade at top-right (~1 o'clock)
const START_ANGLE = -10;

// ── Math helpers ──
function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function polarToXY(r, angleDeg) {
  const rad = toRad(angleDeg);
  return {
    x: +(CX + r * Math.sin(rad)).toFixed(2),
    y: +(CY - r * Math.cos(rad)).toFixed(2),
  };
}

/**
 * Generate a smooth cubic bezier separator curve from inner circle to outer.
 * The curve goes from (R_INNER, innerAngle) → (R_OUTER, outerAngle)
 * with smooth S-shaped organic curvature.
 */
function curvePath(innerAngle, outerAngle) {
  const p0 = polarToXY(R_INNER, innerAngle);
  const p3 = polarToXY(R_OUTER, outerAngle);
  
  // Create smooth organic curve with two control points
  // CP1: at ~35% radius, angle interpolated 25% toward outer
  const r1 = R_INNER + (R_OUTER - R_INNER) * 0.33;
  const a1 = innerAngle + (outerAngle - innerAngle) * 0.25;
  const cp1 = polarToXY(r1, a1);
  
  // CP2: at ~70% radius, angle interpolated 75% toward outer  
  const r2 = R_INNER + (R_OUTER - R_INNER) * 0.72;
  const a2 = innerAngle + (outerAngle - innerAngle) * 0.75;
  const cp2 = polarToXY(r2, a2);
  
  return { p0, cp1, cp2, p3 };
}

/**
 * SVG arc command for circular arc.
 */
function arcCmd(r, fromAngle, toAngle) {
  const p = polarToXY(r, toAngle);
  let sweep = toAngle - fromAngle;
  if (sweep < 0) sweep += 360;
  const largeArc = sweep > 180 ? 1 : 0;
  return `A ${r} ${r} 0 ${largeArc} 1 ${p.x} ${p.y}`;
}

/**
 * Generate blade path.
 * Each blade is bounded by two adjacent separator curves and circle arcs.
 */
function bladePath(i) {
  // Left edge of blade
  const leftInnerA = START_ANGLE + i * ANGLE_STEP + GAP_WIDTH / 2;
  const leftOuterA = leftInnerA + TWIST;
  const left = curvePath(leftInnerA, leftOuterA);
  
  // Right edge of blade (next separator)
  const rightInnerA = START_ANGLE + (i + 1) * ANGLE_STEP - GAP_WIDTH / 2;
  const rightOuterA = rightInnerA + TWIST;
  const right = curvePath(rightInnerA, rightOuterA);
  
  // Build closed path
  return [
    // Start at left separator inner point
    `M ${left.p0.x} ${left.p0.y}`,
    // Curve along left separator to outer circle
    `C ${left.cp1.x} ${left.cp1.y}, ${left.cp2.x} ${left.cp2.y}, ${left.p3.x} ${left.p3.y}`,
    // Arc along outer circle to right separator's outer point
    arcCmd(R_OUTER, leftOuterA, rightOuterA),
    // Curve back along right separator to inner circle (reverse direction)
    `C ${right.cp2.x} ${right.cp2.y}, ${right.cp1.x} ${right.cp1.y}, ${right.p0.x} ${right.p0.y}`,
    // Arc along inner circle back to start
    `A ${R_INNER} ${R_INNER} 0 0 0 ${left.p0.x} ${left.p0.y}`,
    'Z',
  ].join(' ');
}

/**
 * Generate separator curve path (for white gap overlay lines).
 */
function sepPath(i) {
  const innerA = START_ANGLE + i * ANGLE_STEP;
  const outerA = innerA + TWIST;
  const c = curvePath(innerA, outerA);
  return `M ${c.p0.x} ${c.p0.y} C ${c.cp1.x} ${c.cp1.y}, ${c.cp2.x} ${c.cp2.y}, ${c.p3.x} ${c.p3.y}`;
}


// ── Build SVGs ──

function buildBladesSVG() {
  let paths = '';
  for (let i = 0; i < N; i++) {
    paths += `    <path d="${bladePath(i)}" fill="${BLADE_COLORS[i]}"/>\n`;
  }
  return paths;
}

function buildSeparatorsSVG(strokeWidth = 4) {
  let paths = '';
  for (let i = 0; i < N; i++) {
    paths += `    <path d="${sepPath(i)}" stroke="white" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round"/>\n`;
  }
  return paths;
}

// ── Icon only (512×512) ──
const iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <clipPath id="ac">
      <circle cx="${CX}" cy="${CY}" r="${R_OUTER}"/>
    </clipPath>
  </defs>
  <g clip-path="url(#ac)">
${buildBladesSVG()}  </g>
  <circle cx="${CX}" cy="${CY}" r="${R_INNER}" fill="white"/>
</svg>`;

// ── Full logo with wordmark (512×640) ──
// Shift icon up to make room for text
const ICON_CY_OFFSET = -40; // shift icon center up
const fullSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 640" fill="none">
  <defs>
    <clipPath id="ac">
      <circle cx="${CX}" cy="${CY + ICON_CY_OFFSET}" r="${R_OUTER}"/>
    </clipPath>
  </defs>
  <g transform="translate(0, ${ICON_CY_OFFSET})" clip-path="url(#ac)">
${buildBladesSVG()}  </g>
  <circle cx="${CX}" cy="${CY + ICON_CY_OFFSET}" r="${R_INNER}" fill="white"/>

  <!-- Wordmark -->
  <text x="256" y="530"
        text-anchor="middle"
        font-family="'Sora','Baloo 2','Outfit','Nunito',sans-serif"
        font-weight="800"
        font-size="90"
        fill="#074B36"
        letter-spacing="-2">Venega</text>
</svg>`;

// ── Icon with transparent background for mobile (1024×1024) ──  
const mobileIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <clipPath id="ac">
      <circle cx="${CX}" cy="${CY}" r="${R_OUTER}"/>
    </clipPath>
  </defs>
  <rect width="512" height="512" fill="#FAF7F1"/>
  <g clip-path="url(#ac)">
${buildBladesSVG()}  </g>
  <circle cx="${CX}" cy="${CY}" r="${R_INNER}" fill="#FAF7F1"/>
</svg>`;

// ── Favicon (simple, works at 16px) ──
const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <clipPath id="ac">
      <circle cx="${CX}" cy="${CY}" r="${R_OUTER}"/>
    </clipPath>
  </defs>
  <g clip-path="url(#ac)">
${buildBladesSVG()}  </g>
  <circle cx="${CX}" cy="${CY}" r="${R_INNER}" fill="white"/>
</svg>`;

// ── Write all files ──
const outDir = __dirname;

fs.writeFileSync(path.join(outDir, 'venega-icon.svg'), iconSVG);
fs.writeFileSync(path.join(outDir, 'venega-logo-full.svg'), fullSVG);
fs.writeFileSync(path.join(outDir, 'venega-icon-mobile.svg'), mobileIconSVG);
fs.writeFileSync(path.join(outDir, 'venega-favicon.svg'), faviconSVG);

console.log('✅ venega-icon.svg         — Icon only, transparent bg');
console.log('✅ venega-logo-full.svg     — Icon + "Venega" wordmark');
console.log('✅ venega-icon-mobile.svg   — Icon with #FAF7F1 bg (mobile)');
console.log('✅ venega-favicon.svg       — Favicon');
console.log('\nDone! Open preview.html to compare.');
