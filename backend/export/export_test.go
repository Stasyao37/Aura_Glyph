package export

import "testing"

func TestToPDF(t *testing.T) {
	err := ToPDF("<html></html>", "test.pdf")
	if err == nil {
		t.Error("Expected an error for unimplemented ToPDF function, but got nil")
	}

	expectedErr := "PDF export not yet implemented"
	if err.Error() != expectedErr {
		t.Errorf("Expected error message '%s', but got '%s'", expectedErr, err.Error())
	}
}
