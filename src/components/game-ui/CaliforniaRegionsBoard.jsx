import React, { useMemo } from "react";

/**
 * CaliforniaRegionsBoard
 * Renders California split into 12 clickable polygon regions.
 *
 * props:
 * - sections: [{ id, name }]  // order should be 12 long; maps onto regions left→right / zig-zag down the state
 * - owners:   { [sectionId]: "#rrggbb" }  // if owned, region fills with team color
 * - regionColors: { [sectionId]: "#rrggbb" } // base tint per region (low alpha when unowned)
 * - homeSections: Set<string>  // highlight these regions as home bases
 * - onSectionClick: (section) => void
 */
export default function CaliforniaRegionsBoard({
  sections = [],
  owners = {},
  regionColors = {},
  homeSections,
  onSectionClick,
}) {
  // Approx California outline (same coordinate system for regions)
  const OUTLINE = "M60 20 L240 40 L200 120 L220 180 L260 280 L180 360 L200 460 L140 580 L80 560 L60 480 L40 400 L50 300 L30 200 Z";

  // 12 region polygons (hand-drawn to look like your sketch: vertical bands up north,
  // diagonal cuts through the middle, a few long slashes in the south).
  // Each value is an SVG path that starts/ends on the CA outline so regions tile perfectly.
  // You can tweak points to match your desired art more closely.
  const REGION_PATHS = useMemo(
    () => [
      // 1 — far northwest (vertical slice)
      "M60 20 L120 28 L110 70 L90 110 L80 160 L70 200 L60 200 L60 20 Z",
      // 2 — north central (vertical slice)
      "M120 28 L180 36 L170 80 L150 120 L130 170 L90 210 L70 200 L80 160 L90 110 L110 70 Z",
      // 3 — north east (tapers to the ridge)
      "M180 36 L240 40 L200 120 L170 160 L150 200 L130 220 L90 210 L130 170 L150 120 L170 80 Z",
      // 4 — mid-west (diagonal down-right)
      "M60 200 L70 240 L80 270 L120 300 L180 320 L200 300 L220 260 L170 160 L150 200 L130 220 L90 210 Z",
      // 5 — mid (big central diagonal)
      "M70 240 L80 300 L140 330 L190 340 L230 320 L260 280 L220 180 L200 210 L200 240 L200 260 L200 280 L200 300 L180 320 L120 300 L80 270 Z",
      // 6 — mid-east (hinge toward the Sierra)
      "M220 180 L260 280 L230 320 L260 340 L180 360 L160 350 L170 340 L190 340 L230 320 L200 300 L200 280 L200 260 L200 240 L200 210 Z",
      // 7 — south-west diagonal into the Valley shoulder
      "M60 200 L50 300 L40 360 L60 380 L120 400 L160 380 L180 360 L160 350 L140 330 L80 300 L70 240 Z",
      // 8 — south-central long slash
      "M40 360 L60 480 L80 490 L140 480 L170 420 L160 380 L120 400 L60 380 Z",
      // 9 — southern interior (angled down-right)
      "M80 490 L140 580 L160 560 L170 520 L170 480 L170 460 L170 440 L170 420 L140 480 Z",
      // 10 — Mojave west
      "M170 420 L200 460 L180 520 L160 560 L140 580 L200 460 Z",
      // 11 — Mojave east / Imperial valley long bar
      "M200 460 L240 520 L240 560 L220 580 L180 560 L180 520 Z",
      // 12 — far southeast tail
      "M240 520 L260 560 L260 600 L220 580 L240 560 Z",
    ],
    []
  );

  const homeSet = useMemo(() => new Set(homeSections || []), [homeSections]);

  return (
    <div className="relative mx-auto w-full max-w-4xl aspect-[3/4] rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 overflow-hidden">
      <svg viewBox="0 0 300 600" className="w-full h-full">
        {/* CA outline behind everything */}
        <path d={OUTLINE} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />

        {/* Regions */}
        {REGION_PATHS.map((d, i) => {
          const sec = sections[i] || { id: `sec-${i + 1}`, name: `Section ${i + 1}` };
          const ownedFill = owners[sec.id] || null;
          const base = (regionColors[sec.id] || "#64748b") + "33"; // low alpha base
          const fill = ownedFill ? ownedFill : base;
          const stroke = homeSet.has(sec.id) ? "rgb(250, 204, 21)" : "rgba(255,255,255,0.18)";
          const strokeWidth = homeSet.has(sec.id) ? 2.2 : 1.2;

          return (
            <g key={sec.id}>
              <path
                d={d}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                onClick={() => onSectionClick?.(sec)}
                style={{ cursor: "pointer" }}
              />
              {/* Label (simple centroid by sampling path bbox) */}
              <LabelForPath d={d} text={sec.name} index={i} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Rough label placement: use SVGPathElement.getBBox via a hidden path */
function LabelForPath({ text, index }) {
  // fallback positions so labels always show
  const fallback = [
    [88, 95],[150, 80],[205, 90],
    [115, 210],[165, 245],[220, 250],
    [105, 345],[115, 430],[135, 520],
    [175, 535],[220, 555],[245, 585],
  ];
  const [x, y] = fallback[index] || [150, 300];

  return (
    <g>
      <text x={x} y={y} textAnchor="middle" fontSize="10" fontWeight="700" fill="white" opacity="0.9">
        {text}
      </text>
    </g>
  );
}
