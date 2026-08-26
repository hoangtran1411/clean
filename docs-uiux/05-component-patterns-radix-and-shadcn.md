# 05 - Component Design Patterns with Radix Primitives & shadcn/ui

Modern frontend engineering favors **Headless UI Primitives** (unstyled components handling keyboard focus, WAI-ARIA states, and screen readers) paired with utility-first styling systems.

---

## 1. Why shadcn/ui & Headless Primitives?

```
 Traditional Component Library (MUI / AntD):
 ❌ Ships monolithic JS/CSS bundles.
 ❌ Overriding styles requires heavy CSS specificity hacks (`!important`).
 ❌ Tied to package version lock-in.

 Modern shadcn/ui + Radix Approach:
 ✅ Copy-paste components directly into your `src/components/ui/` directory.
 ✅ Zero black-box abstraction: full ownership of component JSX and logic.
 ✅ Built upon Radix UI: 100% WAI-ARIA compliant, full keyboard navigation.
 ✅ Styled with Tailwind CSS & `cva` variants.
```

---

## 2. Safe Class Merging with `cn()`

When composing reusable components, standard string template literals cause Tailwind CSS class conflicts (e.g. `p-4` vs `p-2`). The `cn()` utility solves this by combining `clsx` (conditional logic) with `tailwind-merge` (resolving CSS cascade conflicts):

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Example Resolution:
// cn("px-4 py-2 bg-blue-500", "px-6 bg-red-500")
// ➔ Result: "py-2 px-6 bg-red-500" (Correctly removes px-4 and bg-blue-500!)
```

---

## 3. The Compound Component Pattern

Compound components allow parent and child elements to share implicit state while giving the developer full control over layout composition.

```tsx
// Consuming a Compound Dialog:
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Settings</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Account Settings</DialogTitle>
      <DialogDescription>Manage your profile preferences.</DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* Form Content */}
    </div>
    <DialogFooter>
      <Button type="submit">Save Changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 4. Polymorphic Components with Radix `Slot` (`asChild` Pattern)

The `asChild` prop allows a component to pass its behavior and props to its immediate child element without rendering an unnecessary wrapper tag (e.g. rendering a `<Button>` visually as a React Router `<Link>` or Next.js `<Link>` without invalid HTML `<button><a>...</a></button>` nesting):

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { buttonVariants, type ButtonProps } from "./button";
import { cn } from "@/lib/utils";

export interface ButtonExtendedProps extends ButtonProps {
  asChild?: boolean;
}

export const ButtonExtended = React.forwardRef<HTMLButtonElement, ButtonExtendedProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### Usage with Anchor / React Router Link:
```tsx
<ButtonExtended asChild variant="secondary">
  <a href="/dashboard">Go to Dashboard</a>
</ButtonExtended>
```
