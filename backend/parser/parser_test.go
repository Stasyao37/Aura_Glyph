package parser

import (
	"regexp"
	"strings"
	"testing"
)

// minify removes all whitespace from a string to allow for comparison
// that is insensitive to formatting changes.
func minify(s string) string {
	re := regexp.MustCompile(`\s+`)
	return re.ReplaceAllString(s, "")
}

func TestRenderMarkdown(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "H1",
			input:    "# Hello",
			expected: "<h1>Hello</h1>",
		},
		{
			name:     "Strikethrough",
			input:    "~~deleted~~",
			expected: "<p><del>deleted</del></p>",
		},
		{
			name:     "Task List",
			input:    "- [x] Done",
			expected: `<ul><li><input checked="" disabled="" type="checkbox"> Done</li></ul>`,
		},
		{
			name: "Table",
			input: `| Head |
|------|
| Body |`,
			expected: "<table><thead><tr><th>Head</th></tr></thead><tbody><tr><td>Body</td></tr></tbody></table>",
		},
		{
			name:     "Empty input",
			input:    "",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			html, err := RenderMarkdown(tt.input)
			if err != nil {
				t.Errorf("RenderMarkdown() error = %v", err)
				return
			}

			got := strings.TrimSpace(html)

			// Minify both strings for a comparison that ignores formatting differences
			minGot := minify(got)
			minWant := minify(tt.expected)

			if minGot != minWant {
				t.Errorf("RenderMarkdown() got = %v, want %v", got, tt.expected)
			}
		})
	}
}
