function SystemNode({ idx, system, ownerTeam, teamsHere, onClick }) {
return (
<button
onClick={onClick}
className="relative grid h-24 w-24 place-items-center rounded-2xl border bg-white/90 p-2 shadow hover:shadow-md"
title={system.name}
aria-label={`System ${system.name}`}
style={{
borderColor: ownerTeam ? ownerTeam.color : "#e5e7eb",
boxShadow: ownerTeam
? `0 0 0 3px ${ownerTeam.color}55 inset, 0 10px 15px -3px rgb(0 0 0 / 0.1)`
: undefined,
}}
>
<div className="text-center">
<div className="text-xs font-semibold text-gray-500">{idx + 1}</div>
<div className="mt-1 text-[11px] font-semibold leading-tight">
{system.name}
</div>
</div>

{/* Tokens stacked at bottom-right */}
<div className="absolute bottom-1 right-1 flex -space-x-1">
{teamsHere.map((t) => (
<span
key={t.id}
className="inline-block h-4 w-4 rounded-full ring-2 ring-white"
style={{ backgroundColor: t.color }}
title={t.name}
/>
))}
</div>
</button>
);
}  
export default SystemNode; 