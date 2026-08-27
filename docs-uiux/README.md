# UI/UX Engineering, Design Systems & Modern Frontend Design - Learning Path

Welcome to the comprehensive **UI/UX Engineering & Design Systems Curriculum** covering **Design Fundamentals & UX Heuristics**, **Design Systems & Token Architecture (Tailwind CSS v4 & OKLCH)**, **Typography & 8pt Spatial Grids**, **Color Theory & Dark Mode Theming**, **Component Architecture (Radix Primitives & shadcn/ui)**, **Web Accessibility (a11y & WCAG 2.2)**, **Micro-Interactions & Motion Design**, **High-Conversion Form UX**, **Usability Testing & UX Metrics**, and **Top 30 UI/UX Interview Questions**.

---

## 🎨 UI/UX Step-by-Step Learning Modules

1. [**01 - UI/UX Design Fundamentals & Core Usability Heuristics**](file:///C:/Users/Hoang/Desktop/clean/docs-uiux/01-uiux-design-fundamentals-and-heuristics.md)
   - UI (User Interface) vs. UX (User Experience)
   - Nielsen Norman 10 Usability Heuristics for Web & Mobile
   - UX Laws: Fitts's Law, Hick's Law, Miller's Law (7±2), Peak-End Rule
   - Gestalt Principles in UI Design (Proximity, Similarity, Continuity, Closure, Figure/Ground)

2. [**02 - Design Systems & Token Architecture (Tailwind CSS & CSS Variables)**](file:///C:/Users/Hoang/Desktop/clean/docs-uiux/02-design-systems-and-token-architecture.md)
   - Atomic Design Methodology: Atoms ➔ Molecules ➔ Organisms ➔ Templates ➔ Pages
   - 3-Tier Design Tokens: Global / Brand Tokens ➔ Semantic Tokens ➔ Component Tokens
   - CSS Custom Properties Architecture (`--background`, `--primary`, `--radius`, `--ring`)
   - Modern Tailwind CSS v4 `@theme` integration and zero-config token syncing

3. [**03 - Typography, Spatial Grids & Responsive Layout Systems**](file:///C:/Users/Hoang/Desktop/clean/docs-uiux/03-typography-spatial-grids-and-layouts.md)
   - Modular Typography Scales (Major Third 1.25, Perfect Fourth 1.333) & Fluid Typography (`clamp()`)
   - Leading (Line-Height), Tracking (Letter-Spacing), and Measure (Optimal 45-75 CPL)
   - The 8pt / 4pt Spatial Grid System for Consistent Padding, Margins, and Gaps
   - Modern Responsive Architecture: Flexbox vs. CSS Grid & Container Queries (`@container`)

4. [**04 - Color Theory, Palette Architecture & Dark Mode Theming**](file:///C:/Users/Hoang/Desktop/clean/docs-uiux/04-color-theory-palette-architecture-and-dark-mode.md)
   - Color Spaces: RGB vs. HSL vs. OKLCH (Perceptually Uniform Color Space)
   - The 60-30-10 Rule for Balanced UI Color Distribution
   - Flawless Dark / Light Mode Switching (`prefers-color-scheme`, class-based theme providers)
   - Color Contrast Ratios & WCAG 2.2 Compliance (AA $\ge 4.5:1$, AAA $\ge 7:1$)

5. [**05 - Component Design Patterns with Radix Primitives & shadcn/ui**](file:///C:/Users/Hoang/Desktop/clean/docs-uiux/05-component-patterns-radix-and-shadcn.md)
   - Headless UI Architecture: Radix UI Primitives (Unstyled, Accessible Logic) + Tailwind CSS
   - Class Variance Authority (`cva`) & Component Variant Management
   - The `cn()` Utility (`clsx` + `tailwind-merge`) for Collision-Safe Class Merging
   - Polymorphic Components with Radix `Slot` (`asChild` Pattern) & Compound Component Patterns

6. [**06 - Web Accessibility (a11y) & WCAG 2.2 Guidelines**](file:///C:/Users/Hoang/Desktop/clean/docs-uiux/06-web-accessibility-and-wcag-guidelines.md)
   - The 4 POUR Principles: Perceivable, Operable, Understandable, Robust
   - ARIA Roles, States, and Live Regions (`aria-live`, `aria-expanded`, `aria-describedby`)
   - Keyboard Navigation, Visible Focus Rings (`:focus-visible`), and Modal Focus Trapping
   - Screen Reader Testing & Automated CI/CD Auditing (Lighthouse, Axe-core)

7. [**07 - Micro-Interactions, Motion Design & Perceived Performance**](file:///C:/Users/Hoang/Desktop/clean/docs-uiux/07-micro-interactions-motion-and-perceived-performance.md)
   - The 4 Stages of a Micro-Interaction: Trigger ➔ Rules ➔ Feedback ➔ Loops/Modes
   - Easing Curves (Cubic-Bezier) & Physics-Based Spring Animations (Framer Motion)
   - Perceived Performance: Skeleton Shimmers vs. Spinners vs. Optimistic UI Updates
   - Motion Accessibility: Respecting `prefers-reduced-motion`

8. [**08 - High-Conversion Form UX & Error State Design**](file:///C:/Users/Hoang/Desktop/clean/docs-uiux/08-form-ux-validation-and-error-states.md)
   - Form Layout Heuristics: Single-Column vs. Multi-Column, Label Placement, and Visual Grouping
   - Inline Validation Timing: Real-Time vs. On Blur vs. On Submit
   - Actionable Error States, Non-Color Dependent Status Indicators, and Toast Notifications
   - Input Masking, Autofill Optimization, and Multi-Step Wizard Progress Indicators

9. [**09 - Usability Testing, User Research & Design Metrics**](file:///C:/Users/Hoang/Desktop/clean/docs-uiux/09-usability-testing-user-research-and-metrics.md)
   - Qualitative vs. Quantitative Research Methods (User Interviews, Card Sorting, Tree Testing)
   - Usability Testing: Moderated vs. Unmoderated, Think-Aloud Protocol
   - Core UX Metrics: System Usability Scale (SUS), Task Success Rate (TSR), Time on Task (ToT)
   - Heatmap Analytics (Hotjar / Microsoft Clarity) & A/B Testing Experiments

10. [**10 - Top 30 UI/UX & Frontend Design System Interview Questions**](file:///C:/Users/Hoang/Desktop/clean/docs-uiux/10-top-30-uiux-and-design-system-interview-questions.md)
    - 30 In-depth interview questions categorized into Easy, Medium, and Advanced levels covering design tokens, accessibility, layout algorithms, usability heuristics, and component engineering.

---

## 🎨 UI/UX Component & Token Architecture Overview

```text
                                  BRAND & DESIGN TOKENS
                     [Colors (OKLCH), Spacing (8pt), Typography, Radii]
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │  SEMANTIC CSS VARIABLES   │
                              │  - --background / --fg    │
                              │  - --primary / --accent   │
                              │  - --muted / --destructive│
                              └─────────────┬─────────────┘
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │     HEADLESS PRIMITIVES   │
                              │   (Radix UI / React Aria) │
                              │  - WAI-ARIA Attributes    │
                              │  - Focus Management       │
                              │  - Keyboard Navigation    │
                              └─────────────┬─────────────┘
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │   SHADCN / CVA VARIANTS   │
                              │  - Tailwind CSS v4        │
                              │  - cva(variants, sizes)   │
                              │  - cn() merge utility     │
                              └─────────────┬─────────────┘
                                            │
                                            ▼
                              ┌───────────────────────────┐
                              │  ACCESSIBLE UI COMPONENT  │
                              │  (Button, Dialog, Select) │
                              │  - Light/Dark Theming     │
                              │  - Micro-Interactions     │
                              │  - WCAG 2.2 Compliant     │
                              └───────────────────────────┘
```
