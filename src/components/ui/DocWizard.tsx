import { type ReactNode } from 'react'
import { Stepper, type WizardStep } from './Stepper'
import { Button } from './Button'

export type { WizardStep }

interface DocWizardProps {
  steps: WizardStep[]
  current: number
  onStepChange: (index: number) => void
  canStepTo?: (index: number) => boolean
  title: string
  subtitle: string
  badge: ReactNode
  children: ReactNode
  onNext: () => void
  nextLabel: string
  backLabel?: string
  nextDisabled?: boolean
  onBack?: () => void
  footerExtra?: ReactNode
}

export function DocWizard({
  steps,
  current,
  onStepChange,
  canStepTo,
  title,
  subtitle,
  badge,
  children,
  onNext,
  nextLabel,
  backLabel = 'Back',
  nextDisabled = false,
  onBack,
  footerExtra,
}: DocWizardProps) {
  const handleBack = () => {
    if (current === 0) {
      onBack?.()
    } else {
      onStepChange(current - 1)
    }
  }

  return (
    <div className="page-enter">
      <header className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-[var(--color-text2)] mt-0.5">{subtitle}</p>
        </div>
        {badge}
      </header>

      <div className="surface px-4 sm:px-8 py-6 mb-6">
        <Stepper
          steps={steps}
          current={current}
          onSelect={onStepChange}
          canGoTo={canStepTo}
        />
      </div>

      <div className="max-w-3xl mx-auto">{children}</div>

      <footer className="mt-8 pt-5 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="md"
          onClick={handleBack}
          className={onBack || current > 0 ? '' : 'invisible'}
        >
          &larr; {backLabel}
        </Button>
        <div className="flex items-center gap-2">
          {footerExtra}
          <Button
            size="lg"
            onClick={onNext}
            disabled={nextDisabled}
          >
            {nextLabel} &rarr;
          </Button>
        </div>
      </footer>
    </div>
  )
}