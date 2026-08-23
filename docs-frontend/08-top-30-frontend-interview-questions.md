# 08 - Top 30 Modern Frontend & React Interview Questions (Easy, Medium, Advanced)

A curated collection of the **Top 30 Interview Questions** asked by top tech companies for **React 19, TypeScript, TanStack Query, Next.js, and Modern Web Engineering**.

---

## 🟢 Section 1: Foundational / Easy Questions (1 – 10)

### 1. What is the difference between `var`, `let`, and `const` in JavaScript?
- **Answer**: `var` is function-scoped and hoisted with an initial value of `undefined`. `let` and `const` are block-scoped and hoisted into the **Temporal Dead Zone (TDZ)**, throwing a `ReferenceError` if accessed before declaration. `const` prevents re-assigning the variable identifier (though object properties can still be mutated).
- **Interviewer looks for**: Mention of block-scoping, hoisting behavior, and Temporal Dead Zone (TDZ).

---

### 2. How does React determine when to re-render a component?
- **Answer**: React re-renders a component when:
  1. Its local **state** updates (`useState`, `useReducer`).
  2. Its **props** change.
  3. Its **parent component** re-renders.
  4. A **Context value** it subscribes to changes (`useContext`).
- **Interviewer looks for**: Mentioning that parent re-renders trigger child re-renders by default unless wrapped in `React.memo()`.

---

### 3. Why is the `key` prop required when rendering lists in React, and why is using `index` discouraged?
- **Answer**: React uses `key` during the **Reconciliation** phase to match virtual DOM nodes with real DOM nodes across renders. Using array `index` as a key breaks state association and causes UI bugs when items are inserted, deleted, or sorted.
```tsx
// ❌ Avoid:
{items.map((item, index) => <ListItem key={index} data={item} />)}

// ✅ Correct:
{items.map((item) => <ListItem key={item.id} data={item} />)}
```
- **Interviewer looks for**: Understanding of React's diffing algorithm and list stability.

---

### 4. What is the difference between CSS Flexbox and CSS Grid?
- **Answer**: **Flexbox** is **one-dimensional** (lays out items along either a row OR a column). **CSS Grid** is **two-dimensional** (lays out items along rows AND columns simultaneously). Use Flexbox for component-level alignment and Grid for page-level structural layouts.
- **Interviewer looks for**: The 1D vs 2D mental model.

---

### 5. What is the difference between `null` and `undefined` in JavaScript?
- **Answer**: `undefined` means a variable has been declared but has not yet been assigned a value (or a function returned nothing). `null` is an intentional assignment representing "no value" or "empty object reference".
```javascript
typeof undefined // "undefined"
typeof null      // "object" (historical JS quirk)
null == undefined  // true
null === undefined // false
```
- **Interviewer looks for**: Type differences and intentional vs unintentional absence of value.

---

### 6. How does the `useEffect` hook dependency array work?
- **Answer**:
  - **No array (`useEffect(fn)`)**: Runs after every render.
  - **Empty array (`useEffect(fn, [])`)**: Runs once after initial mount.
  - **With dependencies (`useEffect(fn, [a, b])`)**: Runs on mount and whenever `a` or `b` changes (checked via `Object.is()`).
- **Interviewer looks for**: Understanding reference equality for objects/functions in dependencies.

---

### 7. What is Event Bubbling vs. Event Capturing in the DOM?
- **Answer**: When an event occurs, it travels in 3 phases:
  1. **Capturing Phase**: Event trickles down from `window` ➔ `document` ➔ target element.
  2. **Target Phase**: Event reaches the target element.
  3. **Bubbling Phase**: Event bubbles back up from target element ➔ `window`.
  By default, `addEventListener(type, listener)` listens in the **bubbling** phase unless `{ capture: true }` is passed. Calling `e.stopPropagation()` halts the propagation.
- **Interviewer looks for**: Understanding event delegation and event phases.

---

### 8. What is the difference between Debouncing and Throttling?
- **Answer**:
  - **Debouncing**: Delays execution until a specified delay has elapsed since the *last* event (e.g. search autocomplete input).
  - **Throttling**: Ensures the function executes at most once every specified time interval (e.g. scroll or resize listeners).
- **Interviewer looks for**: Real-world UI use-cases for both techniques.

---

### 9. What is the difference between a Promise and `async/await`?
- **Answer**: `async/await` is syntactic sugar built on top of JavaScript Promises and generators. It allows asynchronous code to be written and read like synchronous code, using standard `try/catch` blocks for error handling.
- **Interviewer looks for**: Understanding that `async` functions always return a Promise.

---

### 10. What is the purpose of the `alt` attribute on an `<img>` tag?
- **Answer**: The `alt` (alternative text) attribute provides a text equivalent for images. It is essential for **accessibility** (screen readers read it to visually impaired users), **SEO** (search engines index it), and **fallback display** when an image fails to load.
- **Interviewer looks for**: Prioritizing web accessibility (a11y).

---

## 🟡 Section 2: Intermediate / Mid-Level Questions (11 – 20)

### 11. What is the difference between `staleTime` and `gcTime` in TanStack Query (React Query v5)?
- **Answer**:
  - **`staleTime`**: The duration (in ms) until cached data is considered stale. While fresh, no network request is made upon component remount.
  - **`gcTime` (formerly `cacheTime`)**: The duration (in ms) inactive data remains in memory before being garbage-collected from the cache when no components are observing it.
```typescript
useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  staleTime: 1000 * 60 * 5, // Fresh for 5 minutes (no background refetch)
  gcTime: 1000 * 60 * 30,   // Kept in memory for 30 minutes before deletion
})
```
- **Interviewer looks for**: Understanding server-state caching mechanics.

---

### 12. How does the JavaScript Event Loop handle Microtasks vs. Macrotasks?
- **Answer**:
  1. The Call Stack executes synchronous code to completion.
  2. When the call stack is empty, the Event Loop processes **all jobs in the Microtask Queue** (`Promise.then()`, `queueMicrotask()`, `MutationObserver`) until empty.
  3. The browser may render UI updates.
  4. The Event Loop takes **one task** from the **Macrotask Queue** (`setTimeout`, `setInterval`, I/O, `setImmediate`) and pushes it to the stack.
  5. Repeat. Microtasks always have priority over Macrotasks!
- **Interviewer looks for**: Predicting execution order in tricky async code snippets.

---

### 13. What is new in React 19 Actions and `useActionState`?
- **Answer**: React 19 introduced **Actions**—functions that handle async transitions automatically managing pending states, errors, optimistic updates, and form submissions:
```tsx
const [state, formAction, isPending] = useActionState(
  async (prevState, formData) => {
    const error = await updateName(formData.get('name'))
    if (error) return { error }
    return { error: null }
  },
  { error: null }
)
```
- **Interviewer looks for**: Familiarity with cutting-edge React 19 features.

---

### 14. How do you handle race conditions during JWT Token Refresh with Axios Interceptors?
- **Answer**: When multiple concurrent requests fail with 401 simultaneously:
  1. Use a boolean flag `isRefreshing` so only the **first** failed request triggers `POST /api/auth/refresh-token`.
  2. Subsequent 401 requests are pushed into a `failedQueue` Promise array.
  3. When token refresh succeeds, drain the queue and retry all pending requests with the new token.
- **Interviewer looks for**: Concurrency control and queueing logic in Axios.

---

### 15. What are React Fiber and the Reconciliation Algorithm?
- **Answer**: **React Fiber** is React's reimplemented core reconciliation engine (introduced in React 16). It represents a virtual stack frame where work can be **paused, aborted, or prioritized** across chunks (enabling Concurrent Mode). The reconciliation algorithm compares the previous fiber tree with the new work-in-progress fiber tree in $O(n)$ time using heuristics (type checking and unique keys).
- **Interviewer looks for**: Depth of React internal knowledge.

---

### 16. What is the difference between `useMemo`, `useCallback`, and `React.memo`?
- **Answer**:
  - **`React.memo`**: Higher-order component that memoizes a component render, skipping re-renders if props have not changed (shallow comparison).
  - **`useMemo`**: Memoizes the **result of a calculation** between renders: `const val = useMemo(() => compute(a), [a])`.
  - **`useCallback`**: Memoizes a **function definition** between renders to maintain referential equality when passed to memoized children: `const fn = useCallback(() => doWork(b), [b])`.
- **Interviewer looks for**: Warning against premature optimization and understanding referential equality.

---

### 17. How does CSS `clsx` and `tailwind-merge` work in `cn()` utility?
- **Answer**: `clsx` conditionally constructs class name strings (e.g. `{ 'bg-red-500': hasError }`). `tailwind-merge` parses Tailwind class names and intelligently removes conflicting styles (e.g. `twMerge('p-4 p-2')` outputs `p-2`). Combining them in `cn(...inputs)` ensures safe component variant styling.
- **Interviewer looks for**: Mastery of the modern shadcn styling architecture.

---

### 18. What is TypeScript's `Discriminated Union` and why is it powerful?
- **Answer**: A Discriminated Union is a union of object types that share a common literal property (the "discriminant"), enabling TypeScript to narrow types automatically in `switch` or `if` statements:
```typescript
type NetworkState =
  | { status: 'loading' }
  | { status: 'success'; data: Product[] }
  | { status: 'error'; message: string }

function handle(state: NetworkState) {
  if (state.status === 'success') {
    console.log(state.data) // TypeScript knows data exists here!
  }
}
```
- **Interviewer looks for**: Type safety patterns for API response modeling.

---

### 19. What is the difference between Controlled and Uncontrolled components in React?
- **Answer**:
  - **Controlled Component**: Form input value is driven by React state (`value={state}` + `onChange`). React is the single source of truth.
  - **Uncontrolled Component**: Form input value is managed directly by the DOM (`ref={inputRef}` or native `FormData`). Better for performance in very large forms.
- **Interviewer looks for**: Understanding trade-offs between validation control and render performance.

---

### 20. What are React Portals and when should you use them?
- **Answer**: `createPortal(children, domNode)` renders children into a different DOM node outside the parent component hierarchy while maintaining standard React event bubbling. Essential for **modals, tooltips, and dropdowns** to escape parent CSS `overflow: hidden` or `z-index` stacking context constraints.
- **Interviewer looks for**: DOM positioning and stacking context awareness.

---

## 🔴 Section 3: Advanced / Senior Questions (21 – 30)

### 21. What is INP (Interaction to Next Paint) and how do you optimize it?
- **Answer**: INP is a Core Web Vital metric measuring overall page responsiveness by tracking the latency of all user interactions (clicks, taps, keypresses) throughout the page lifecycle.
- **Optimization Strategies**:
  1. Yielding the main thread during heavy JavaScript tasks using `scheduler.yield()` or `setTimeout`.
  2. Using React Concurrent features: `useTransition` or `useDeferredValue` to mark expensive state updates as non-blocking.
  3. Avoiding long layout thrashing tasks and heavy synchronous DOM modifications.
- **Interviewer looks for**: Modern web performance diagnostics beyond simple Lighthouse scores.

---

### 22. What is the difference between React Server Components (RSC) and Server-Side Rendering (SSR)?
- **Answer**:
  - **SSR**: Executes components on the server to produce initial HTML for fast First Contentful Paint. The browser must still download the entire JavaScript bundle and **hydrate** the entire DOM tree before it becomes interactive.
  - **RSC**: Components execute **only on the server** and never ship JavaScript to the client bundle. They stream a serialized JSON-like virtual DOM wire format. RSC allows direct database access and zero-bundle-size dependencies on the client.
- **Interviewer looks for**: Clear distinction between HTML hydration (SSR) vs zero-bundle execution (RSC).

---

### 23. How does `useTransition` prevent UI freezing in React 19?
- **Answer**: `useTransition` marks state updates as **non-urgent transitions**. Urgent updates (typing in an input, clicking a tab) execute immediately, while transition updates (filtering 10,000 items in a table) are interrupted if a new user input occurs, preventing main-thread UI freezing:
```tsx
const [isPending, startTransition] = useTransition()

function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
  setInputVal(e.target.value) // Urgent update
  startTransition(() => {
    setFilterQuery(e.target.value) // Non-urgent background computation
  })
}
```
- **Interviewer looks for**: Concurrent React scheduling and user experience optimization.

---

### 24. How do you identify and fix Memory Leaks in a React Single Page Application?
- **Answer**:
  - **Identification**: Open Chrome DevTools ➔ Memory Panel ➔ Record **Heap Snapshots** or Allocation Instrumentation on Timeline. Look for detached DOM trees or retaining closures.
  - **Common Causes & Fixes**:
    1. Uncleaned subscriptions/listeners: Return cleanup function in `useEffect`: `return () => window.removeEventListener(...)`.
    2. Uncleared timers: `return () => clearInterval(timerId)`.
    3. Global event bus or dangling WebSocket references.
    4. Retaining large closures in long-lived state managers.
- **Interviewer looks for**: Systematic debugging methodology using browser developer tooling.

---

### 25. Where should JWT Access Tokens and Refresh Tokens be stored securely in a Web Client?
- **Answer**:
  - **Most Secure**: Store Refresh Token in an **`HttpOnly`, `Secure`, `SameSite=Strict` Cookie** (inaccessible to JavaScript, immune to XSS). Store short-lived Access Token in **memory** (JavaScript variable or React State).
  - **SPA / API Architecture**: If cookies cannot be used due to cross-domain architectures, use `localStorage` paired with **strict Content Security Policy (CSP)** headers, sanitized outputs (XSS prevention), and **single-use Refresh Token Rotation** to mitigate replay risk.
- **Interviewer looks for**: Deep understanding of XSS, CSRF, and practical defense-in-depth trade-offs.

---

### 26. How do you implement List Virtualization for 100,000 items without DOM degradation?
- **Answer**: Rendering 100,000 DOM nodes crashes the browser. **List Virtualization** (e.g. `@tanstack/react-virtual`) calculates the user's current scroll position and renders **only the visible slice of items (e.g. 20 items)** plus a small buffer, positioning them absolutely inside a container with total calculated height.
- **Interviewer looks for**: DOM node budget and rendering performance at scale.

---

### 27. What is Tree-Shaking and what enables it in modern bundlers (Vite/Rollup/Webpack)?
- **Answer**: Tree-shaking is dead-code elimination. It relies on the **static structure of ES Modules (`import` / `export`)** where dependencies can be analyzed at build time without evaluating code. For tree-shaking to work:
  1. Packages must use ESM syntax (not CommonJS `require()`).
  2. `package.json` should specify `"sideEffects": false`.
- **Interviewer looks for**: Build tool mechanics and modular JavaScript architecture.

---

### 28. What is Micro-Frontend Architecture and how does Webpack/Vite Module Federation work?
- **Answer**: Micro-frontends decompose a monolithic frontend into independent applications owned by distinct teams. **Module Federation** allows a host application to dynamically load compiled remote modules (components or full pages) over the network at runtime without rebuilding the host app, while sharing common dependencies (like React or TanStack Query).
- **Interviewer looks for**: Enterprise frontend scalability and architectural tradeoffs.

---

### 29. How do you implement an Optimistic UI Mutation with rollback in TanStack Query?
- **Answer**:
```typescript
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] })
    const previousTodos = queryClient.getQueryData(['todos'])

    // Optimistically update cache immediately before server responds
    queryClient.setQueryData(['todos'], (old: Todo[]) => [...old, newTodo])

    return { previousTodos } // Return context with snapshot
  },
  onError: (err, newTodo, context) => {
    // Rollback to previous snapshot if request fails!
    queryClient.setQueryData(['todos'], context?.previousTodos)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})
```
- **Interviewer looks for**: Mastery of optimistic update lifecycle and rollback safety.

---

### 30. How do you design a high-resilience WebSocket client in React?
- **Answer**:
  1. Implement **Exponential Backoff Reconnection** with jitter to prevent server stampedes upon reconnection.
  2. Implement **Heartbeat (Ping/Pong)** to detect silent broken connections.
  3. Buffer outgoing messages in an offline queue while disconnected and flush upon reconnection.
  4. Wrap in a custom hook or React Context for clean component lifecycle cleanup.
- **Interviewer looks for**: Real-time distributed systems engineering on the client.
