import React, { useMemo, useState } from "react";
import Modal from "../Modal";                 // adjust if needed
import ChallengeCard from "../ChallengeCard"; // adjust if needed
import { SYSTEMS } from "../data/systems";    // adjust if needed
import TeamNameEditor from "./TeamNameEditor"; // (unused here yet)

// ---------- helpers ----------
const TEAM_COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b", "#a855f7", "#14b8a6"];

const defaultTeams = (count = 4) =>
  Array.from({ length: count }).map((_, i) => ({
    id: `team-${i + 1}`,
    name: `Team ${i + 1}`,
    color: TEAM_COLORS[i % TEAM_COLORS.length],
    position: 0,   // board index if you add movement later
    owned: {},     // { [systemId]: true }
    points: 0,
    streak: 0,
    skip: 0,
  }));

function SystemDomination() {
  // challenge the UI is currently showing
  const [activeChallenge, setChallengeFor] = useState(null); // { systemId, defenderId? }
  const [phase, setPhase] = useState("setup");
  const [winnerTeam, setWinnerTeam] = useState(null);

  // ---- added game state ----
  const [teams, setTeams] = useState(defaultTeams(4));
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentTeam = teams[currentIdx];
  const [lastOutcome, setLastOutcome] = useState("");

  // who owns what (systemId -> teamId)
  const owners = useMemo(() => {
    const map = {};
    teams.forEach((t) => Object.keys(t.owned || {}).forEach((sid) => (map[sid] = t.id)));
    return map;
  }, [teams]);

  const nextTurn = () => setCurrentIdx((i) => (i + 1) % teams.length);

  // ---------- your requested logic ----------
  function handleChallengeResult(correct) {
    const { systemId, defenderId } = activeChallenge || {};
    if (!systemId) {
      setChallengeFor(null);
      return nextTurn();
    }

    const systemName = SYSTEMS.find((s) => s.id === systemId)?.name || "System";
    const wasTakeover = !!defenderId;

    if (!correct) {
      // Miss: -1 point (floor at 0). If it was a takeover attempt, add a skip turn.
      setTeams((prev) =>
        prev.map((t, idx) =>
          idx === currentIdx
            ? {
                ...t,
                points: Math.max(0, (t.points ?? 0) - 1),
                streak: 0,
                skip: (t.skip ?? 0) + (wasTakeover ? 1 : 0),
              }
            : t
        )
      );

      setLastOutcome(
        `${currentTeam.name} missed ${systemName}. -1 point${
          wasTakeover ? " and skip next turn (failed takeover)" : ""
        }.`
      );
      setChallengeFor(null);
      return nextTurn();
    }

    // Correct: claim or takeover with bonuses
    setTeams((prev) => {
      const updated = prev.map((t, idx) => {
        // If stealing, remove from defender & give them a 1-turn cooldown
        if (wasTakeover && t.id === defenderId) {
          const { [systemId]: _removed, ...rest } = t.owned;
          return { ...t, owned: rest, skip: (t.skip ?? 0) + 1 };
        }

        // Award to current team
        if (idx === currentIdx) {
          const newOwned = { ...t.owned, [systemId]: true };
          const newStreak = (t.streak ?? 0) + 1;

          const base = 1;
          const takeoverBonus = wasTakeover ? 1 : 0;
          const streakBonus = newStreak >= 3 ? 1 : 0; // hot-hand bonus

          return {
            ...t,
            owned: newOwned,
            points: (t.points ?? 0) + base + takeoverBonus + streakBonus,
            streak: newStreak,
          };
        }

        return t;
      });

      // Win check for current team after update
      const me = updated[currentIdx];
      if (Object.keys(me.owned).length === SYSTEMS.length) {
        setWinnerTeam(me);
        setPhase("finished");
      }

      return updated;
    });

    setLastOutcome(
      wasTakeover
        ? `${currentTeam.name} stole ${systemName}! (+1 base, +1 takeover${
            (currentTeam.streak ?? 0) + 1 >= 3 ? ", +1 streak" : ""
          })`
        : `${currentTeam.name} claimed ${systemName}! (+1 base${
            (currentTeam.streak ?? 0) + 1 >= 3 ? ", +1 streak" : ""
          })`
    );

    setChallengeFor(null);
    nextTurn();
  }

  const resetGame = () => {
    setPhase("setup");
    setWinnerTeam(null);
    setChallengeFor(null);
    setCurrentIdx(0);
    setTeams(defaultTeams(4));
    setLastOutcome("");
  };

  return (
    <div>
      <ol>
        <li>Unowned system → answer challenge to claim.</li>
        <li>Owned by you → draw a Life Event.</li>
        <li>Owned by another → battle for takeover (answer to steal).</li>
        <li>First team to own all 12 wins. Tie-breaker: total points.</li>
      </ol>

      {lastOutcome && (
        <div className="my-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          {lastOutcome}
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow">
        <h3 className="mb-2 text-sm font-semibold">Facilitator Shortcuts</h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
          <li>Click a System node to trigger a challenge manually.</li>
          <li>Use Reset to restart from setup.</li>
          <li>Rename teams during setup to match table groups.</li>
        </ul>
      </div>

      {/* Challenge Modal */}
      <Modal
        open={!!activeChallenge}
        onClose={() => setChallengeFor(null)}
        title={
          activeChallenge
            ? `Challenge — ${
                SYSTEMS.find((s) => s.id === activeChallenge.systemId)?.name
              }`
            : "Challenge"
        }
        actions={null}
      >
        {activeChallenge && (
          <ChallengeCard
            challenge={activeChallenge}
            onAnswer={(ok) => handleChallengeResult(ok)}
          />
        )}
        {activeChallenge?.explanation && (
          <p className="text-xs text-gray-500">
            Hint: {activeChallenge.explanation}
          </p>
        )}
      </Modal>

      {/* Winner Modal */}
      <Modal
        open={phase === "finished"}
        onClose={() => setPhase("finished")}
        title="We have a winner!"
        actions={[
          <button
            key="again"
            onClick={resetGame}
            className="rounded-lg bg-black px-3 py-1.5 text-sm text-white hover:opacity-90"
          >
            Play Again
          </button>,
        ]}
      >
        {winnerTeam ? (
          <div className="text-center">
            <div
              className="mx-auto mb-3 h-3 w-20 rounded-full"
              style={{ background: winnerTeam.color }}
            />
            <p className="text-lg font-semibold">{winnerTeam.name}</p>
            <p className="text-sm text-gray-600">conquered all systems!</p>
          </div>
        ) : (
          <p className="text-sm">Winner decided by total systems owned.</p>
        )}
      </Modal>
    </div>
  );
}

export default SystemDomination;
