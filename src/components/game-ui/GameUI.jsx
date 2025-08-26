import React, { useMemo, useState, useEffect } from "react";
import { Sparkles, Users, Dice5, Star, Target, Crown, Rocket } from "lucide-react";

/** Tailwind game-like UI primitives for your board game */

const theme = {
  bg: "bg-[#0f1020]",
  panel: "bg-[#151633]/80 backdrop-blur",
  text: "text-zinc-100",
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Glow = ({ className = "", color = "#e11d48" }) => (
  <div
    className={cn("pointer-events-none absolute inset-0 blur-3xl opacity-30", className)}
    style={{ background: `radial-gradient(60% 60% at 50% 40%, ${color}44 0%, transparent 60%)` }}
  />
);

export function Pane({ children, className = "" }) {
  return (
    <div className={cn("relative rounded-2xl border border-white/10 p-4 md:p-6 shadow-xl", theme.panel, className)}>
      {children}
    </div>
  );
}

export function Badge({ icon, label, tone = "zinc" }) {
  const toneClasses =
    {
      rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      zinc: "bg-white/10 text-zinc-200 border-white/20",
    }[tone] || "bg-white/10 text-zinc-200 border-white/20";

  const renderedIcon = icon
    ? React.cloneElement(icon, {
        className: ["h-4 w-4", icon.props?.className].filter(Boolean).join(" "),
      })
    : null;

  return (
    <span className={`inline-flex items-center gap-2 rounded-xl border px-2.5 py-1 text-xs font-semibold ${toneClasses}`}>
      {renderedIcon}
      <span>{label}</span>
    </span>
  );
}

export function Token({ label, tone = "rose" }) {
  const map = {
    rose: "bg-rose-500",
    cyan: "bg-cyan-500",
    emerald: "bg-emerald-500",
  };
  return (
    <span className={cn("inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold text-white shadow", map[tone])}>
      {label}
    </span>
  );
}

export function Stat({ icon, label, value, tone = "rose" }) {
  const toneMap = {
    rose: "text-rose-400",
    cyan: "text-cyan-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
  };

  // Accept either icon={<Timer />} OR icon={Timer}
  let IconEl = null;
  if (icon) {
    if (typeof icon === "function") {
      const Cmp = icon; // passed a component
      IconEl = <Cmp className={["h-5 w-5", toneMap[tone]].join(" ")} />;
    } else {
      // passed an element
      IconEl = React.cloneElement(icon, {
        className: ["h-5 w-5", toneMap[tone], icon.props?.className].filter(Boolean).join(" "),
      });
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="rounded-xl border border-white/10 p-2 bg-[#151633]/80 backdrop-blur">
        {IconEl}
      </div>
      <div>
        <div className="text-sm text-zinc-400">{label}</div>
        <div className="text-xl font-extrabold text-white">{value}</div>
      </div>
    </div>
  );
}

  // Accept either icon={Timer} or icon={<Timer />}
  let IconEl = null;
  if (icon) {
    if (typeof icon === "function") {
      const Cmp = icon;
      IconEl = <Cmp className={["h-5 w-5", toneMap[tone]].join(" ")} />;
    } else {
      IconEl = React.cloneElement(icon, {
        className: ["h-5 w-5", toneMap[tone], icon.props?.className].filter(Boolean).join(" "),
      });
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className={cn("rounded-xl border border-white/10 p-2", theme.panel)}>
        {IconEl}
      </div>
      <div>
        <div className="text-sm text-zinc-400">{label}</div>
        <div className="text-xl font-extrabold text-white">{value}</div>
      </div>
    </div>
  );


export function ProgressTrack({ steps = 10, value = 3 }) {
  return (
    <div className="grid grid-cols-10 gap-1">
      {Array.from({ length: steps }).map((_, i) => (
        <div key={i} className={cn("h-2 rounded-full", i < value ? "bg-gradient-to-r from-rose-500 to-cyan-400" : "bg-white/10")} />
      ))}
    </div>
  );
}

export function DiceButton({ onRoll, disabled }) {
  return (
    <button
      onClick={onRoll}
      disabled={disabled}
      className={cn(
        "group relative flex items-center gap-2 rounded-2xl px-5 py-3 font-extrabold",
        "border border-white/10 bg-white/5 enabled:hover:bg-white/10 enabled:active:scale-95 transition",
        "shadow-xl backdrop-blur ring-2 ring-white/10"
      )}
    >
      <Dice5 className="h-5 w-5" />
      Roll Dice
      <Sparkles className="h-4 w-4 opacity-70 group-hover:rotate-12 transition" />
    </button>
  );
}

export function TurnBanner({ team, color = "#e11d48" }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 p-4 md:p-5 bg-gradient-to-br from-white/5 to-white/0">
      <Glow color={color} />
      <div className="flex items-center gap-3">
        <Crown className="h-5 w-5 text-amber-400" />
        <div className="text-sm text-zinc-300">Current Turn</div>
      </div>
      <div className="mt-1 text-2xl font-black text-white">{team}</div>
    </div>
  );
}

export function Card({ title, children, footer, tone = "rose" }) {
  const bar = {
    rose: "from-rose-500 to-rose-400",
    cyan: "from-cyan-500 to-cyan-400",
    emerald: "from-emerald-500 to-emerald-400",
    amber: "from-amber-500 to-amber-400",
  };
  return (
    <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur shadow-xl">
      <div className={cn("h-1 w-full bg-gradient-to-r", bar[tone])} />
      <div className="p-5">
        <h3 className="text-lg font-extrabold text-white">{title}</h3>
        <div className="mt-3 text-sm text-zinc-300">{children}</div>
      </div>
      {footer && <div className="border-t border-white/10 p-4 text-right">{footer}</div>}
    </div>
  );
}

export function ScoreTile({ team, score, tone = "rose" }) {
  const ring = {
    rose: "ring-rose-500/40",
    cyan: "ring-cyan-500/40",
    emerald: "ring-emerald-500/40",
    amber: "ring-amber-500/40",
  };
  return (
    <div className={cn("rounded-2xl p-4 md:p-5 bg-white/5 border border-white/10 backdrop-blur", ring[tone])}>
      <div className="text-xs uppercase tracking-wider text-zinc-400">{team}</div>
      <div className="mt-1 text-3xl font-black text-white">{score}</div>
    </div>
  );
}

export function Countdown({ seconds = 60, onDone }) {
  const [time, setTime] = useState(seconds);
  useEffect(() => {
    if (time <= 0) return void onDone?.();
    const id = setTimeout(() => setTime((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [time, onDone, seconds]);
  const pct = Math.max(0, Math.min(100, (time / seconds) * 100));
  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
        <span>Time</span>
        <span>{time}s</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-rose-500 to-cyan-400" style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}

export function Toast({ show, message }) {
  return (
    <div className={cn("fixed left-1/2 top-4 -translate-x-1/2 z-50 transition-all", show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none")}>
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-2 backdrop-blur">
        <Star className="h-4 w-4 text-amber-400" />
        <span className="text-sm text-white">{message}</span>
      </div>
    </div>
  );
}

export function GameHeader({ title, subtitle }) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl bg-gradient-to-br from-rose-600/20 to-cyan-500/10">
      <Glow />
      <div className="flex items-center gap-3 text-rose-400">
        <Rocket className="h-5 w-5" />
        <span className="tracking-widest text-xs font-semibold uppercase">BSC • Producer Services</span>
      </div>
      <h1 className="mt-3 text-2xl md:text-4xl font-black text-white drop-shadow">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm md:text-base text-zinc-300">{subtitle}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {/* Replaced the possibly-missing <Swords /> with <Sparkles /> */}
        <Badge icon={<Sparkles />} label="Head-to-Head" tone="rose" />
        <Badge icon={<Target />} label="Quest Cards" tone="amber" />
        <Badge icon={<Users />} label="Team Play" tone="cyan" />
      </div>
    </header>
  );
}

export function Avatar({ label }) {
  const seed = useMemo(() => (label.charCodeAt(0) + label.charCodeAt(label.length - 1)) % 360, [label]);
  return (
    <div
      className="h-8 w-8 rounded-full border border-white/10 grid place-items-center text-xs font-bold text-white"
      style={{ background: `conic-gradient(from 90deg, hsl(${seed},80%,55%), hsl(${(seed + 60) % 360},80%,55%))` }}
      title={label}
    >
      {label[0]}
    </div>
  );
}

export function TeamCard({ name, members, color = "rose" }) {
  const map = {
    rose: "from-rose-500 to-rose-400",
    cyan: "from-cyan-500 to-cyan-400",
    emerald: "from-emerald-500 to-emerald-400",
    amber: "from-amber-500 to-amber-400",
  };
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
      <div className={cn("h-1 w-full bg-gradient-to-r", map[color])} />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-400">Team</div>
            <div className="text-xl font-black text-white">{name}</div>
          </div>
          <div className="flex -space-x-2">
            {members.map((m, i) => (
              <Avatar key={i} label={m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Optional page wrapper background */
export function GameSurface({ children }) {
  return (
    <div className={cn(theme.bg, theme.text, "min-h-screen w-full")}>
      <div className="pointer-events-none fixed inset-0 opacity-20">
        <svg className="absolute -left-10 top-10 h-72" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        <path fill="url(#g1)" d="M37.4,-53.6C50.5,-47.9,64.5,-41.5,70.2,-30.7C75.8,-19.9,73.1,-4.8,68.1,8.2C63.2,21.2,56,32.1,46.6,42.8C37.1,53.6,25.4,64.2,11.6,69.2C-2.2,74.3,-18.1,73.9,-33.5,69.1C-49,64.2,-64,55,-71.2,41.5C-78.4,27.9,-77.8,10,-71.1,-4.4C-64.3,-18.8,-51.3,-29.5,-39.1,-35.6C-26.9,-41.8,-15.4,-43.4,-3.5,-39.2C8.4,-34.9,16.7,-24.1,37.4,-53.6Z" transform="translate(100 100)" />
        </svg>
      </div>
      {children}
    </div>
  );
}
