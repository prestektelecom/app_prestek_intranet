const PALETTE = [
  ['#4A9EF5', '#fff'],
  ['#FFB259', '#5C3A12'],
  ['#7FD4E8', '#1F5BA8'],
  ['#7FD8B8', '#0B4A2D'],
  ['#C7B8FF', '#2E1B6E'],
  ['#FFB8D1', '#7A1B45'],
  ['#A8D8A8', '#1A4A1A'],
  ['#F5A623', '#7A4A00'],
];

function hashName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function BentoAvatar({ name = '?', size = 32, color }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(s => s[0] || '')
    .join('')
    .toUpperCase();

  const pair = color || PALETTE[hashName(name) % PALETTE.length];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: pair[0],
        color: pair[1],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.36,
        letterSpacing: '0.02em',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {initials}
    </div>
  );
}
