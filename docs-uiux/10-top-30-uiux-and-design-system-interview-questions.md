# 10 - Top 30 UI/UX & Frontend Design System Interview Questions

A comprehensive technical collection of 30 UI/UX, Design Systems, and modern Frontend Engineering interview questions split across **Easy**, **Medium**, and **Advanced** levels.

---

## 🟢 Easy Level (Questions 1 - 10)

### 1. What is the fundamental difference between UI and UX?

- **UI (User Interface)** refers to the visual and interactive elements of a digital product—colors, typography, buttons, animations, and icons.
- **UX (User Experience)** encompasses the overall journey, usability, information architecture, and mental model of how effectively a user can achieve their goals with minimal friction.

### 2. What is the 8pt Spatial Grid system and why is it used?

The 8pt grid aligns all margins, paddings, dimensions, and gaps to multiples of 8 (with 4px half-steps for micro-alignment). It ensures visual rhythm, scales cleanly across high-density Retina and 4K displays, and eliminates arbitrary spacing decisions for developers.

### 3. What are Design Tokens?

Design tokens are the central, platform-agnostic variables representing raw design choices (e.g. hex colors, font scales, border radii, shadows). They allow synchronized styling across Web (CSS), iOS (SwiftUI), and Android (Compose).

### 4. What is the difference between WCAG AA and AAA contrast compliance?

- **WCAG AA (Industry Baseline)**: Requires a minimum contrast ratio of **$4.5:1$** for normal body text and **$3:1$** for large text ($\ge 18\text{pt}$ or $\ge 14\text{pt}$ bold) and UI components.
- **WCAG AAA (Enhanced)**: Requires a minimum contrast ratio of **$7:1$** for normal body text and **$4.5:1$** for large text.

### 5. Why should forms prefer a single-column layout over a multi-column layout?

Single-column layouts create a clear, vertical eye-tracking path. Multi-column forms introduce visual zigzagging, increase cognitive load, and frequently lead users to skip fields or misinterpret tab order.

### 6. What is the purpose of the `:focus-visible` pseudo-class?

`:focus-visible` displays focus indicator rings only when the user navigates via keyboard (or assistive tech), avoiding focus rings during mouse clicks while maintaining full accessibility for keyboard users.

### 7. What is Hick's Law?

Hick's Law states that the time it takes to make a decision increases logarithmically as the number and complexity of choices increase ($T = b \cdot \log_2(n + 1)$). It justifies simplifying menus, reducing form fields, and using progressive disclosure.

### 8. What is the `asChild` pattern in Radix UI?

The `asChild` prop enables polymorphic component composition using Radix `Slot`. It passes all accessibility attributes, event handlers, and styles directly to its immediate child element, preventing redundant HTML wrapper tags (e.g. `<button><a href="..."></a></button>`).

### 9. What is the 60-30-10 rule in UI color palette design?

A classic interior and UI design principle: 60% of the canvas should be the dominant neutral color (backgrounds/surfaces), 30% the secondary structure color (cards/borders/text), and 10% the accent color (primary action buttons/status badges).

### 10. What is Fitts's Law?

Fitts's Law states that the time required to reach a target is a function of the distance to the target and the target's size. Large buttons placed closer to the user's cursor or thumb reach zone are clicked faster with fewer errors.

---

## 🟡 Medium Level (Questions 11 - 20)

### 11. Why is the OKLCH color space preferred over HSL for modern UI theming?

HSL is not perceptually uniform: yellow at 50% lightness looks vastly brighter to human eyes than blue at 50% lightness. OKLCH aligns mathematical lightness directly with human visual perception, guaranteeing consistent contrast ratios across any chosen hue.

### 12. How does `cn()` (`clsx` + `tailwind-merge`) prevent Tailwind CSS class conflicts?

Standard string concatenation results in conflicting CSS classes where the stylesheet order takes precedence over the argument order (e.g. `"p-4 p-2"`). `tailwind-merge` understands Tailwind's utility cascade, correctly overriding earlier conflicting utility classes with later ones (`"p-2"`).

### 13. What is Atomic Design methodology?

Created by Brad Frost, it categorizes UI components into 5 hierarchical levels:

1. **Atoms**: Fundamental HTML tags and icons (Button, Input).
2. **Molecules**: Simple combinations of atoms (SearchBar = Input + Button).
3. **Organisms**: Complex interface sections (Header, ProductGrid).
4. **Templates**: Page-level wireframe layouts.
5. **Pages**: Fully populated templates with real data.

### 14. What is the difference between Skeleton screens and Loading Spinners in perceived performance?

Loading spinners draw focus to the wait duration, increasing perceived latency. Skeleton screens provide an immediate preview of the layout structure, reducing cognitive friction and eliminating Cumulative Layout Shift (CLS) when content loads.

### 15. What are the 4 POUR principles of WCAG?

1. **Perceivable**: Content presented in ways users can perceive (text alternatives, captions).
2. **Operable**: Interface usable via keyboard alone without timing traps.
3. **Understandable**: Clear text, predictable operation, intuitive error recovery.
4. **Robust**: Compatible with assistive technologies and modern browser user agents.

### 16. How should focus be managed in a Modal Dialog component?

1. Trap keyboard focus inside the modal while open (`Tab` / `Shift+Tab` cycles only modal elements).
2. Set initial focus to the first interactive input or close button.
3. Close on `Escape` key press.
4. Return focus back to the triggering element upon modal close.

### 17. What is Progressive Disclosure in UX?

Progressive disclosure defers advanced or rarely used features to secondary screens or expandable accordion panels. It keeps the primary interface simple and uncluttered for novice users while remaining accessible to power users.

### 18. What is the difference between `aria-live="polite"` and `aria-live="assertive"`?

- `aria-live="polite"`: Waits until the screen reader finishes speaking its current queue before announcing the dynamic update (e.g., search result count).
- `aria-live="assertive"`: Interrupts ongoing screen reader speech immediately to announce critical updates (e.g., payment failure alerts).

### 19. Why should you avoid pure black (`#000000`) in dark mode UI design?

Pure black creates harsh, high-contrast visual vibration against pure white text, causing eye fatigue. Using dark grays or slates (e.g. `oklch(0.14 0.01 260)`) allows layering surface elevations through subtle lighter gray tints.

### 20. What is Class Variance Authority (`cva`)?

`cva` is a type-safe library for defining component variants and compound styling permutations in TypeScript, automatically exporting typed props that integrate seamlessly with autocomplete in React components.

---

## 🔴 Advanced Level (Questions 21 - 30)

### 21. How do Container Queries (`@container`) differ from Media Queries (`@media`)?

Media queries evaluate the entire browser viewport width. Container queries evaluate the width of the component's immediate parent container, enabling reusable components (e.g. a `ProductCard`) to adapt their internal layout based on whether they are placed in a narrow sidebar or a wide main grid.

### 22. How do you implement Optimistic UI updates with TanStack Query?

In `useMutation`, define `onMutate`: cancel outgoing refetches, capture a snapshot of the current cache, update the cache synchronously with the anticipated new data, and return context. In `onError`, rollback the cache using the snapshot if the backend request fails.

### 23. What is the difference between Monomorphic, Compound, and Polymorphic component patterns?

- **Monomorphic**: A fixed component rendering a specific HTML tag with static props.
- **Compound**: A suite of coordinated components sharing implicit context (e.g. `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`).
- **Polymorphic**: A component that can dynamically swap its underlying rendered HTML element (e.g., `<Button asChild>` rendering an `<a>` tag).

### 24. How do you measure System Usability Scale (SUS) and what do the scores mean?

SUS consists of 10 alternating positive/negative statements evaluated on a 5-point Likert scale. Responses are normalized to calculate a composite score from 0 to 100. A score of **68** represents average usability; **80+** represents top-tier user experience.

### 25. How do you design an accessible autocomplete / Combobox component?

Use WAI-ARIA 1.2 Combobox pattern: an `<input>` with `role="combobox"`, `aria-expanded`, `aria-autocomplete="list"`, pointing to a `<ul>` with `role="listbox"`. Manage active item navigation via `aria-activedescendant` without losing input focus.

### 26. How do you handle `prefers-reduced-motion` in modern CSS animation architectures?

Query `@media (prefers-reduced-motion: reduce)` to clamp animation durations to `0.01ms` or disable transform/scaling translations, substituting subtle instantaneous opacity fades for users with vestibular disorders.

### 27. What is Cumulative Layout Shift (CLS) and how do UI/UX design decisions prevent it?

CLS measures unexpected layout movement during page loading. It is prevented by specifying explicit `aspect-ratio` or `width`/`height` attributes on images, reserving space with skeleton loaders, and avoiding injecting dynamic banners above existing content.

### 28. What is the Peak-End Rule and how do you leverage it in onboarding or checkout flows?

Users evaluate an entire experience based on the emotional peak and the final outcome. In checkout flows, eliminate friction during the payment peak and celebrate the final success state with visual affirmation (e.g., clear receipt summaries and celebratory animations).

### 29. How do you implement automated accessibility testing in CI/CD pipelines?

Integrate `@axe-core/playwright` or Cypress Axe into end-to-end test suites. Configure automated tests to scan rendered DOM snapshots on every pull request, failing builds if WCAG 2.2 Level AA violations are detected.

### 30. How do you design an extensible multi-brand Design System?

Structure design tokens into 3 tiers: Global Brand Tokens (Palette per brand) ➔ Semantic Token Aliases (`--primary`, `--background`) ➔ Component Token bindings. At runtime or build time, swap the CSS custom property dictionary based on the active brand tenant.
