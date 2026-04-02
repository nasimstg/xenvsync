package env

import (
	"os"
	"path/filepath"
	"testing"
)

func TestParse_SimpleKeyValue(t *testing.T) {
	input := []byte("FOO=bar\nBAZ=qux\n")
	pairs, err := Parse(input)
	if err != nil {
		t.Fatalf("Parse() error: %v", err)
	}
	if len(pairs) != 2 {
		t.Fatalf("expected 2 pairs, got %d", len(pairs))
	}
	assertPair(t, pairs[0], "FOO", "bar")
	assertPair(t, pairs[1], "BAZ", "qux")
}

func TestParse_DoubleQuotes(t *testing.T) {
	input := []byte(`KEY="hello world"`)
	pairs, err := Parse(input)
	if err != nil {
		t.Fatalf("Parse() error: %v", err)
	}
	assertPair(t, pairs[0], "KEY", "hello world")
}

func TestParse_SingleQuotes(t *testing.T) {
	input := []byte(`KEY='hello world'`)
	pairs, err := Parse(input)
	if err != nil {
		t.Fatalf("Parse() error: %v", err)
	}
	assertPair(t, pairs[0], "KEY", "hello world")
}

func TestParse_EmptyValue(t *testing.T) {
	input := []byte("EMPTY=\n")
	pairs, err := Parse(input)
	if err != nil {
		t.Fatalf("Parse() error: %v", err)
	}
	assertPair(t, pairs[0], "EMPTY", "")
}

func TestParse_BlankLinesAndComments(t *testing.T) {
	input := []byte("# this is a comment\n\nFOO=bar\n\n# another comment\nBAZ=qux\n")
	pairs, err := Parse(input)
	if err != nil {
		t.Fatalf("Parse() error: %v", err)
	}
	if len(pairs) != 2 {
		t.Fatalf("expected 2 pairs, got %d", len(pairs))
	}
}

func TestParse_ExportPrefix(t *testing.T) {
	input := []byte("export FOO=bar\nexport BAZ=qux\n")
	pairs, err := Parse(input)
	if err != nil {
		t.Fatalf("Parse() error: %v", err)
	}
	assertPair(t, pairs[0], "FOO", "bar")
	assertPair(t, pairs[1], "BAZ", "qux")
}

func TestParse_ValueWithEquals(t *testing.T) {
	input := []byte("URL=https://example.com?foo=bar&baz=qux\n")
	pairs, err := Parse(input)
	if err != nil {
		t.Fatalf("Parse() error: %v", err)
	}
	assertPair(t, pairs[0], "URL", "https://example.com?foo=bar&baz=qux")
}

func TestParse_WhitespaceAroundEquals(t *testing.T) {
	input := []byte("  KEY  =  value  \n")
	pairs, err := Parse(input)
	if err != nil {
		t.Fatalf("Parse() error: %v", err)
	}
	assertPair(t, pairs[0], "KEY", "value")
}

func TestParse_UnquotedInlineComments(t *testing.T) {
	input := []byte("KEY=value # this is a comment\nHASH=abc#123\n")
	pairs, err := Parse(input)
	if err != nil {
		t.Fatalf("Parse() error: %v", err)
	}
	if len(pairs) != 2 {
		t.Fatalf("expected 2 pairs, got %d", len(pairs))
	}
	assertPair(t, pairs[0], "KEY", "value")
	assertPair(t, pairs[1], "HASH", "abc#123")
}

func TestParse_NoEqualsSign(t *testing.T) {
	input := []byte("INVALID_LINE\n")
	_, err := Parse(input)
	if err == nil {
		t.Fatal("expected error for line without '='")
	}
}

func TestParse_EmptyInput(t *testing.T) {
	pairs, err := Parse([]byte(""))
	if err != nil {
		t.Fatalf("Parse() error: %v", err)
	}
	if len(pairs) != 0 {
		t.Fatalf("expected 0 pairs, got %d", len(pairs))
	}
}

func TestParse_OnlyComments(t *testing.T) {
	input := []byte("# comment 1\n# comment 2\n")
	pairs, err := Parse(input)
	if err != nil {
		t.Fatalf("Parse() error: %v", err)
	}
	if len(pairs) != 0 {
		t.Fatalf("expected 0 pairs, got %d", len(pairs))
	}
}

func TestParse_Multiline(t *testing.T) {
	input := []byte("CERT=\"line1\nline2\nline3\"\n")
	pairs, err := Parse(input)
	if err != nil {
		t.Fatalf("Parse() error: %v", err)
	}
	assertPair(t, pairs[0], "CERT", "line1\nline2\nline3")
}

func TestMarshal_Simple(t *testing.T) {
	pairs := []Pair{
		{Key: "A", Value: "1"},
		{Key: "B", Value: "2"},
	}
	out := Marshal(pairs)
	expected := "A=1\nB=2\n"
	if string(out) != expected {
		t.Fatalf("Marshal() = %q, want %q", string(out), expected)
	}
}

func TestMarshal_QuotesSpaces(t *testing.T) {
	pairs := []Pair{
		{Key: "MSG", Value: "hello world"},
	}
	out := Marshal(pairs)
	expected := "MSG=\"hello world\"\n"
	if string(out) != expected {
		t.Fatalf("Marshal() = %q, want %q", string(out), expected)
	}
}

func TestMarshalParse_RoundTrip(t *testing.T) {
	original := []Pair{
		{Key: "SIMPLE", Value: "value"},
		{Key: "SPACED", Value: "hello world"},
		{Key: "EMPTY", Value: ""},
		{Key: "URL", Value: "https://example.com"},
	}
	data := Marshal(original)
	parsed, err := Parse(data)
	if err != nil {
		t.Fatalf("round-trip Parse() error: %v", err)
	}
	if len(parsed) != len(original) {
		t.Fatalf("round-trip: got %d pairs, want %d", len(parsed), len(original))
	}
	for i := range original {
		assertPair(t, parsed[i], original[i].Key, original[i].Value)
	}
}

func TestParseFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, ".env")
	content := []byte("FOO=bar\nBAZ=qux\n")
	if err := os.WriteFile(path, content, 0644); err != nil {
		t.Fatal(err)
	}
	pairs, err := ParseFile(path)
	if err != nil {
		t.Fatalf("ParseFile() error: %v", err)
	}
	if len(pairs) != 2 {
		t.Fatalf("expected 2 pairs, got %d", len(pairs))
	}
}

func TestParseFile_NotFound(t *testing.T) {
	_, err := ParseFile("/nonexistent/.env")
	if err == nil {
		t.Fatal("expected error for missing file")
	}
}

func assertPair(t *testing.T, got Pair, wantKey, wantVal string) {
	t.Helper()
	if got.Key != wantKey || got.Value != wantVal {
		t.Errorf("got {%q, %q}, want {%q, %q}", got.Key, got.Value, wantKey, wantVal)
	}
}
