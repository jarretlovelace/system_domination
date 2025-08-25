import SystemDomination from "./components/game/SystemDomination";
import TeamNameEditor from "./components/game/TeamNameEditor";

function App() {
  return (
    <div>
      <SystemDomination />
      <TeamNameEditor
        team={{ id: 1, name: "Team A", color: "red" }}
        onChange={(name) => console.log(name)}
      />
    </div>
  );
}
export default App;
