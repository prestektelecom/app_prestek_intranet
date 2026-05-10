const PALETTE = [
    'bg-rose-500',     'bg-pink-500',    'bg-fuchsia-500',
    'bg-purple-500',   'bg-violet-500',  'bg-indigo-500',
    'bg-blue-500',     'bg-sky-500',     'bg-cyan-500',
    'bg-teal-500',     'bg-emerald-500', 'bg-green-500',
    'bg-lime-500',     'bg-amber-500',   'bg-orange-500',
];

function hashName(name = '') {
    let h = 0;
    for (let i = 0; i < name.length; i++) {
        h = (h * 31 + name.charCodeAt(i)) >>> 0;
    }
    return h % PALETTE.length;
}

function initials(name = '') {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function InitialsAvatar({ name = '', className = '' }) {
    const color = PALETTE[hashName(name)];
    return (
        <div className={`flex items-center justify-center font-bold text-white select-none ${color} ${className}`}
            aria-label={name}>
            {initials(name)}
        </div>
    );
}
