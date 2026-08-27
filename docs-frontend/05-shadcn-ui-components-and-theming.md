# 05 - shadcn/ui Component Architecture & Design System

## 1. What makes shadcn/ui unique?

Unlike traditional component libraries (Material UI, Ant Design, Bootstrap) which are installed as bloated black-box npm packages, **shadcn/ui** is a design system approach:

- You **own the source code** directly in your project under `src/components/ui/`.
- Built on top of accessible Radix UI primitives.
- Styled using pure Tailwind CSS utility classes.
- Uses `class-variance-authority` (cva) to define clean, strongly typed variant props (`variant="destructive" size="sm"`).

---

## 2. The Anatomy of a shadcn Component (`Button.tsx`)

In [button.tsx](file:///C:/Users/Hoang/Desktop/clean/client/src/components/ui/button.tsx):

```typescript
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// 1. Define variants with CVA
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white shadow hover:bg-blue-700',
        destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
        outline: 'border border-slate-300 bg-white shadow-sm hover:bg-slate-100',
        secondary: 'bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200',
        ghost: 'hover:bg-slate-100 hover:text-slate-900',
        success: 'bg-emerald-600 text-white shadow hover:bg-emerald-700',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

// 2. Export ForwardRef Component
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

---

## 3. Composing UI with shadcn Primitives

```tsx
<Card className="shadow-md">
  <CardHeader>
    <CardTitle>Enterprise Product Catalog</CardTitle>
    <CardDescription>Manage inventory and pricing</CardDescription>
  </CardHeader>
  <CardContent>
    <Badge variant="success">Active</Badge>
    <Button variant="default" size="sm">
      <Plus className="h-4 w-4 mr-1" /> Add Product
    </Button>
  </CardContent>
</Card>
```
