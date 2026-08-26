# 03 - Typography, Spatial Grids & Responsive Layout Systems

Typography and spatial systems form the foundational grid of visual communication. Clear hierarchy, consistent spacing, and fluid responsiveness establish harmony and effortless readability.

---

## 1. Modular Typography Scales

Rather than picking arbitrary font sizes, design systems use mathematical scale ratios to ensure harmonious progression from caption to display titles.

```
 Common Modular Ratios:
 • Major Second (1.125): Subtle, ideal for dense desktop dashboards.
 • Major Third  (1.250): Balanced, standard for web applications (Tailwind default).
 • Perfect Fourth (1.333): Expressive, great for editorial and marketing sites.
 • Golden Ratio (1.618): High drama, large contrast between headings.
```

| Element | Scale Step | Size (Major Third - 1.25) | Line Height (Leading) | Font Weight |
| :--- | :--- | :--- | :--- | :--- |
| **Display / H1** | $16 \times 1.25^4$ | ~`38px` (`2.375rem`) | `1.15` (`leading-tight`) | `Bold (700)` |
| **Heading 2** | $16 \times 1.25^3$ | ~`30px` (`1.875rem`) | `1.2` (`leading-snug`) | `SemiBold (600)` |
| **Heading 3** | $16 \times 1.25^2$ | ~`24px` (`1.5rem`) | `1.3` | `SemiBold (600)` |
| **Body (Base)** | $16 \times 1.25^0$ | `16px` (`1rem`) | `1.5` (`leading-relaxed`)| `Regular (400)` |
| **Caption / Small**| $16 \div 1.25^1$ | `13px` (`0.8125rem`)| `1.4` | `Medium (500)` |

---

## 2. The 3 Core Rules of Typography

1. **Measure (Line Length)**: Optimal readability is between **45 to 75 characters per line (CPL)**. In Tailwind, enforce this using `max-w-prose` (approx 65ch).
2. **Leading (Line Height)**: Body text requires larger line height (`1.5` to `1.6`) for eye tracking across lines. Display headings require tighter line height (`1.1` to `1.2`) to prevent awkward gaps.
3. **Tracking (Letter Spacing)**: Large display headings look tighter with negative tracking (`tracking-tight`), while uppercase small captions require expanded tracking (`tracking-wider text-xs uppercase`).

---

## 3. The 8pt / 4pt Spatial Grid System

All margins, paddings, gaps, and component dimensions must be multiples of **8px** (with **4px** half-steps for micro-alignments like icons and badge padding).

```
   ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
   │ 4px │ 8px │12px │16px │24px │32px │48px │64px │
   │ 0.5 │  1  │ 1.5 │  2  │  3  │  4  │  6  │  8  │ (Tailwind Units: rem * 4)
   └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
```

### Why the 8pt Grid Works:
- Most modern screen resolutions (1080p, 1440p, 4K, Retina) scale cleanly by factors of 8.
- Eliminates developer guesswork when choosing spacing (`gap-2` = 8px, `gap-4` = 16px, `gap-6` = 24px).

---

## 4. Modern Responsive Layouts: Grid, Flexbox & Container Queries

```
┌─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐
│ CSS GRID (2-Dimensional Layouts)                            │ CONTAINER QUERIES (`@container`)                            │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ Ideal for Page Layouts, Dashboards, and Product Grids:      │ Components adapt based on THEIR OWN width, not viewport:    │
│                                                             │                                                             │
│ ```html                                                     │ ```html                                                     │
│ <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 │ <div class="@container">                                    │
│             gap-6">                                         │   <div class="flex flex-col @md:flex-row gap-4">        │
│   <ProductCard />                                           │     <img class="w-full @md:w-32" />                         │
│ </div>                                                      │   </div>                                                    │
│ ```                                                         │ </div>                                                      │
│                                                             │ ```                                                         │
└─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```
