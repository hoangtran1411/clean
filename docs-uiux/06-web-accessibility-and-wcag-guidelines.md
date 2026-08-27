# 06 - Web Accessibility (a11y) & WCAG 2.2 Guidelines

Web Accessibility (a11y) ensures digital products can be used by everyone, including people with visual, auditory, motor, or cognitive disabilities.

---

## 1. The 4 POUR Principles (WCAG 2.2 Foundation)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. PERCEIVABLE                                                              │
│ • Information and UI components must be presentable to users in ways they   │
│   can perceive (e.g. text alternatives `alt="..."`, adequate color contrast)│
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. OPERABLE                                                                 │
│ • UI components and navigation must be operable via keyboard alone.         │
│ • No keyboard traps, sufficient time to read, no flashing content (>3Hz).   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. UNDERSTANDABLE                                                           │
│ • Information and operation must be understandable (consistent navigation,  │
│   predictable input behaviors, clear error identification and suggestions). │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. ROBUST                                                                   │
│ • Content must be robust enough to be interpreted reliably by diverse user  │
│   agents, assistive technologies, and screen readers (Valid HTML & ARIA).   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ARIA Roles, States & Properties

> [!IMPORTANT]
> **First Rule of ARIA**: If you can use a native HTML element (e.g. `<button>`, `<dialog>`, `<nav>`, `<main>`, `<input type="checkbox">`), use it instead of recreating it with `<div role="button">`.

```tsx
// ❌ INACCESSIBLE: Div mimicking a button
<div onClick={handleClick} className="btn">
  Click Me
</div>

// ✅ 100% ACCESSIBLE NATIVE BUTTON:
<button
  type="button"
  onClick={handleClick}
  aria-expanded={isOpen}
  aria-controls="dropdown-menu-1"
  className="btn focus-visible:ring-2 focus-visible:ring-ring"
>
  Menu
</button>
```

---

## 3. Keyboard Navigation & Focus Management

```text
┌─────────────────────────┬────────────────────────────────────────────────────────────┐
│ Scenario                │ Proper Focus Behavior                                      │
├─────────────────────────┼────────────────────────────────────────────────────────────┤
│ Modal / Dialog Opens    │ 1. Trap focus inside modal (`Tab` cycles through modal).   │
│                         │ 2. Focus first interactive element or Close button.        │
│                         │ 3. Hitting `Escape` closes the modal.                      │
│ Modal / Dialog Closes   │ Return focus back to the button that triggered the modal.  │
│ Dropdown / Select       │ Arrow Up/Down navigates options; `Enter` selects option.   │
│ Focus Indicator         │ Never use `outline: none` without providing a visible      │
│                         │ `:focus-visible` ring!                                     │
└─────────────────────────┴────────────────────────────────────────────────────────────┘
```

---

## 4. Live Regions for Dynamic UI Updates (`aria-live`)

When content updates dynamically on screen (e.g. a shopping cart total updates or an error notification appears), sighted users notice visually, but screen readers require `aria-live`:

```tsx
// Politely announces changes after current speech finishes:
<div role="status" aria-live="polite" className="sr-only">
  {cartItemCount} items currently in cart
</div>

// Urgently announces errors immediately:
<div role="alert" aria-live="assertive" className="text-destructive">
  {errorMessage}
</div>
```
