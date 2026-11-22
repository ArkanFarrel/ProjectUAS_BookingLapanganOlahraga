import { Goal } from 'lucide-react'
import { Link } from 'react-router-dom'

export function SiteBrand({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex shrink-0 items-center gap-2.5 font-display text-lg font-semibold text-primary">
      <span className="grid size-8 place-items-center rounded-md bg-primary text-on-primary">
        <Goal size={19} aria-hidden="true" />
      </span>
      SportsCourt
    </Link>
  )
}
