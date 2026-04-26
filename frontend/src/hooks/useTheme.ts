import { useState } from "react";

type Theme = "dark" | "light" | "aura";

export function useTheme(initial: Theme = "dark") {
  const [theme, setTheme] = useState<Theme>(initial);
  return { theme, setTheme };
}
