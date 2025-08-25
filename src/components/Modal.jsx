import React from "react";

function Modal({ open, onClose, title, children, actions }) {
if (!open) return null;
return (
<div className="fixed inset-0 z-50 flex items-center justify-center">
<div className="absolute inset-0 bg-black/50" onClick={onClose} />
<div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
<div className="mb-4 flex items-start justify-between">
<h3 className="text-lg font-semibold">{title}</h3>
<button
onClick={onClose}
className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
aria-label="Close"
>
✕
</button>
</div>
<div className="space-y-4">{children}</div>
{actions && <div className="mt-6 flex justify-end gap-2">{actions}</div>}
</div>
</div>
);
}
export default Modal;