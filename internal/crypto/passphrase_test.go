package crypto

import (
	"testing"
)

func TestPassphraseEncryptDecrypt(t *testing.T) {
	passphrase := "test-passphrase-123"
	plaintext := []byte("SECRET_KEY=abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890")

	encrypted, err := PassphraseEncrypt(passphrase, plaintext)
	if err != nil {
		t.Fatalf("encrypt: %v", err)
	}

	decrypted, err := PassphraseDecrypt(passphrase, encrypted)
	if err != nil {
		t.Fatalf("decrypt: %v", err)
	}

	if string(decrypted) != string(plaintext) {
		t.Fatalf("decrypted %q != original %q", decrypted, plaintext)
	}
}

func TestPassphraseDecrypt_WrongPassphrase(t *testing.T) {
	encrypted, _ := PassphraseEncrypt("correct", []byte("secret"))
	_, err := PassphraseDecrypt("wrong", encrypted)
	if err == nil {
		t.Fatal("expected error with wrong passphrase")
	}
}

func TestIsPassphraseProtected(t *testing.T) {
	if !IsPassphraseProtected([]byte("enc:abcdef")) {
		t.Fatal("should detect enc: prefix")
	}
	if IsPassphraseProtected([]byte("abcdef1234")) {
		t.Fatal("should not detect plain hex key")
	}
}

func TestZeroBytes(t *testing.T) {
	data := []byte{1, 2, 3, 4, 5}
	ZeroBytes(data)
	for i, b := range data {
		if b != 0 {
			t.Fatalf("byte %d not zeroed: %d", i, b)
		}
	}
}
