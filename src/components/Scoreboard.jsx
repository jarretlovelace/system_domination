function Scoreboard({ teams, systems }) {
return (
<div className="rounded-2xl bg-white p-4 shadow">
<h3 className="mb-3 text-sm font-semibold">Scoreboard</h3>
<ul className="space-y-2">
{teams.map((t) => {
const ownedCount = Object.keys(t.owned).length;
return (
<li key={t.id} className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span
className="inline-block h-2.5 w-2.5 rounded-full"
style={{ backgroundColor: t.color }}
/>
<span className="text-sm font-medium">{t.name}</span>
<Badge color={t.color}>Pts: {t.points ?? 0}</Badge>
{t.skip > 0 && (
<span className="text-xs text-gray-500">(skip {t.skip})</span>
)}
</div>
<div className="text-sm text-gray-700">
{ownedCount}/{systems.length} systems
</div>
</li>
);
})}
</ul>
</div>
);
}
export default Scoreboard;