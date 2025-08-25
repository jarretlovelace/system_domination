function Badge({ color, children }) {
return (
<span
className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shadow"
style={{ backgroundColor: `${color}22`, color }}
>
<span
className="mr-1 h-2 w-2 rounded-full"
style={{ backgroundColor: color }}
/>
{children}
</span>
);
}
export default Badge;