package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
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
		OnStartup: app.startup,
		Bind: []interface{}{
			app,
			bridge,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
