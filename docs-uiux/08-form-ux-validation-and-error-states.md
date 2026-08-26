# 08 - High-Conversion Form UX & Error State Design

Forms are the primary conversion engine in digital products. Poor form design leads to abandonment, user frustration, and data entry errors.

---

## 1. Form Layout Best Practices

```
┌─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐
│ ❌ POOR FORM DESIGN                                         │ ✅ HIGH-CONVERSION FORM DESIGN                              │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ • Multi-column layouts (confuses eye-tracking path).        │ • Single-column vertical path (predictable flow).           │
│ • Placeholder text used instead of labels.                  │ • Top-aligned visible labels with helper text.              │
│ • Ambiguous "Submit" buttons.                               │ • Action-oriented button text ("Create Account", "Pay $49") │
│ • Validating immediately while user is still typing.        │ • Reward early, validate on blur, re-validate on submit.    │
└─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 2. Validation Timing Matrix

```
┌────────────────────┬──────────────────────────────────┬─────────────────────────────────────┐
│ Validation Timing  │ Mechanism                        │ Best Use Case                       │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ 1. Immediate       │ As each key is pressed           │ Password strength meter, character  │
│    (Real-time)     │ (`onChange`).                    │ countdown counters (`50/200 chars`).│
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ 2. On Blur         │ When user finishes field and     │ Email format check, username        │
│    (Focus Lost)    │ moves to next (`onBlur`).        │ availability check.                 │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ 3. On Submit       │ When form submit button is       │ Full form cross-field validation,   │
│                    │ clicked.                         │ server-side validation responses.   │
└────────────────────┴──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 3. Accessible Error State Anatomy

Never rely solely on red border colors to signal errors, as colorblind users cannot perceive red/green distinctions:

```
  Label: Email Address *
 ┌─────────────────────────────────────────────────────────────┐
 │ user@invalid                                          [ ⚠️ ]│ ──► Red border + Error icon
 └─────────────────────────────────────────────────────────────┘
   ❌ Please enter a valid email address (e.g. name@domain.com)    ──► Actionable inline text
```

### Accessible Form Field Component:
```tsx
interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormField({ id, label, error, helperText, value, onChange }: FormFieldProps) {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
        {label}
      </label>

      <input
        id={id}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
          error
            ? "border-destructive focus-visible:ring-destructive"
            : "border-input focus-visible:ring-ring"
        )}
      />

      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
```
