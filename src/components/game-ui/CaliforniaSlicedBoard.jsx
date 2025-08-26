import React, { useMemo } from "react";
import { geoPath, geoMercator } from "d3-geo";
import { feature } from "topojson-client";
import states from "us-atlas/states-10m.json";

export default function CaliforniaSlicedBoard({ sections, owners = {}, onSectionClick }) {
  const width = 720, height = 1100;

  const { caGeo, path } = useMemo(() => {
    const coll = feature(states, states.objects.states);
    const ca = coll.features.find(f => String(f.id) === "06"); // California FIPS
    const proj = geoMercator().fitSize([width, height], ca);
    const p = geoPath(proj);
    return { caGeo: ca, path: p };
  }, []);

  const slices = useMemo(() => {
    const cols = 12;
    const w = width / cols;
    return Array.from({ length: cols }).map((_, i) => ({
      i,
      x: i * w,
      y: 0,
      w,
      h: height,
      id: sections[i]?.id,
      name: sections[i]?.name,
    }));
  }, [sections]);

  return (
    <div className="mx-auto w-full max-w-[780px]">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <clipPath id="ca-clip"><path d={path(caGeo)} /></clipPath>
          <linearGradient id="ca-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        <path d={path(caGeo)} fill="url(#ca-grad)" opacity="0.06" />

        {slices.map((s, idx) => {
          const ownedColor = s.id ? owners[s.id] : null;
          return (
            <g key={idx} clipPath="url(#ca-clip)">
              <rect x={s.x} y={s.y} width={s.w} height={s.h} fill={ownedColor ? `${ownedColor}33` : "#ffffff0D"} />
              <line x1={s.x} y1={0} x2={s.x} y2={height} stroke="white" strokeOpacity="0.08" />
              <rect
                x={s.x} y={s.y} width={s.w} height={s.h}
                fill="#ffffff00" className="cursor-pointer"
                onClick={() => s.id && onSectionClick?.({ id: s.id, name: s.name })}
                onMouseEnter={e => e.currentTarget.previousSibling?.setAttribute("strokeOpacity", "0.2")}
                onMouseLeave={e => e.currentTarget.previousSibling?.setAttribute("strokeOpacity", "0.08")}
              />
            </g>
          );
        })}

        <path d={path(caGeo)} fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="2" />

        {slices.map((s, idx) => s.id ? (
          <foreignObject
            key={`label-${idx}`}
            x={s.x + s.w * 0.12}
            y={height * 0.42 + (idx % 2 ? 18 : -6)}
            width={s.w * 0.76}
            height="40"
            clipPath="url(#ca-clip)"
          >
            <div className="pointer-events-none select-none text-[10px] md:text-xs leading-tight text-white font-semibold drop-shadow">
              {idx + 1}. {s.name}
            </div>
          </foreignObject>
        ) : null)}
      </svg>
    </div>
  );
}
