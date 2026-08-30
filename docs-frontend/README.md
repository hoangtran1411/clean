# React 19, Tailwind CSS, shadcn/ui, Axios & TanStack Query - Frontend Path

Welcome to the frontend learning curriculum demonstrating **React 19**, **Tailwind CSS v4**, **shadcn/ui**, **Axios with JWT Refresh Token Rotation**, **TanStack Query v5**, **Interactive Documentation Hub**, **Mermaid Vector Graphics Engine**, **Dark/Light/System Mode Theming**, **HiDPI 2K/4K Scaling**, and full-stack integration with our **.NET 10 Clean Architecture API**.

---

## 📚 Frontend Step-by-Step Learning Modules

1. [**01 - React 19 & Tech Stack Overview**](../docs-frontend/01-react19-and-techstack-overview.md)
   - Architecture overview
   - React 19, Tailwind CSS v4, shadcn/ui, TanStack Query, Axios
   - Running the Vite client application

2. [**02 - Project Setup with Vite, Tailwind CSS v4 & shadcn/ui**](../docs-frontend/02-project-setup-vite-tailwind-shadcn.md)
   - Scaffolding Vite + React 19 + TypeScript
   - Configuring `@tailwindcss/vite` and CSS variables
   - Setting up the `cn()` utility (`clsx` + `tailwind-merge`)

3. [**03 - Axios Interceptors, Bearer Tokens & 401 Refresh Token Rotation**](../docs-frontend/03-axios-interceptors-and-jwt-token-refresh.md)
   - Auto-injecting `Authorization: Bearer <token>` and `X-Correlation-ID`
   - Catching 401 Unauthorized errors and triggering automatic Refresh Token Rotation
   - Failed request queueing and replay mechanisms

4. [**04 - TanStack Query v5 Mastery (Server State, Caching & Invalidation)**](../docs-frontend/04-tanstack-query-mastery.md)
   - Query client configuration (`staleTime`, `refetchOnWindowFocus`)
   - Data fetching with `useQuery`
   - Mutations and automatic cache invalidation with `useMutation` and `queryClient.invalidateQueries`

5. [**05 - shadcn/ui Component Architecture & Design System**](../docs-frontend/05-shadcn-ui-components-and-theming.md)
   - Why shadcn/ui is a design system (not a component library)
   - ForwardRef components and `class-variance-authority` (cva)
   - Building reusable Buttons, Cards, Badges, and Inputs

6. [**06 - Full-Stack Integration: Identity, Idempotency & EPPlus Excel in React**](../docs-frontend/06-complete-crud-and-excel-integration.md)
   - Downloading binary `.xlsx` spreadsheets with Axios blobs
   - Multipart/form-data Excel file uploads
   - Frontend handling of `Idempotency-Key` headers and cache hits

7. [**07 - Career & Technical Roadmap for a Modern Frontend Developer**](../docs-frontend/07-career-roadmap-for-frontend-developer.md)
   - Junior ➔ Mid ➔ Senior mindset shift
   - The 6 Core Knowledge Pillars (JS Internals, React 19, TanStack Server State, Core Web Vitals, Design Systems, Security)
   - Portfolio projects and recommended engineering books

8. [**08 - Top 30 Modern Frontend & React Interview Questions (Easy, Medium, Advanced)**](../docs-frontend/08-top-30-frontend-interview-questions.md)
   - 10 Foundational / Junior questions (Closures, Keys, Flexbox vs Grid, Event Bubbling, Promises)
   - 10 Intermediate / Mid-level questions (React 19 Actions, TanStack staleTime vs gcTime, Fiber reconciliation, Token refresh race conditions, TypeScript discriminated unions)
   - 10 Advanced / Senior questions (INP optimization, RSC wire format vs SSR, useTransition non-blocking scheduler, memory leak profiling, list virtualization)

9. [**09 - Permission Handling, Dynamic Claim Policies & RBAC in React 19**](../docs-frontend/09-permission-handling-rbac-and-dynamic-claim-policies.md)
   - Fine-grained Claim-Based Access Control (CBAC) vs Role-Based Access Control (RBAC)
   - JWT permission extraction, authentication state hydration & reactive custom hooks (`useAuthorization`, `usePermission`)
   - Declarative `<PermissionGate />` components, conditional UI action masking, and React Router protected route guards (`<ProtectedRoute />`)
   - Axios `403 Forbidden` vs `401 Unauthorized` handling, cross-tab session synchronization, and Zero-Trust defense-in-depth

10. [**10 - Extensible Workflow Engine, State Machines & UI Integration**](../docs-frontend/10-workflow-engine-state-machine-and-ui-integration.md)
    - Data-driven $N$-level approval state machine lifecycle (Draft, Submitted, InApproval, Approved, Completed, Rejected, Obsolescence)
    - Dynamic Workflow Template Builder: configurable approval tiers and level-specific permission mappings
    - Visual Multi-tier Stepper (`WorkflowApprovalProgress`) and chronological audit timeline (`WorkflowTimeline`)
    - TanStack Query v5 mutation flows: tier approval, mandatory rejection reasons, obsolescence flags, and Super Admin signature revocation & draft reset
    - Seamless alignment with [.NET 10 Dynamic Policy Engine](../docs-backend/21-extensible-workflow-engine-and-authorization.md)

11. [**11 - In-App Documentation Hub, Dynamic Markdown Engine & Search Architecture**](../docs-frontend/11-inapp-documentation-hub-and-markdown-engine.md)
    - Architectural design of the in-app Documentation Hub (`/docs`, `/docs/:category`, `/docs/:category/:docSlug`)
    - Dynamic raw markdown glob imports in Vite (`import.meta.glob`) and zero-overhead code splitting
    - Custom AST rendering: GitHub Alert banners (`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`) and auto-anchor slug links
    - Throttled Scroll-Spy Table of Contents with dynamic heading hierarchy tracking (`H2`/`H3`)

12. [**12 - Interactive Mermaid Vector Diagram Rendering & Fullscreen Lightbox**](../docs-frontend/12-interactive-mermaid-diagram-rendering-and-fullscreen-lightbox.md)
    - Vector SVG rendering engine for C4 diagrams, sequence charts, and state transitions
    - Solving small SVG rendering limitations through automated SVG attribute normalization
    - Dynamic Dark Mode and Light Mode color palette synchronization
    - Fullscreen interactive lightbox modal with mouse wheel zoom (up to 600%) and drag-to-pan exploration

13. [**13 - Enterprise Dark/Light Theming, HiDPI 2K/4K Scaling & Flagship Mobile Optimization**](../docs-frontend/13-responsive-enterprise-theming-dark-mode-and-hidpi-device-optimization.md)
    - Zero-CLS ThemeProvider: Light, Dark, and System preference synchronization (`prefers-color-scheme`)
    - Tailwind CSS v4 `@theme` custom breakpoints (`3xl: 1920px`, `4xl: 2560px`) and fluid container widths (`2560px`)
    - Flagship mobile ergonomics for **iPhone 17 Pro Max** (Dynamic Island safe-areas) and **Samsung S26 Ultra** (QHD+ `100dvh`)
    - Multi-tier Interactive Font Scaling (`A` Standard 100%, `A+` 2K 125%, `A++` 4K 150%) with `localStorage` persistence
