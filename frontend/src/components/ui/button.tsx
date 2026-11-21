import { cn } from '@/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'open' | 'lamp' | 'ghost' | 'line'
}

const tones: Record<NonNullable<ButtonProps['tone']>, string> = {
  open: 'bg-open text-panel hover:bg-enamel disabled:bg-open/50',
  lamp: 'bg-lamp text-ink hover:bg-wait-soft disabled:opacity-60',
  ghost: 'bg-transparent text-paper hover:bg-enamel-2',
  line: 'border border-line bg-panel text-ink hover:bg-paper disabled:opacity-50',
}

export function Button({ tone = 'open', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
