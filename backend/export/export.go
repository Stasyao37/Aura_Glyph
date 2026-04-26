package export

import "errors"

// ToPDF converts rendered HTML to PDF at destPath.
// Requires chromedp — implement when Go toolchain >= 1.26.
func ToPDF(html string, destPath string) error {
	return errors.New("PDF export not yet implemented")
}
