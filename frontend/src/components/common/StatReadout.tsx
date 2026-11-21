export function StatReadout({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="min-w-28">
      <p className="font-display text-4xl leading-none text-lamp tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-paper/80">{label}</p>
    </div>
  )
}
