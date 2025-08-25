import React, { useState } from "react";

function TeamNameEditor({ team, onChange }) {
  const [val, setVal] = useState(team.name);

  return (
    <label className="text-sm">
      Team Name
      <input
        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onChange(val.trim() || team.name)}
      />
      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: team.color }}
        />
        ID: {team.id}
      </div>
    </label>
  );
}

export default TeamNameEditor;
