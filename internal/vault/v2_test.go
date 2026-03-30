package vault

import (
	"bytes"
	"testing"
)

func TestEncodeDecodeV2_RoundTrip(t *testing.T) {
	slots := []KeySlot{
		{Name: "alice", EphemeralPub: "YWxpY2VfZXBo", EncryptedKey: "YWxpY2VfZW5j"},
		{Name: "bob", EphemeralPub: "Ym9iX2VwaA==", EncryptedKey: "Ym9iX2VuYw=="},
	}
	ciphertext := []byte("hello world encrypted data here")

	encoded, err := EncodeV2(slots, ciphertext)
	if err != nil {
		t.Fatal(err)
	}

	decoded, err := DecodeV2(encoded)
	if err != nil {
		t.Fatal(err)
	}

	if len(decoded.Slots) != 2 {
		t.Fatalf("expected 2 slots, got %d", len(decoded.Slots))
	}
	if decoded.Slots[0].Name != "alice" || decoded.Slots[1].Name != "bob" {
		t.Fatal("slot names mismatch")
	}
	if !bytes.Equal(decoded.Ciphertext, ciphertext) {
		t.Fatal("ciphertext mismatch")
	}
}

func TestIsV2(t *testing.T) {
	v1Data := []byte("#/---xenvsync vault---/\nabc\n#/---end xenvsync vault---/\n")
	v2Data := []byte("#/---xenvsync vault v2---/\n[]\n#/---data---/\nabc\n#/---end xenvsync vault---/\n")

	if IsV2(v1Data) {
		t.Fatal("V1 vault should not be detected as V2")
	}
	if !IsV2(v2Data) {
		t.Fatal("V2 vault should be detected as V2")
	}
}

func TestDecodeV2_Malformed(t *testing.T) {
	_, err := DecodeV2([]byte("not a vault"))
	if err == nil {
		t.Fatal("expected error for malformed data")
	}
}
