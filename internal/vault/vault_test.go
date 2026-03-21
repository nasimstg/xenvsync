package vault

import (
	"bytes"
	"testing"
)

func TestEncodeDecode_RoundTrip(t *testing.T) {
	original := []byte("this is some ciphertext blob \x00\xFF\x01")
	encoded := Encode(original)
	decoded, err := Decode(encoded)
	if err != nil {
		t.Fatalf("Decode() error: %v", err)
	}
	if !bytes.Equal(decoded, original) {
		t.Fatalf("round-trip failed: got %v, want %v", decoded, original)
	}
}

func TestEncode_ContainsHeaderFooter(t *testing.T) {
	encoded := Encode([]byte("test"))
	content := string(encoded)
	if !bytes.Contains(encoded, []byte(header)) {
		t.Fatal("encoded output missing header")
	}
	if !bytes.Contains(encoded, []byte(footer)) {
		t.Fatal("encoded output missing footer")
	}
	_ = content
}

func TestEncode_LineWrap(t *testing.T) {
	// Use a large payload to ensure line wrapping kicks in.
	data := bytes.Repeat([]byte("A"), 200)
	encoded := Encode(data)
	lines := bytes.Split(encoded, []byte("\n"))
	for _, line := range lines {
		s := string(line)
		if s == header || s == footer || s == "" {
			continue
		}
		if len(line) > 76 {
			t.Fatalf("base64 line exceeds 76 chars: %d", len(line))
		}
	}
}

func TestDecode_MissingHeader(t *testing.T) {
	data := []byte("no header here\n" + footer + "\n")
	_, err := Decode(data)
	if err == nil {
		t.Fatal("expected error for missing header")
	}
}

func TestDecode_MissingFooter(t *testing.T) {
	data := []byte(header + "\nSGVsbG8=\n")
	_, err := Decode(data)
	if err == nil {
		t.Fatal("expected error for missing footer")
	}
}

func TestDecode_InvalidBase64(t *testing.T) {
	data := []byte(header + "\n!!!not-base64!!!\n" + footer + "\n")
	_, err := Decode(data)
	if err == nil {
		t.Fatal("expected error for invalid base64")
	}
}

func TestDecode_EmptyPayload(t *testing.T) {
	data := []byte(header + "\n" + footer + "\n")
	decoded, err := Decode(data)
	if err != nil {
		t.Fatalf("Decode() error: %v", err)
	}
	if len(decoded) != 0 {
		t.Fatalf("expected empty payload, got %d bytes", len(decoded))
	}
}

func TestDecode_WindowsLineEndings(t *testing.T) {
	original := []byte("binary data \x00\x01\x02")
	encoded := Encode(original)
	// Simulate Windows CRLF.
	withCRLF := bytes.ReplaceAll(encoded, []byte("\n"), []byte("\r\n"))
	decoded, err := Decode(withCRLF)
	if err != nil {
		t.Fatalf("Decode() with CRLF error: %v", err)
	}
	if !bytes.Equal(decoded, original) {
		t.Fatal("round-trip with CRLF failed")
	}
}

func TestEncodeDecode_LargePayload(t *testing.T) {
	original := bytes.Repeat([]byte{0xAB}, 1<<16)
	encoded := Encode(original)
	decoded, err := Decode(encoded)
	if err != nil {
		t.Fatalf("Decode() error on large payload: %v", err)
	}
	if !bytes.Equal(decoded, original) {
		t.Fatal("large payload round-trip failed")
	}
}
