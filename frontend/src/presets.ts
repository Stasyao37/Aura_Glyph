export interface Preset {
  id:          string
  name:        string
  sample:      string
  fontFamily:  string
  fontSize:    string
  lineHeight:  string
}

export const BUILT_IN_PRESETS: Preset[] = [
  {
    id:         "default",
    name:       "По умолчанию",
    sample:     "Sans-serif · 14px · 1.8",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize:   "14px",
    lineHeight: "1.8",
  },
  {
    id:         "gost",
    name:       "ГОСТ 7.32",
    sample:     "Times New Roman · 14px · 1.5",
    fontFamily: "'Times New Roman', Times, serif",
    fontSize:   "14px",
    lineHeight: "1.5",
  },
  {
    id:         "academic",
    name:       "Academic",
    sample:     "Georgia · 16px · 2.0",
    fontFamily: "Georgia, serif",
    fontSize:   "16px",
    lineHeight: "2.0",
  },
  {
    id:         "focus",
    name:       "Focus",
    sample:     "Inter · 15px · 1.75",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize:   "15px",
    lineHeight: "1.75",
  },
]
