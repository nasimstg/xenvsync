package crypto

import (
	"bytes"
	"encoding/hex"
	"testing"
)

func TestGenerateKey_Length(t *testing.T) {
	hexKey, err := GenerateKey()
	if err != nil {
		t.Fatalf("GenerateKey() error: %v", err)
	}
	raw, err := hex.DecodeString(hexKey)
	if err != nil {
		t.Fatalf("generated key is not valid hex: %v", err)
	}
	if len(raw) != KeySize {
		t.Fatalf("expected %d bytes, got %d", KeySize, len(raw))
	}
}

func TestGenerateKey_Unique(t *testing.T) {
	k1, _ := GenerateKey()
	k2, _ := GenerateKey()
	if k1 == k2 {
		t.Fatal("two generated keys should not be identical")
	}
}

func TestDecodeKey_Valid(t *testing.T) {
	hexKey, _ := GenerateKey()
	key, err := DecodeKey(hexKey)
	if err != nil {
		t.Fatalf("DecodeKey() error: %v", err)
	}
	if len(key) != KeySize {
		t.Fatalf("expected %d bytes, got %d", KeySize, len(key))
	}
}

func TestDecodeKey_TrimsWhitespace(t *testing.T) {
	hexKey, _ := GenerateKey()
	key, err := DecodeKey("  " + hexKey + "\n")
	if err != nil {
		t.Fatalf("DecodeKey() should trim whitespace: %v", err)
	}
	if len(key) != KeySize {
		t.Fatalf("expected %d bytes, got %d", KeySize, len(key))
	}
}

func TestDecodeKey_InvalidHex(t *testing.T) {
	_, err := DecodeKey("not-hex-at-all!")
	if err == nil {
		t.Fatal("expected error for invalid hex")
	}
}

func TestDecodeKey_WrongLength(t *testing.T) {
	// 16 bytes instead of 32
	short := hex.EncodeToString(make([]byte, 16))
	_, err := DecodeKey(short)
	if err == nil {
		t.Fatal("expected error for wrong key length")
	}
}

func TestEncryptDecrypt_RoundTrip(t *testing.T) {
	hexKey, _ := GenerateKey()
	key, _ := DecodeKey(hexKey)

	plaintext := []byte("SECRET_KEY=super_secret_value_42")
	ciphertext, err := Encrypt(key, plaintext)
	if err != nil {
		t.Fatalf("Encrypt() error: %v", err)
	}

	// Ciphertext must differ from plaintext.
	if bytes.Equal(ciphertext, plaintext) {
		t.Fatal("ciphertext should not equal plaintext")
	}

	decrypted, err := Decrypt(key, ciphertext)
	if err != nil {
		t.Fatalf("Decrypt() error: %v", err)
	}
	if !bytes.Equal(decrypted, plaintext) {
		t.Fatalf("round-trip failed: got %q, want %q", decrypted, plaintext)
	}
}

func TestEncrypt_UniqueNonce(t *testing.T) {
	hexKey, _ := GenerateKey()
	key, _ := DecodeKey(hexKey)
	plaintext := []byte("same input")

	c1, _ := Encrypt(key, plaintext)
	c2, _ := Encrypt(key, plaintext)

	// Two encryptions of the same plaintext must produce different ciphertexts
	// because each uses a fresh random nonce.
	if bytes.Equal(c1, c2) {
		t.Fatal("two encryptions of the same plaintext should differ (unique nonce)")
	}
}

func TestEncryptDecrypt_EmptyPlaintext(t *testing.T) {
	hexKey, _ := GenerateKey()
	key, _ := DecodeKey(hexKey)

	ciphertext, err := Encrypt(key, []byte{})
	if err != nil {
		t.Fatalf("Encrypt() error on empty input: %v", err)
	}
	decrypted, err := Decrypt(key, ciphertext)
	if err != nil {
		t.Fatalf("Decrypt() error on empty input: %v", err)
	}
	if len(decrypted) != 0 {
		t.Fatalf("expected empty plaintext, got %q", decrypted)
	}
}

func TestDecrypt_WrongKey(t *testing.T) {
	k1Hex, _ := GenerateKey()
	k2Hex, _ := GenerateKey()
	k1, _ := DecodeKey(k1Hex)
	k2, _ := DecodeKey(k2Hex)

	ciphertext, _ := Encrypt(k1, []byte("secret"))
	_, err := Decrypt(k2, ciphertext)
	if err == nil {
		t.Fatal("expected error when decrypting with wrong key")
	}
}

func TestDecrypt_TamperedCiphertext(t *testing.T) {
	hexKey, _ := GenerateKey()
	key, _ := DecodeKey(hexKey)

	ciphertext, _ := Encrypt(key, []byte("secret"))

	// Flip a byte in the ciphertext portion (after the nonce).
	tampered := make([]byte, len(ciphertext))
	copy(tampered, ciphertext)
	tampered[NonceSize+1] ^= 0xFF

	_, err := Decrypt(key, tampered)
	if err == nil {
		t.Fatal("expected error when ciphertext is tampered")
	}
}

func TestDecrypt_TruncatedData(t *testing.T) {
	hexKey, _ := GenerateKey()
	key, _ := DecodeKey(hexKey)

	// Data shorter than nonce size.
	_, err := Decrypt(key, []byte("short"))
	if err == nil {
		t.Fatal("expected error for truncated data")
	}
}

func TestEncryptDecrypt_LargePayload(t *testing.T) {
	hexKey, _ := GenerateKey()
	key, _ := DecodeKey(hexKey)

	// 1 MB payload.
	plaintext := bytes.Repeat([]byte("A"), 1<<20)
	ciphertext, err := Encrypt(key, plaintext)
	if err != nil {
		t.Fatalf("Encrypt() error on large payload: %v", err)
	}
	decrypted, err := Decrypt(key, ciphertext)
	if err != nil {
		t.Fatalf("Decrypt() error on large payload: %v", err)
	}
	if !bytes.Equal(decrypted, plaintext) {
		t.Fatal("large payload round-trip failed")
	}
}
