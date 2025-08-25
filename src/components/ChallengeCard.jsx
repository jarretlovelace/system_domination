import { useState } from "react";

function ChallengeCard({ challenge, onAnswer }) {
const [choice, setChoice] = useState(null);
const isMC = challenge?.type === "mc";

return (
<div className="rounded-xl border p-4">
<p className="text-sm font-medium">{challenge.prompt}</p>
{isMC && (
<div className="mt-3 space-y-2">
{challenge.options.map((opt, i) => (
<label key={i} className="flex cursor-pointer items-center gap-2">
<input
type="radio"
name="mc"
className="h-4 w-4"
checked={choice === i}
onChange={() => setChoice(i)}
/>
<span className="text-sm">{opt}</span>
</label>
))}
</div>
)}
<div className="mt-4 flex justify-end gap-2">
<button
onClick={() => onAnswer(false)}
className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
>
Skip
</button>
<button
onClick={() => onAnswer(choice === challenge.answerIndex)}
className="rounded-lg bg-black px-3 py-1.5 text-sm text-white hover:opacity-90"
disabled={isMC && choice === null}
>
Submit
</button>
</div>
</div>
);
}
export default ChallengeCard;