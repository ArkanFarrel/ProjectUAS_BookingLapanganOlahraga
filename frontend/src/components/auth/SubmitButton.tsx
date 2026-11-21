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
      className="inline-flex w-full items-center justify-center rounded-md bg-open px-4 py-2.5 text-sm font-semibold text-panel hover:bg-enamel disabled:cursor-not-allowed disabled:bg-open/50"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  )
}
