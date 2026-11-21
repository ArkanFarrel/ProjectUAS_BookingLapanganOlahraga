type SubmitButtonProps = {
  pending: boolean
  idleLabel: string
  pendingLabel: string
}

export function SubmitButton({
  pending,
  idleLabel,
  pendingLabel,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-700/50"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  )
}
