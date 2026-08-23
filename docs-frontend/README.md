# React 19, Tailwind CSS, shadcn/ui, Axios & TanStack Query - Frontend Path

Welcome to the frontend learning curriculum demonstrating **React 19**, **Tailwind CSS v4**, **shadcn/ui**, **Axios with JWT Refresh Token Rotation**, **TanStack Query v5**, **Career Roadmap**, **Interview Preparation**, and full-stack integration with our **.NET 10 Clean Architecture API**.

---

## 📚 Frontend Step-by-Step Learning Modules

1. [**01 - React 19 & Tech Stack Overview**](file:///C:/Users/Hoang/Desktop/clean/docs-frontend/01-react19-and-techstack-overview.md)
   - Architecture overview
   - React 19, Tailwind CSS v4, shadcn/ui, TanStack Query, Axios
   - Running the Vite client application

2. [**02 - Project Setup with Vite, Tailwind CSS v4 & shadcn/ui**](file:///C:/Users/Hoang/Desktop/clean/docs-frontend/02-project-setup-vite-tailwind-shadcn.md)
   - Scaffolding Vite + React 19 + TypeScript
   - Configuring `@tailwindcss/vite` and CSS variables
   - Setting up the `cn()` utility (`clsx` + `tailwind-merge`)

3. [**03 - Axios Interceptors, Bearer Tokens & 401 Refresh Token Rotation**](file:///C:/Users/Hoang/Desktop/clean/docs-frontend/03-axios-interceptors-and-jwt-token-refresh.md)
   - Auto-injecting `Authorization: Bearer <token>` and `X-Correlation-ID`
   - Catching 401 Unauthorized errors and triggering automatic Refresh Token Rotation
   - Failed request queueing and replay mechanisms

4. [**04 - TanStack Query v5 Mastery (Server State, Caching & Invalidation)**](file:///C:/Users/Hoang/Desktop/clean/docs-frontend/04-tanstack-query-mastery.md)
   - Query client configuration (`staleTime`, `refetchOnWindowFocus`)
   - Data fetching with `useQuery`
   - Mutations and automatic cache invalidation with `useMutation` and `queryClient.invalidateQueries`

5. [**05 - shadcn/ui Component Architecture & Design System**](file:///C:/Users/Hoang/Desktop/clean/docs-frontend/05-shadcn-ui-components-and-theming.md)
   - Why shadcn/ui is a design system (not a component library)
   - ForwardRef components and `class-variance-authority` (cva)
   - Building reusable Buttons, Cards, Badges, and Inputs

6. [**06 - Full-Stack Integration: Identity, Idempotency & EPPlus Excel in React**](file:///C:/Users/Hoang/Desktop/clean/docs-frontend/06-complete-crud-and-excel-integration.md)
   - Downloading binary `.xlsx` spreadsheets with Axios blobs
   - Multipart/form-data Excel file uploads
   - Frontend handling of `Idempotency-Key` headers and cache hits

7. [**07 - Career & Technical Roadmap for a Modern Frontend Developer**](file:///C:/Users/Hoang/Desktop/clean/docs-frontend/07-career-roadmap-for-frontend-developer.md)
   - Junior ➔ Mid ➔ Senior mindset shift
   - The 6 Core Knowledge Pillars (JS Internals, React 19, TanStack Server State, Core Web Vitals, Design Systems, Security)
   - Portfolio projects and recommended engineering books

8. [**08 - Top 30 Modern Frontend & React Interview Questions (Easy, Medium, Advanced)**](file:///C:/Users/Hoang/Desktop/clean/docs-frontend/08-top-30-frontend-interview-questions.md)
   - 10 Foundational / Junior questions (Closures, Keys, Flexbox vs Grid, Event Bubbling, Promises)
   - 10 Intermediate / Mid-level questions (React 19 Actions, TanStack staleTime vs gcTime, Fiber reconciliation, Token refresh race conditions, TypeScript discriminated unions)
   - 10 Advanced / Senior questions (INP optimization, RSC wire format vs SSR, useTransition non-blocking scheduler, memory leak profiling, list virtualization)
