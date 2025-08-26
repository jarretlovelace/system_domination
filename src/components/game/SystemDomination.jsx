import React, { useMemo, useState, useEffect } from "react";
import Modal from "../Modal.jsx";
import ChallengeCard from "../ChallengeCard.jsx";

import CaliforniaSlicedBoard from "../game-ui/CaliforniaSlicedBoard.jsx";

import {
  GameSurface, GameHeader, Pane, TurnBanner, Stat, ScoreTile,
  ProgressTrack, Badge, DiceButton, Countdown, Toast
} from "../game-ui/GameUI.jsx";
import { Timer, Users, Trophy, Sparkles } from "lucide-react";

/* --------- EDIT YOUR SECTION NAMES HERE (12 max) --------- */
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

/* ---------------- TEAMS / COLORS ---------------- */
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
      color: base.color,     // hex used to color owned regions
      tone: base.tone,       // UI accent for ScoreTile
      position: 0,           // index (0..SECTIONS.length-1)
      owned: {},             // { sectionId: true }
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
  const [phase, setPhase] = useState("setup"); // setup | playing | finished
  const [teamCount, setTeamCount] = useState(4);
  const [teams, setTeams] = useState(defaultTeams(4));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [rolled, setRolled] = useState(null);
  const [activeChallenge, setChallengeFor] = useState(null); // { sectionId, defenderId }
  const [lastOutcome, setLastOutcome] = useState("");
  const [winnerId, setWinnerId] = useState(null);
  const [toast, setToast] = useState("");
  const [timerKey, setTimerKey] = useState(0);

  // { sectionId -> teamId }
  const ownersBySection = useMemo(() => {
    const m = {};
    teams.forEach((t) => Object.keys(t.owned).forEach((sid) => (m[sid] = t.id)));
    return m;
  }, [teams]);

  // { sectionId -> '#hex' } for board coloring
  const displayOwners = useMemo(() => {
    const map = {};
    Object.entries(ownersBySection).forEach(([sid, teamId]) => {
      const team = teams.find((t) => t.id === teamId);
      if (team) map[sid] = team.color;
    });
    return map;
  }, [ownersBySection, teams]);

  const currentTeam = teams[currentIdx];
  const winnerTeam = winnerId ? teams.find((t) => t.id === winnerId) : null;

  useEffect(() => {
    if (activeChallenge) setTimerKey((k) => k + 1); // reset countdown when opening a new challenge
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

  function startGame() {
    setPhase("playing");
  }

  function nextTurn() {
    setCurrentIdx((i) => (i + 1) % teams.length);
    setRolled(null);
  }

  /* ---------------- DICE / MOVEMENT ---------------- */
  function rollDie() {
    if (phase !== "playing" || rolled !== null) return;

    if (currentTeam.skip && currentTeam.skip > 0) {
      // consume skip
      setTeams((prev) =>
        prev.map((t, idx) => (idx === currentIdx ? { ...t, skip: t.skip - 1 } : t))
      );
      setLastOutcome(`${currentTeam.name} skips this turn due to an earlier event.`);
      setToast(`${currentTeam.name} skips this turn`);
      setTimeout(() => setToast(""), 900);
      return nextTurn();
    }

    const value = Math.floor(Math.random() * 4) + 1; // 1–4 for snappy pacing
    setRolled(value);

    const boardLen = SECTIONS.length;
    const newPos = (currentTeam.position + value) % boardLen;
    const section = SECTIONS[newPos];
    const ownerId = ownersBySection[section.id];

    // move token
    setTeams((prev) =>
      prev.map((t, idx) => (idx === currentIdx ? { ...t, position: newPos } : t))
    );

    // resolve space
    if (!ownerId) {
      setChallengeFor({ sectionId: section.id, defenderId: null });
    } else if (ownerId === currentTeam.id) {
      setTeams((prev) =>
        prev.map((t, idx) => (idx === currentIdx ? { ...t, points: t.points + 1 } : t))
      );
      setLastOutcome(`${currentTeam.name} landed on their own region — morale boost! (+1 pt)`);
      setToast(`+1 pt to ${currentTeam.name}`);
      setTimeout(() => setToast(""), 900);
      setTimeout(() => nextTurn(), 350);
    } else {
      setChallengeFor({ sectionId: section.id, defenderId: ownerId });
    }
  }

  /* ---------------- CHALLENGE RESULT ---------------- */
  function handleChallengeResult(ok) {
    const { sectionId, defenderId } = activeChallenge || {};
    if (!sectionId) {
      setChallengeFor(null);
      return nextTurn();
    }

    const sectionName = SECTIONS.find((s) => s.id === sectionId)?.name || "Region";
    const wasTakeover = !!defenderId;

    if (!ok) {
      // miss: -1, reset streak; if takeover attempt, +1 skip
      setTeams((prev) =>
        prev.map((t, idx) =>
          idx === currentIdx
            ? {
                ...t,
                points: Math.max(0, t.points - 1),
                streak: 0,
                skip: t.skip + (wasTakeover ? 1 : 0),
              }
            : t
        )
      );
      setLastOutcome(
        `${currentTeam.name} missed ${sectionName}. -1 point${
          wasTakeover ? " and skip next turn (failed takeover)" : ""
        }.`
      );
      setToast("Missed! -1 point");
      setTimeout(() => setToast(""), 900);
      setChallengeFor(null);
      return nextTurn();
    }

    // success
    setTeams((prev) => {
      const updated = prev.map((t, idx) => {
        if (wasTakeover && t.id === defenderId) {
          const { [sectionId]: _removed, ...rest } = t.owned;
          return { ...t, owned: rest, skip: t.skip + 1 };
        }
        if (idx === currentIdx) {
          const newOwned = { ...t.owned, [sectionId]: true };
          const newStreak = t.streak + 1;
          const base = 1, takeoverBonus = wasTakeover ? 1 : 0, streakBonus = newStreak >= 3 ? 1 : 0;
          return { ...t, owned: newOwned, points: t.points + base + takeoverBonus + streakBonus, streak: newStreak };
        }
        return t;
      });

      const me = updated[currentIdx];
      if (Object.keys(me.owned).length === SECTIONS.length) {
        setWinnerId(me.id);
        setPhase("finished");
      }
      return updated;
    });

    setLastOutcome(
      wasTakeover
        ? `${currentTeam.name} captured ${sectionName}! (+1 base, +1 takeover${currentTeam.streak + 1 >= 3 ? ", +1 streak" : ""})`
        : `${currentTeam.name} claimed ${sectionName}! (+1 base${currentTeam.streak + 1 >= 3 ? ", +1 streak" : ""})`
    );
    setToast("Captured!");
    setTimeout(() => setToast(""), 900);

    setChallengeFor(null);
    nextTurn();
  }
console.log("UI imports", {
  CaliforniaSlicedBoard,
  GameSurface, GameHeader, Pane, TurnBanner, Stat, ScoreTile,
  ProgressTrack, Badge, DiceButton, Countdown, Toast
});
  /* ---------------- RENDER ---------------- */
  return (
    <GameSurface>
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12 space-y-8">
        <GameHeader
          title="System Domination — California Map"
          subtitle="Compete in teams, conquer quests, and master BSC systems through fast rounds, dice rolls, and challenge cards."
        />

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <TurnBanner team={currentTeam.name} />

          <Pane>
            <div className="grid grid-cols-3 gap-5">
              <Stat icon={Timer} label="Round Timer" value="60s" tone="cyan" />
              <Stat icon={Users} label="Teams" value={teams.length} tone="emerald" />
              <Stat icon={Trophy} label="Goal" value={`${SECTIONS.length} systems`} tone="amber" />
            </div>
          </Pane>

          <Pane className="flex items-center justify-between gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
              {teams.map((t) => (
                <ScoreTile key={t.id} team={t.name} score={t.points} tone={t.tone} />
              ))}
            </div>
            <div className="hidden md:block w-px h-14 bg-white/10" />
            <div className="space-y-2 min-w-[160px]">
              <div className="text-xs text-zinc-400">Progress</div>
              <ProgressTrack
                steps={10}
                value={Math.round(((currentTeam.position + 1) / SECTIONS.length) * 10)}
              />
              <div className="text-xs text-zinc-400">
                {currentTeam.position + 1} / {SECTIONS.length}
              </div>
            </div>
          </Pane>
        </div>

        {/* Middle: Map board + Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* California Map Board */}
         {CaliforniaSlicedBoard ? (
  <CaliforniaSlicedBoard
    sections={SECTIONS}
    owners={displayOwners}
    onSectionClick={(sec) => {
      if (phase !== "playing") return;
      const defenderId = ownersBySection[sec.id] || null;
      setChallengeFor({ sectionId: sec.id, defenderId });
    }}
  />
) : (
  <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-rose-300">
    CaliforniaSlicedBoard failed to load (check default export & import path).
  </div>
)}

          {/* Actions / Controls */}
          <Pane className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <ColorBadge hex={currentTeam.color}>{currentTeam.name}</ColorBadge>
                <span className="text-sm text-zinc-300">
                  Position: {currentTeam.position + 1} / {SECTIONS.length}
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
                      setCurrentIdx(0);           // reset turn
                      setRolled(null);            // clear last roll
                      setLastOutcome("");         // clear status text
                      setPhase("setup");          // back to setup so you can start again
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
                {phase !== "playing" ? (
                  <button
                    className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15"
                    onClick={startGame}
                  >
                    Start
                  </button>
                ) : (
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
            <Countdown
              key={timerKey}
              seconds={60}
              onDone={() => handleChallengeResult(false)}
            />
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
      <Modal
        open={phase === "finished"}
        onClose={() => setPhase("finished")}
        title="We have a winner!"
      >
        {winnerTeam ? (
          <div className="text-center">
            <div
              className="mx-auto mb-3 h-3 w-20 rounded-full"
              style={{ background: winnerTeam.color }}
            />
            <p className="text-lg font-semibold text-white">{winnerTeam.name}</p>
            <p className="text-sm text-zinc-300">conquered all regions!</p>
            <div className="mt-4">
              <button
              onClick={resetGame}
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15"
              >
                Play Again
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-zinc-300">
            Winner decided by total regions owned.
          </div>
        )}
      </Modal>
    </GameSurface>
  );
}
