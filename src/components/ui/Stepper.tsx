import { Svg } from '@/icons'
import { CheckIcon } from '@/icons'

export interface WizardStep {
  key: string
  label: string
  icon: string
}

interface StepperProps {
  steps: WizardStep[]
  current: number
  onSelect?: (index: number) => void
  canGoTo?: (index: number) => boolean
}

export function Stepper({ steps, current, onSelect, canGoTo }: StepperProps) {
  if (steps.length === 0) return null

  const progress = (current / (steps.length - 1)) * 100

  return (
    <nav
      className="relative"
      aria-label="Progress"
    >
      {/* Track */}
      <div className="absolute top-5 left-4 right-4 h-1 rounded-full bg-[var(--color-border)]" />
      <div
        className="absolute top-5 h-1 rounded-full bg-[var(--color-primary)] transition-all duration-300 ease-out"
        style={{ left: '1rem', width: `calc((100% - 2rem) * ${progress / 100})` }}
      />

      <ol className="relative flex justify-between">
        {steps.map((step, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo'
          const clickable = canGoTo ? canGoTo(i) : i < current
          return (
            <li key={step.key} className="flex-1 min-w-0">
              <button
                type="button"
                onClick={(e) => { if (clickable && onSelect) { e.preventDefault(); onSelect(i) } }}
                disabled={!clickable}
                tabIndex={clickable ? 0 : -1}
                aria-current={state === 'current' ? 'step' : undefined}
                className={`flex flex-col items-center gap-1.5 w-full px-1 ${
                  clickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 border-2 ${
                    state === 'done'
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                      : state === 'current'
                        ? 'bg-[var(--color-card)] border-[var(--color-primary)] text-[var(--color-primary)] shadow-[0_0_0_4px_var(--color-primary-ring)]'
                        : 'bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-text3)]'
                  }`}
                >
                  {state === 'done' ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    step.icon ? <Svg name={step.icon} className="w-4 h-4" /> : i + 1
                  )}
                </span>
                <span
                  className={`text-[11px] font-semibold whitespace-nowrap ${
                    i === current ? 'text-[var(--color-text)]' : 'text-[var(--color-text3)]'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}