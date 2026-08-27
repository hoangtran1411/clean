# 02 - Design Systems & Token Architecture (Tailwind CSS & CSS Variables)

A Design System is a single source of truth for design tokens, reusable UI components, and design guidelines, ensuring visual consistency and engineering velocity across multiple product teams.

---

## 1. Atomic Design Methodology

Created by Brad Frost, Atomic Design breaks UI hierarchy into 5 distinct levels:

```text
    [Atoms] ──► [Molecules] ──► [Organisms] ──► [Templates] ──► [Pages]
      │              │               │               │            │
   Button,        SearchBar       NavBar,       Page Layout    Production
   Input,         (Input +        ProductCard   Wireframe      Product Page
   Icon           Button)         (Image +      (Sidebar +     with Real Data
                                  Meta + CTA)   Main Grid)
```

---

## 2. The 3-Tier Design Token Hierarchy

Design tokens are the atomic visual parameters of a design system (colors, typography scales, spacing, border radii) stored as agnostic variables.

```text
 Tier 1: GLOBAL / RAW TOKENS (Brand Palette)
 ┌─────────────────────────────────────────────────────────────┐
 │ --blue-500: oklch(0.62 0.19 250);                          │
 │ --red-600:  oklch(0.55 0.22 25);                           │
 │ --gray-100: oklch(0.96 0.01 260);                          │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 Tier 2: SEMANTIC / ALIAS TOKENS (Contextual Intent)
 ┌──────────────────────────────▼──────────────────────────────┐
 │ --primary:     var(--blue-500);                             │
 │ --destructive: var(--red-600);                              │
 │ --muted:       var(--gray-100);                             │
 │ --background:  oklch(1 0 0);                                │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 Tier 3: COMPONENT TOKENS (Component-Specific)
 ┌──────────────────────────────▼──────────────────────────────┐
 │ --btn-primary-bg: var(--primary);                           │
 │ --btn-radius:     var(--radius);                            │
 └─────────────────────────────────────────────────────────────┘
```

---

## 3. CSS Custom Properties Architecture in Tailwind CSS v4

In modern React + Tailwind CSS setups, semantic variables are defined in the root stylesheet, enabling instant theme swaps (Light/Dark/Custom).

```css
@import "tailwindcss";

@layer base {
  :root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.14 0.01 260);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.14 0.01 260);
    
    --primary: oklch(0.55 0.22 260);
    --primary-foreground: oklch(0.98 0 0);
    
    --destructive: oklch(0.57 0.24 27);
    --destructive-foreground: oklch(0.98 0 0);
    
    --muted: oklch(0.96 0.01 260);
    --muted-foreground: oklch(0.55 0.02 260);
    
    --border: oklch(0.92 0.01 260);
    --ring: oklch(0.55 0.22 260);
    --radius: 0.5rem;
  }

  .dark {
    --background: oklch(0.14 0.01 260);
    --foreground: oklch(0.98 0 0);
    --card: oklch(0.18 0.01 260);
    --card-foreground: oklch(0.98 0 0);
    
    --primary: oklch(0.65 0.20 260);
    --primary-foreground: oklch(0.14 0.01 260);
    
    --destructive: oklch(0.62 0.22 27);
    --destructive-foreground: oklch(0.98 0 0);
    
    --muted: oklch(0.22 0.01 260);
    --muted-foreground: oklch(0.70 0.02 260);
    
    --border: oklch(0.26 0.01 260);
    --ring: oklch(0.65 0.20 260);
  }
}
```

---

## 4. Class Variance Authority (`cva`) & Component Architecture

`cva` provides a type-safe, declarative mechanism to define component variants with default settings and compound permutations:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
```
