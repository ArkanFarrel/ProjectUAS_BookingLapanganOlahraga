// Gambar pengganti kalau venue belum punya foto. Hanya garis lapangan, tanpa orang.
export function CourtArt({ name, className = '' }: { name: string; className?: string }) {
  const hue = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 3
  const line = hue === 0 ? '#f4efe4' : hue === 1 ? '#f3d48a' : '#b7e4c7'

  return (
    <svg viewBox="0 0 320 180" className={className} role="img" aria-label={`Gambar garis lapangan untuk ${name}`}>
      <rect width="320" height="180" fill="#143028" />
      <rect x="18" y="16" width="284" height="148" fill="none" stroke={line} strokeWidth="3" />
      <line x1="160" y1="16" x2="160" y2="164" stroke={line} strokeWidth="2" />
      <rect x="18" y="48" width="70" height="84" fill="none" stroke={line} strokeWidth="2" />
      <rect x="232" y="48" width="70" height="84" fill="none" stroke={line} strokeWidth="2" />
      <circle cx="160" cy="90" r="16" fill="none" stroke={line} strokeWidth="2" />
    </svg>
  )
}
