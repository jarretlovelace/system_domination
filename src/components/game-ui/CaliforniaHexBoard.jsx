import React, { useMemo } from "react";
import { geoPath, geoMercator, geoContains } from "d3-geo";
import { feature } from "topojson-client";
import states from "us-atlas/states-10m.json";

function hexPolygon(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 30); // flat-top hex
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

export default function CaliforniaHexBoard({
  sections,         // [{id,name}] used only for labels
  owners = {},      // { spaceId: "#hexcolor" } (spaceId is "h-<index>")
  onSpaceClick,     // (space) => void
  hexRadius = 18,   // hex “tile” size
  maxSpaces,        // optional cap on spaces drawn
}) {
  const width = 720;
  const height = 1100;

  // 1) Build CA geometry + projection
  const { caGeo, path, project, invert } = useMemo(() => {
    const coll = feature(states, states.objects.states);
    const ca = coll.features.find((f) => String(f.id) === "06"); // California FIPS
    const proj = geoMercator().fitSize([width, height], ca);
    const p = geoPath(proj);
    return { caGeo: ca, path: p, project: proj, invert: proj.invert };
  }, []);

  // 2) Generate hex centers over a rectangle, keep only those whose geographic
  //    position is inside California using geoContains(caGeo, [lon, lat]).
  const spaces = useMemo(() => {
    const r = hexRadius;
    const w = r * 2;
    const h = Math.sqrt(3) * r;       // vertical spacing for flat-top hexes
    const xStep = w * 0.75;           // column step (flat-top)
    const yStep = h;

    const list = [];
    let id = 0;
    for (let y = r; y <= height - r; y += yStep) {
      const row = Math.round((y - r) / yStep);
      const xOffset = (row % 2 ? xStep / 2 : 0);
      for (let x = r + xOffset; x <= width - r; x += xStep) {
        const lonlat = invert([x, y]);
        if (!lonlat) continue;
        if (geoContains(caGeo, lonlat)) {
          list.push({
            id: `h-${id++}`,
            cx: x,
            cy: y,
            pts: hexPolygon(x, y, r - 0.8), // slight inset for border
          });
        }
      }
    }

    // Optional cap to avoid too many tiles on small devices
    if (maxSpaces && list.length > maxSpaces) {
      return list.slice(0, maxSpaces);
    }
    return list;
  }, [caGeo, invert, hexRadius, maxSpaces]);

  // 3) Choose 12 label anchor tiles to place your section names (spread across map)
  const labels = useMemo(() => {
    if (!sections?.length) return [];
    const n = Math.min(12, sections.length);
    if (spaces.length === 0) return [];

    // Sort by y, then x to spread roughly top-left -> bottom-right
    const sorted = [...spaces].sort((a, b) => (a.cy - b.cy) || (a.cx - b.cx));
    const picks = [];
    for (let i = 0; i < n; i++) {
      const k = Math.floor((i + 0.5) * (sorted.length / n));
      picks.push({
        ...sorted[Math.min(sorted.length - 1, k)],
        section: sections[i],
        idx: i + 1,
      });
    }
    return picks;
  }, [spaces, sections]);

  return (
    <div className="mx-auto w-full max-w-[780px]">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <clipPath id="ca-clip">
            <path d={path(caGeo)} />
          </clipPath>
          <linearGradient id="ca-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* faint CA outline */}
        <path d={path(caGeo)} fill="url(#ca-grad)" opacity="0.06" />

        {/* HEX SPACES (clipped to California) */}
        <g clipPath="url(#ca-clip)">
          {spaces.map((h) => {
            const owned = owners[h.id];
            return (
              <g key={h.id}>
                {/* fill */}
                <polygon
                  points={h.pts.map((p) => p.join(",")).join(" ")}
                  fill={owned ? `${owned}42` : "#ffffff12"}
                  stroke="#ffffff"
                  strokeOpacity="0.06"
                  strokeWidth="1"
                />
                {/* hit area */}
                <polygon
                  points={h.pts.map((p) => p.join(",")).join(" ")}
                  fill="#ffffff00"
                  className="cursor-pointer"
                  onClick={() => onSpaceClick?.(h)}
                  onMouseEnter={(e) => e.currentTarget.previousSibling?.setAttribute("strokeOpacity", "0.28")}
                  onMouseLeave={(e) => e.currentTarget.previousSibling?.setAttribute("strokeOpacity", "0.06")}
                />
              </g>
            );
          })}
        </g>

        {/* strong CA stroke on top */}
        <path d={path(caGeo)} fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="2" />

        {/* Section labels (soft overlay near chosen tiles) */}
        {labels.map((l, i) => (
          <g key={`label-${i}`} transform={`translate(${l.cx}, ${l.cy})`}>
            <rect x={-70} y={-34} width={140} height={24} rx={8} fill="#0b0c1f" opacity="0.6" />
            <text
              x={0}
              y={-18}
              textAnchor="middle"
              className="select-none"
              style={{ fill: "white", fontSize: 10, fontWeight: 700 }}
            >
              {`${l.idx}. ${l.section.name}`}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
