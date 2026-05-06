package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()
	bridge := NewBridge()

	err := wails.Run(&options.App{
		Title:            "Aura Glyph",
		Width:            1280,
		Height:           800,
		Frameless:        true,
		BackgroundColour: &options.RGBA{R: 16, G: 16, B: 18, A: 255},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		// Без явных Linux-опций Wails v2 принудительно ОТКЛЮЧАЕТ GPU
		// (см. wailsapp/wails#2977). Без GPU-композитинга в WebKit2GTK
		// не работает backdrop-filter — нет блюра.
		Linux: &linux.Options{
			WebviewGpuPolicy: linux.WebviewGpuPolicyAlways,
		},
		OnStartup: app.startup,
		Bind: []any{
			app,
			bridge,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
