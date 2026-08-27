# 04 - Color Theory, Palette Architecture & Dark Mode Theming

Color evokes emotion, establishes visual hierarchy, and guides user attention. Modern web interfaces rely on perceptually uniform color spaces and automated contrast ratios.

---

## 1. Color Spaces: Why OKLCH Replaces HSL & RGB

```text
 Traditional HSL Flaw:
 • Yellow at 50% Lightness appears blindingly bright to human eyes.
 • Blue at 50% Lightness appears very dark.
 ➔ HSL is NOT perceptually uniform, making programmatic contrast calculations unreliable!

 Modern OKLCH (Oklab Lightness Chroma Hue):
 • Lightness (L: 0 to 1): Predictable perceived brightness across all hues.
 • Chroma (C: 0 to 0.4): Color purity / saturation.
 • Hue (H: 0 to 360): The color angle on the spectrum.
 ➔ Changing hue in OKLCH does NOT alter perceived brightness or WCAG contrast!
```

---

## 2. The 60-30-10 Rule in UI Distribution

To prevent sensory overload, distribute color across your interface following the 60-30-10 ratio:

```text
 ┌─────────────────────────────────────────────────────────────┐
 │ 60% DOMINANT COLOR (Neutral Backgrounds & Canvas)           │
 │ - White, light gray in light mode; dark slate in dark mode  │
 ├─────────────────────────────────────────────────────────────┤
 │ 30% SECONDARY COLOR (Cards, Borders, Typography, Surfaces)  │
 │ - Subdued neutrals, muted surfaces, borders                 │
 ├─────────────────────────────────────────────────────────────┤
 │ 10% ACCENT COLOR (Call-To-Action, Active Badges, Alerts)    │
 │ - High-contrast Primary Blue, Emerald Success, Rose Error   │
 └─────────────────────────────────────────────────────────────┘
```

---

## 3. Dark Mode Architecture & Elevation

Dark mode is **not** simply inverting colors from `#FFFFFF` to `#000000`. Pure black (`#000000`) creates excessive visual contrast and eye fatigue against white text.

```text
       LIGHT MODE ELEVATION:                  DARK MODE ELEVATION:
       Surface Elevation via SHADOWS          Surface Elevation via LIGHTER TINTS
       
       ┌────────────────────────┐             ┌────────────────────────┐
       │ Elevated Modal / Card  │             │ Elevated Modal / Card  │ (Higher = Lighter Gray)
       │ (bg-white shadow-xl)   │             │ (oklch(0.25 0.01 260)) │
       └────────────────────────┘             └────────────────────────┘
                  ▲                                      ▲
                  │                                      │
       ┌────────────────────────┐             ┌────────────────────────┐
       │ Base Canvas (bg-gray)  │             │ Base Canvas Background │ (Lowest = Dark Slate)
       │ (oklch(0.98 0 0))      │             │ (oklch(0.14 0.01 260)) │
       └────────────────────────┘             └────────────────────────┘
```

---

## 4. WCAG 2.2 Color Contrast Ratios

```text
┌────────────────────────┬───────────────────┬────────────────────────────────────────────────────────┐
│ Conformance Level      │ Normal Text       │ Large Text ($\ge 18\text{pt}$ / $\ge 14\text{pt}$ Bold)│
├────────────────────────┼───────────────────┼────────────────────────────────────────────────────────┤
│ **WCAG AA (Baseline)** │ **$4.5 : 1$**     │ **$3.0 : 1$**                                          │
│ **WCAG AAA (Enhanced)**│ **$7.0 : 1$**     │ **$4.5 : 1$**                                          │
│ **UI Components/Icons**│ **$3.0 : 1$**     │ Focus indicators, input borders, action icons.         │
└────────────────────────┴───────────────────┴────────────────────────────────────────────────────────┘
```

### React Dark Mode Hook & Theme Provider:

```tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

const ThemeProviderContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "system",
  setTheme: () => null,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "system"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeProviderContext);
```
