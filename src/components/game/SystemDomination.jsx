import React, { useMemo, useState, useEffect } from "react";
import Modal from "../Modal.jsx";
import ChallengeCard from "../ChallengeCard.jsx";
import CaliforniaRegionsBoard from "../game-ui/CaliforniaRegionsBoard.jsx";

import {
  GameSurface, GameHeader, Pane, TurnBanner, Stat, ScoreTile,
  ProgressTrack, Badge, DiceButton, Countdown, Toast
} from "../game-ui/GameUI.jsx";
import { Timer, Users, Trophy, Sparkles } from "lucide-react";

/* --------- SECTIONS (edit names freely) --------- */
const SECTIONS = [
  { id: "sec-1",  name: "Facets" },
  { id: "sec-2",  name: "ShieldLink" },
  { id: "sec-3",  name: "ICM" },
  { id: "sec-4",  name: "Outlook" },
  { id: "sec-5",  name: "IWM" },
  { id: "sec-6",  name: "Documentum" },
  { id: "sec-7",  name: "Broker Connection" },
  { id: "sec-8",  name: "CS Admin" },
  { id: "sec-9",  name: "Knowledge Base" },
  { id: "sec-10", name: "Find A Doctor" },
  { id: "sec-11", name: "Teams" },
  { id: "sec-12", name: "Arvato" },
];

/* --------- Distinct base color for every region (shows when unowned) --------- */
const REGION_COLORS = {
  "sec-1":  "#ef4444",
  "sec-2":  "#f97316",
  "sec-3":  "#f59e0b",
  "sec-4":  "#84cc16",
  "sec-5":  "#22c55e",
  "sec-6":  "#06b6d4",
  "sec-7":  "#3b82f6",
  "sec-8":  "#8b5cf6",
  "sec-9":  "#d946ef",
  "sec-10": "#a855f7",
  "sec-11": "#14b8a6",
  "sec-12": "#e11d48",
};

/* --------- Teams (color = “home color”) --------- */
const TEAM_PALETTE = [
  { name: "Redwood", color: "#ef4444", tone: "rose" },
  { name: "Cascade", color: "#06b6d4", tone: "cyan" },
  { name: "Harbor",  color: "#22c55e", tone: "emerald" },
  { name: "Mesa",    color: "#f59e0b", tone: "amber" },
];

const defaultTeams = (count = 4) =>
  Array.from({ length: count }).map((_, i) => {
    const base = TEAM_PALETTE[i % TEAM_PALETTE.length];
    return {
      id: `team-${i + 1}`,
      name: base.name,
      color: base.color,     // this is the color regions will change to when captured
      tone: base.tone,
      home: null,            // sectionId picked in setup
      position: null,        // current sectionId (starts at home)
      owned: {},             // { sectionId: true } – includes home once picked
      points: 0,
      streak: 0,
      skip: 0,
    };
  });

function ColorBadge({ hex, children }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shadow"
      style={{ backgroundColor: `${hex}22`, color: hex }}
    >
      <span className="mr-1 h-2 w-2 rounded-full" style={{ backgroundColor: hex }} />
      {children}
    </span>
  );
}

export default function SystemDomination() {
  /**
   * PHASES:
   * - "setup"       : choose team count
   * - "pick-homes"  : teams (one by one) click a region to select their home base
   * - "playing"     : normal play
   * - "finished"    : winner modal
   */
  const [phase, setPhase] = useState("setup");
  const [teamCount, setTeamCount] = useState(4);
  const [teams, setTeams] = useState(defaultTeams(4));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [rolled, setRolled] = useState(null);
  const [activeChallenge, setChallengeFor] = useState(null); // { sectionId, defenderId }
  const [lastOutcome, setLastOutcome] = useState("");
  const [winnerId, setWinnerId] = useState(null);
  const [toast, setToast] = useState("");
  const [timerKey, setTimerKey] = useState(0);

  // Which regions are already taken as homes
  const takenHomes = useMemo(() => {
    const set = new Set();
    teams.forEach(t => t.home && set.add(t.home));
    return set;
  }, [teams]);

  // Map of region owner (from captures or homes)
  const ownersBySection = useMemo(() => {
    const m = {};
    teams.forEach(t => {
      // home counts as owned
      if (t.home) m[t.home] = t.id;
      Object.keys(t.owned || {}).forEach((sid) => (m[sid] = t.id));
    });
    return m;
  }, [teams]);

  // Fill colors to paint on the board (owned => team.color; else base tint)
  const displayOwners = useMemo(() => {
    const map = {};
    SECTIONS.forEach((sec) => {
      const teamId = ownersBySection[sec.id];
      if (teamId) {
        const team = teams.find((t) => t.id === teamId);
        if (team) map[sec.id] = team.color;
      } else {
        map[sec.id] = REGION_COLORS[sec.id]; // unowned shows its own base hue
      }
    });
    return map;
  }, [ownersBySection, teams]);

  const currentTeam = teams[currentIdx];
  const winnerTeam = winnerId ? teams.find((t) => t.id === winnerId) : null;

  useEffect(() => {
    if (activeChallenge) setTimerKey((k) => k + 1);
  }, [activeChallenge]);

  function resetGame() {
    setTeams(defaultTeams(teamCount));
    setCurrentIdx(0);
    setRolled(null);
    setChallengeFor(null);
    setLastOutcome("");
    setWinnerId(null);
    setPhase("setup");
  }

  /* ---------- Setup actions ---------- */
  function goPickHomes() {
    setPhase("pick-homes");
    setCurrentIdx(0); // first team picks first
  }

  function handlePickHome(section) {
    if (takenHomes.has(section.id)) {
      setToast("That region is already a home base.");
      setTimeout(() => setToast(""), 800);
      return;
    }
    setTeams(prev => prev.map((t, idx) => {
      if (idx !== currentIdx) return t;
      return {
        ...t,
        home: section.id,
        position: section.id,
        owned: { ...(t.owned || {}), [section.id]: true }, // home is owned immediately
      };
    }));

    const nextIdx = (currentIdx + 1) % teams.length;
    const pickingMore = teams.some((t, i) => i === nextIdx ? !t.home : false) ||
                        teams.some((t, i) => i !== nextIdx && !t.home);
    if (!pickingMore) {
      // everyone chose a home
      setPhase("playing");
      setCurrentIdx(0);
      return;
    }
    setCurrentIdx(nextIdx);
  }

  /* ---------- Play actions ---------- */
  function startGame() {
    setPhase("playing");
  }

  function nextTurn() {
    setCurrentIdx((i) => (i + 1) % teams.length);
    setRolled(null);
  }

  function rollDie() {
    if (phase !== "playing" || rolled !== null) return;

    if (currentTeam.skip && currentTeam.skip > 0) {
      setTeams((prev) =>
        prev.map((t, idx) => (idx === currentIdx ? { ...t, skip: t.skip - 1 } : t))
      );
      setLastOutcome(`${currentTeam.name} skips this turn due to an earlier event.`);
      setToast(`${currentTeam.name} skips this turn`);
      setTimeout(() => setToast(""), 900);
      return nextTurn();
    }

    const value = Math.floor(Math.random() * 4) + 1; // 1–4
    setRolled(value);

    // Move by region order in SECTIONS
    const curIndex = SECTIONS.findIndex((s) => s.id === currentTeam.position);
    const newIndex = (curIndex + value) % SECTIONS.length;
    const section = SECTIONS[newIndex];
    const ownerId = ownersBySection[section.id];

    setTeams((prev) =>
      prev.map((t, idx) => (idx === currentIdx ? { ...t, position: section.id } : t))
    );

    if (!ownerId) {
      setChallengeFor({ sectionId: section.id, defenderId: null });
    } else if (ownerId === currentTeam.id) {
      setTeams((prev) =>
        prev.map((t, idx) => (idx === currentIdx ? { ...t, points: (t.points || 0) + 1 } : t))
      );
      setLastOutcome(`${currentTeam.name} landed on their own region — morale boost! (+1 pt)`);
      setToast(`+1 pt to ${currentTeam.name}`);
      setTimeout(() => setToast(""), 900);
      setTimeout(() => nextTurn(), 350);
    } else {
      setChallengeFor({ sectionId: section.id, defenderId: ownerId });
    }
  }

  function handleChallengeResult(ok) {
    const { sectionId, defenderId } = activeChallenge || {};
    if (!sectionId) {
      setChallengeFor(null);
      return nextTurn();
    }

    const sectionName = SECTIONS.find((s) => s.id === sectionId)?.name || "Region";
    const wasTakeover = !!defenderId;

    if (!ok) {
      setTeams((prev) =>
        prev.map((t, idx) =>
          idx === currentIdx
            ? { ...t, points: Math.max(0, (t.points || 0) - 1), streak: 0, skip: (t.skip || 0) + (wasTakeover ? 1 : 0) }
            : t
        )
      );
      setLastOutcome(`${currentTeam.name} missed ${sectionName}. -1 point${wasTakeover ? " and skip next turn (failed takeover)" : ""}.`);
      setToast("Missed! -1 point");
      setTimeout(() => setToast(""), 900);
      setChallengeFor(null);
      return nextTurn();
    }

    // Success: color the region to the attacker's HOME COLOR (team.color)
    setTeams((prev) => {
      const updated = prev.map((t, idx) => {
        if (wasTakeover && t.id === defenderId) {
          const { [sectionId]: _removed, ...rest } = t.owned || {};
          return { ...t, owned: rest, skip: (t.skip || 0) + 1 };
        }
        if (idx === currentIdx) {
          const newOwned = { ...(t.owned || {}), [sectionId]: true };
          const newStreak = (t.streak || 0) + 1;
          const base = 1, takeoverBonus = wasTakeover ? 1 : 0, streakBonus = newStreak >= 3 ? 1 : 0;
          return { ...t, owned: newOwned, points: (t.points || 0) + base + takeoverBonus + streakBonus, streak: newStreak };
        }
        return t;
      });

      const me = updated[currentIdx];
      if (Object.keys(me.owned || {}).length === SECTIONS.length) {
        setWinnerId(me.id);
        setPhase("finished");
      }
      return updated;
    });

    setLastOutcome(
      wasTakeover
        ? `${currentTeam.name} captured ${sectionName}! (+1 base, +1 takeover${(currentTeam.streak || 0) + 1 >= 3 ? ", +1 streak" : ""})`
        : `${currentTeam.name} claimed ${sectionName}! (+1 base${(currentTeam.streak || 0) + 1 >= 3 ? ", +1 streak" : ""})`
    );
    setToast("Captured!");
    setTimeout(() => setToast(""), 900);

    setChallengeFor(null);
    nextTurn();
  }

  /* ---------------- RENDER ---------------- */
  const progressIndex = currentTeam.position
    ? SECTIONS.findIndex(s => s.id === currentTeam.position) + 1
    : 0;

  return (
    <GameSurface>
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12 space-y-8">
        <GameHeader
          title="System Domination — California Regions"
          subtitle="Each polygon is a region. Teams pick a home base; captured regions re-color to the attacker’s home color."
        />

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <TurnBanner team={currentTeam.name} />

          <Pane>
            <div className="grid grid-cols-3 gap-5">
              <Stat icon={<Timer />} label="Round Timer" value="60s" tone="cyan" />
              <Stat icon={<Users />} label="Teams" value={teams.length} tone="emerald" />
              <Stat icon={<Trophy />} label="Goal" value={`${SECTIONS.length} regions`} tone="amber" />
            </div>
          </Pane>

          <Pane className="flex items-center justify-between gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
              {teams.map((t) => (
                <ScoreTile key={t.id} team={t.name} score={t.points || 0} tone={t.tone} />
              ))}
            </div>
            <div className="hidden md:block w-px h-14 bg-white/10" />
            <div className="space-y-2 min-w-[160px]">
              <div className="text-xs text-zinc-400">Progress</div>
              <ProgressTrack steps={10} value={Math.round((progressIndex / SECTIONS.length) * 10)} />
              <div className="text-xs text-zinc-400">
                {progressIndex} / {SECTIONS.length}
              </div>
            </div>
          </Pane>
        </div>

        {/* Middle: Map + Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <Pane className="lg:col-span-2">
            <h3 className="mb-3 text-sm font-semibold text-zinc-300">
              {phase === "pick-homes" ? `Pick Home Bases — ${currentTeam.name}, choose a region` : "Board — Separate Regions"}
            </h3>

            <CaliforniaRegionsBoard
              sections={SECTIONS}
              owners={displayOwners}
              regionColors={REGION_COLORS}
              homeSections={new Set(teams.map(t => t.home).filter(Boolean))}
              onSectionClick={(sec) => {
                if (phase === "pick-homes") {
                  handlePickHome(sec);
                  return;
                }
                // Optional direct click during play (you can trigger a manual challenge)
                setToast(`Region: ${sec.name}`);
                setTimeout(() => setToast(""), 800);
              }}
            />

            <div className="mt-3 text-xs text-zinc-400">
              {phase === "pick-homes"
                ? "Tip: Home base is owned immediately and sets your team color. Others will recolor when captured."
                : "Tip: Roll to move. Regions change to the attacker’s home color when captured."}
            </div>
          </Pane>

          <Pane className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <ColorBadge hex={currentTeam.color}>{currentTeam.name}</ColorBadge>
                <span className="text-sm text-zinc-300">
                  {phase === "pick-homes"
                    ? "Choosing home…"
                    : `Position: ${progressIndex || "—"} / ${SECTIONS.length}`}
                </span>
                <span className="text-sm text-zinc-300">Roll: {rolled ?? "—"}</span>

                {/* Team count control */}
                <label className="text-xs md:text-sm text-zinc-300 flex items-center gap-2">
                  Teams
                  <select
                    className="rounded-md bg-white/10 border border-white/10 px-2 py-1 text-xs md:text-sm"
                    value={teamCount}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      setTeamCount(n);
                      setTeams(defaultTeams(n));  // reseed teams
                      setCurrentIdx(0);
                      setRolled(null);
                      setLastOutcome("");
                      setPhase("setup");
                    }}
                  >
                    {[2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15"
                  onClick={resetGame}
                >
                  Reset
                </button>

                {phase === "setup" && (
                  <button
                    className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15"
                    onClick={goPickHomes}
                  >
                    Pick Home Bases
                  </button>
                )}

                {phase === "pick-homes" && teams.every(t => !!t.home) && (
                  <button
                    className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15"
                    onClick={startGame}
                  >
                    Start
                  </button>
                )}

                {phase === "playing" && (
                  <DiceButton onRoll={rollDie} disabled={rolled !== null} />
                )}
              </div>
            </div>

            {lastOutcome && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-200">
                {lastOutcome}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Badge icon={<Sparkles />} label="Wildcard" tone="emerald" />
              <Badge icon={<Sparkles />} label="SCR Forms" tone="amber" />
              <Badge icon={<Sparkles />} label="Bonus Round" tone="rose" />
              <Badge icon={<Sparkles />} label="Boss Card" tone="cyan" />
            </div>
          </Pane>
        </div>

        <footer className="text-center text-xs text-zinc-500 pt-2">
          Designed for playful learning • System Domination
        </footer>
      </div>

      <Toast show={!!toast} message={toast} />

      {/* Challenge Modal */}
      <Modal
        open={!!activeChallenge}
        onClose={() => setChallengeFor(null)}
        title={
          activeChallenge
            ? `Challenge — ${SECTIONS.find((s) => s.id === activeChallenge.sectionId)?.name}`
            : "Challenge"
        }
      >
        {activeChallenge && (
          <div className="space-y-4">
            <Countdown key={timerKey} seconds={60} onDone={() => handleChallengeResult(false)} />
            <ChallengeCard
              challenge={{
                type: "mc",
                prompt: "Which system confirms enrollment status?",
                options: ["Salesforce", "Facets", "ShieldLink", "Outlook"],
                answerIndex: 1,
                explanation: "Facets shows eligibility & enrollment history.",
              }}
              onAnswer={(ok) => handleChallengeResult(ok)}
            />
          </div>
        )}
      </Modal>

      {/* Winner Modal */}
      <Modal open={phase === "finished"} onClose={() => setPhase("finished")} title="We have a winner!">
        {winnerTeam ? (
          <div className="text-center">
            <div className="mx-auto mb-3 h-3 w-20 rounded-full" style={{ background: winnerTeam.color }} />
            <p className="text-lg font-semibold text-white">{winnerTeam.name}</p>
            <p className="text-sm text-zinc-300">conquered all regions!</p>
            <div className="mt-4">
              <button onClick={resetGame} className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15">
                Play Again
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-zinc-300">Winner decided by total regions owned.</div>
        )}
      </Modal>
    </GameSurface>
  );
}
