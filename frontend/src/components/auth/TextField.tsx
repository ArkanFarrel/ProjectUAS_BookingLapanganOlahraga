import type { InputHTMLAttributes } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

type TextFieldProps = {
  id: string
  label: string
  registration: UseFormRegisterReturn
  error?: string
  hint?: string
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'autoComplete' | 'inputMode'
>

export function TextField({
  id,
  label,
  registration,
  error,
  hint,
  type = 'text',
  autoComplete,
  inputMode,
}: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-900">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-500 focus:border-emerald-700 aria-invalid:border-red-700"
        {...registration}
      />
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-slate-600">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}
