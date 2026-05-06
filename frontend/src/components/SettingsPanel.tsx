import { Sun, Moon, Sparkles } from "lucide-react"
import { useTheme, type Theme } from "../hooks/useTheme"

interface SettingsPanelProps {
  onClose: () => void
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme()

  const themes: { id: Theme; name: string; icon: React.ReactNode }[] = [
    { id: "light", name: "Светлая", icon: <Sun size={18} /> },
    { id: "dark", name: "Тёмная", icon: <Moon size={18} /> },
    { id: "aura-glow", name: "Aura Glow", icon: <Sparkles size={18} /> },
  ]

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute top-20 right-4 w-64 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 shadow-lg backdrop-blur-xl">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
          Настройки
        </h2>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-[var(--color-text-muted)]">
            Тема
          </h3>
          <div className="flex items-center gap-2">
            {themes.map(({ id, name, icon }) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`flex flex-1 flex-col items-center gap-2 rounded-md border p-3 transition-colors ${
                  theme === id
                    ? "border-[var(--color-accent-light)] bg-[var(--color-accent)]/20 text-[var(--color-text-primary)]"
                    : "border-transparent text-[var(--color-text-muted)] hover:bg-white/5"
                }`}
                title={name}
              >
                {icon}
                <span className="text-xs">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
