export interface ValidationRule {
  test: (value: string) => boolean
  message: string
}

export const validators = {
  required: (label: string): ValidationRule => ({
    test: (v) => v.trim().length > 0,
    message: `${label} is required.`,
  }),

  email: (label = 'Email'): ValidationRule => ({
    test: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    message: `Invalid ${label.toLowerCase()} format.`,
  }),

  phone: (label = 'Phone'): ValidationRule => ({
    test: (v) => !v || /^[+]?[\d\s\-()]{7,20}$/.test(v),
    message: `Invalid ${label.toLowerCase()} format.`,
  }),

  minLength: (min: number, label: string): ValidationRule => ({
    test: (v) => v.trim().length >= min,
    message: `${label} must be at least ${min} characters.`,
  }),

  maxLength: (max: number, label: string): ValidationRule => ({
    test: (v) => v.length <= max,
    message: `${label} must be at most ${max} characters.`,
  }),

  numeric: (label: string): ValidationRule => ({
    test: (v) => !v || !isNaN(Number(v)),
    message: `${label} must be a number.`,
  }),

  positiveInt: (label: string): ValidationRule => ({
    test: (v) => !v || (Number.isInteger(Number(v)) && Number(v) > 0),
    message: `${label} must be a positive integer.`,
  }),
}

export function validate(value: string, ...rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    if (!rule.test(value)) return rule.message
  }
  return null
}
