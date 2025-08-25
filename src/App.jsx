// src/App.jsx
import SystemDomination from "./components/game/SystemDomination.jsx";
import TeamNameEditor from "./components/game/TeamNameEditor.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      <SystemDomination />

      {/* Demo of TeamNameEditor — remove if not needed */}
      <div className="p-4">
        <TeamNameEditor
          team={{ id: "team-demo", name: "Team A", color: "#ef4444" }}
          onChange={(name) => console.log("New team name:", name)}
        />
      </div>
    </div>
  );
}
