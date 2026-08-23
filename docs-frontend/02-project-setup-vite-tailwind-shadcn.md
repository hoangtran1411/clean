# 02 - Project Setup with Vite, Tailwind CSS v4 & shadcn/ui Foundation

## 1. Initializing Vite with React 19 & TypeScript

To set up a lightning-fast React 19 application:

```powershell
npm create vite@latest client -- --template react-ts
cd client
npm install
```

---

## 2. Installing Tailwind CSS v4 & Dependencies

In modern Vite projects, Tailwind CSS v4 is integrated directly via `@tailwindcss/vite`:

```powershell
npm install tailwindcss @tailwindcss/vite
npm install clsx tailwind-merge class-variance-authority lucide-react
```

### Configuring `vite.config.ts`
In [vite.config.ts](file:///C:/Users/Hoang/Desktop/clean/client/vite.config.ts):
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```

---

## 3. Configuring the `cn()` Utility (The Heart of shadcn/ui)

In [utils.ts](file:///C:/Users/Hoang/Desktop/clean/client/src/lib/utils.ts):

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind classes and resolves class collisions (e.g. 'px-2' vs 'px-4')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Why `clsx` + `tailwind-merge`?
- `clsx`: Allows conditional classes like `cn('btn', isActive && 'btn-active')`.
- `tailwind-merge`: Resolves conflicting utility classes intelligently (e.g. `cn('p-4', 'p-2')` correctly outputs `'p-2'`).
