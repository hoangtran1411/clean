# 07 - Micro-Interactions, Motion Design & Perceived Performance

Micro-interactions are subtle visual and tactile moments built around a single task—toggling a switch, liking an item, submitting a form, or pulling to refresh. They provide vital feedback and elevate perceived interface quality.

---

## 1. The 4 Stages of a Micro-Interaction (Dan Saffer Model)

```text
   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌──────────────┐
   │ 1. TRIGGER  │ ───► │  2. RULES   │ ───► │ 3. FEEDBACK │ ───► │4. LOOPS/MODES│
   │ User clicks │      │ Backend     │      │ Button icon │      │ Card updates │
   │ Save button │      │ validates & │      │ transforms  │      │ to "Saved"   │
   │ or hovers.  │      │ processes.  │      │ to checkmark│      │ state.       │
   └─────────────┘      └─────────────┘      └─────────────┘      └──────────────┘
```

---

## 2. Animation Easing & Duration Curves

```text
┌────────────────────┬──────────────┬────────────────────────────────────────────────────────┐
│ Animation Type     │ Duration     │ Easing Function & Use Case                             │
├────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Micro-feedback     │ 100 - 150ms  │ `ease-out`: Button active scale (`active:scale-95`).   │
│ Menu / Tooltip     │ 150 - 200ms  │ `cubic-bezier(0.16, 1, 0.3, 1)` (Snappy entry).        │
│ Modal / Sheet      │ 250 - 350ms  │ Spring physics or Deceleration curve.                  │
│ Page Transition    │ 300 - 400ms  │ Gentle cross-fade / sliding entry.                     │
└────────────────────┴──────────────┴────────────────────────────────────────────────────────┘
```

> [!TIP]
> Elements entering the screen should **decelerate** (`ease-out`), while elements leaving the screen should **accelerate** (`ease-in`). Avoid linear easing (`linear`) for UI elements because it feels robotic and unnatural.

---

## 3. Perceived Performance: Skeletons vs. Spinners vs. Optimistic UI

```text
┌─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐
│ SKELETON SHIMMER (Predictive Spatial Layout)                │ OPTIMISTIC UI (Instant State Feedback)                      │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ • Previews exact dimensions of content before it arrives.   │ • Instantly updates UI before server response returns.      │
│ • Reduces cognitive jarring and layout shifts (CLS).        │ • Rolls back with toast error if network request fails.     │
│                                                             │                                                             │
│ ```tsx                                                      │ ```tsx                                                      │
│ export function ProductSkeleton() {                         │ const mutation = useMutation({                              │
│   return (                                                  │   onMutate: async (newTodo) => {                            │
│     <div className="space-y-3">                             │     queryClient.setQueryData(["todos"], old =>              │
│       <Skeleton className="h-48 w-full rounded-lg" />       │       [...old, { ...newTodo, id: Date.now() }]);            │
│       <Skeleton className="h-4 w-3/4" />                    │   }                                                         │
│       <Skeleton className="h-4 w-1/2" />                    │ });                                                         │
│     </div>                                                  │ ```                                                         │
│   );                                                        │                                                             │
│ }                                                           │                                                             │
│ ```                                                         │                                                             │
└─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 4. Motion Accessibility (`prefers-reduced-motion`)

Users with vestibular disorders or motion sensitivity can experience nausea or dizziness from parallax and sliding animations. Always respect OS accessibility settings:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

In Tailwind CSS: use `motion-reduce:transition-none motion-reduce:transform-none`.
