<div align="center">

<img src="aura_glyph_logo.svg" alt="Aura Glyph" width="200">

**Modern. Minimalist. Atmospheric.**

A next-generation Markdown editor built for those who care about aesthetics as much as functionality.

[![Go](https://img.shields.io/badge/Go-1.23-00ADD8?style=flat-square&logo=go&logoColor=white)](https://go.dev/)
[![Wails](https://img.shields.io/badge/Wails-v2.12-FF3E00?style=flat-square&logo=wails&logoColor=white)](https://wails.io/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-7C3AED?style=flat-square)](LICENSE)

</div>

---

## About

Aura Glyph is the first tool in the **Aura Suite** ecosystem — a lightweight, cross-platform Markdown editor with a frosted glass interface and a focus on visual comfort. No bloat, no cloud, no distractions. Just you and your text.

The interface draws from a **deep blue monochrome palette** accented by the Aura Glow gradient — a signature sweep from teal `#2DD4BF` to violet `#7C3AED`.

---

## Features

| Feature | Description |
|---|---|
| **Split / Source / Preview** | Switch between editor-only, preview-only, or side-by-side layouts |
| **Live Markdown Preview** | Rendered in real-time via Goldmark (Go) |
| **Syntax Highlighting** | CodeMirror 6 with full Markdown language support |
| **Presets System** | JSON-based typography presets — change fonts, sizes and line height on the fly |
| **Draggable Divider** | Resize editor/preview split freely with the mouse |
| **File Management** | Open, Save, Save As — with unsaved-changes indicator in the title bar |
| **Keyboard Shortcuts** | `Ctrl+O` open · `Ctrl+S` save · `Ctrl+Shift+S` save as |
| **Frosted Glass UI** | Ambient radial glows, glass panels, zero-compromise aesthetics |
| **Cross-Platform** | Native binaries for Windows (amd64) and Linux |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime / Core** | Go 1.23 |
| **Desktop Bridge** | Wails v2.12 |
| **Frontend** | React 18 + TypeScript 5.6 |
| **Styling** | Tailwind CSS v4 |
| **Editor** | CodeMirror 6 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Markdown Parser** | Goldmark (Go) |
| **Build Tool** | Vite 5 |

---

## Getting Started

### Prerequisites

Make sure you have all three tools installed and available in your `PATH`:

| Tool | Version | Download |
|---|---|---|
| **Go** | 1.21+ | [go.dev/dl](https://go.dev/dl/) |
| **Node.js** | LTS (includes npm) | [nodejs.org](https://nodejs.org/) |
| **Wails CLI** | v2 | see below |

Install Wails CLI:

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

Verify everything is in order:

```bash
wails doctor
```

### Development

```bash
# Clone the repository
git clone https://github.com/Stasyao37/aura-glyph.git
cd aura-glyph

# Start dev server with hot reload
wails dev
```

### Production Build

```bash
wails build
```

The binary will appear in `build/bin/`.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + O` | Open file |
| `Ctrl + S` | Save |
| `Ctrl + Shift + S` | Save As |

---

## Project Structure

```
aura_glyph/
├── app.go                  # Wails app definition
├── bridge.go               # Go ↔ JS bridge methods
├── backend/
│   ├── parser/             # Markdown → HTML (Goldmark)
│   ├── presets/            # Preset loading & management
│   └── export/             # File export logic
├── frontend/
│   └── src/
│       ├── App.tsx          # Root component, layout & state
│       ├── presets.ts       # Preset type definitions
│       └── components/      # TitleBar, Toolbar, Editor, Preview
└── build/                  # Platform-specific build assets
```

---

## Contributing

Contributions, preset designs, and UI ideas are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-idea`
3. Commit your changes
4. Open a Pull Request

For preset contributions, see the `backend/presets/` directory — presets are plain JSON configs controlling font family, size, and line height.

---

## Author

**Stanislav Kapitonov**  
Student @ MSTU Stankin · Go Developer · Linux Enthusiast

---

<div align="center">

Made with care for the Linux community &nbsp;·&nbsp; Part of the **Aura Suite**

</div>
