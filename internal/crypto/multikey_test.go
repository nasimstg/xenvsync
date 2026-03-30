package crypto

import (
	"bytes"
	"testing"

	"github.com/nasimstg/xenvsync/internal/vault"
)

func TestMultiKeyEncryptDecrypt_SingleRecipient(t *testing.T) {
	alice, _ := GenerateKeypair()
	plaintext := []byte("DB_HOST=localhost\nAPI_KEY=secret\n")

	recipients := []Recipient{
		{Name: "alice", PublicKey: alice.PublicKey},
	}

	slots, ciphertext, err := MultiKeyEncrypt(recipients, plaintext)
	if err != nil {
		t.Fatal(err)
	}

	if len(slots) != 1 {
		t.Fatalf("expected 1 slot, got %d", len(slots))
	}
	if slots[0].Name != "alice" {
		t.Fatalf("slot name = %q, want alice", slots[0].Name)
	}

	v2 := &vault.V2Vault{Slots: slots, Ciphertext: ciphertext}
	decrypted, err := MultiKeyDecrypt(v2, alice.PrivateKey)
	if err != nil {
		t.Fatal(err)
	}

	if !bytes.Equal(decrypted, plaintext) {
		t.Fatalf("decrypted = %q, want %q", decrypted, plaintext)
	}
}

func TestMultiKeyEncryptDecrypt_MultipleRecipients(t *testing.T) {
	alice, _ := GenerateKeypair()
	bob, _ := GenerateKeypair()
	charlie, _ := GenerateKeypair()
	plaintext := []byte("SECRET=value\n")

	recipients := []Recipient{
		{Name: "alice", PublicKey: alice.PublicKey},
		{Name: "bob", PublicKey: bob.PublicKey},
		{Name: "charlie", PublicKey: charlie.PublicKey},
	}

	slots, ciphertext, err := MultiKeyEncrypt(recipients, plaintext)
	if err != nil {
		t.Fatal(err)
	}

	if len(slots) != 3 {
		t.Fatalf("expected 3 slots, got %d", len(slots))
	}

	v2 := &vault.V2Vault{Slots: slots, Ciphertext: ciphertext}

	// All recipients should be able to decrypt.
	for _, kp := range []*X25519Keypair{alice, bob, charlie} {
		decrypted, err := MultiKeyDecrypt(v2, kp.PrivateKey)
		if err != nil {
			t.Fatalf("decryption failed: %v", err)
		}
		if !bytes.Equal(decrypted, plaintext) {
			t.Fatal("decrypted data mismatch")
		}
	}
}

func TestMultiKeyDecrypt_WrongKey(t *testing.T) {
	alice, _ := GenerateKeypair()
	outsider, _ := GenerateKeypair()
	plaintext := []byte("SECRET=value\n")

	recipients := []Recipient{
		{Name: "alice", PublicKey: alice.PublicKey},
	}

	slots, ciphertext, _ := MultiKeyEncrypt(recipients, plaintext)
	v2 := &vault.V2Vault{Slots: slots, Ciphertext: ciphertext}

	_, err := MultiKeyDecrypt(v2, outsider.PrivateKey)
	if err == nil {
		t.Fatal("expected error for non-team member")
	}
}

func TestMultiKeyEncrypt_NoRecipients(t *testing.T) {
	_, _, err := MultiKeyEncrypt(nil, []byte("data"))
	if err == nil {
		t.Fatal("expected error for empty recipients")
	}
}

func TestMultiKeyEncryptDecrypt_FullVaultRoundTrip(t *testing.T) {
	alice, _ := GenerateKeypair()
	bob, _ := GenerateKeypair()
	plaintext := []byte("DB_HOST=localhost\nAPI_KEY=sk-secret\n")

	recipients := []Recipient{
		{Name: "alice", PublicKey: alice.PublicKey},
		{Name: "bob", PublicKey: bob.PublicKey},
	}

	// Encrypt
	slots, ciphertext, err := MultiKeyEncrypt(recipients, plaintext)
	if err != nil {
		t.Fatal(err)
	}

	// Encode to V2 vault format
	encoded, err := vault.EncodeV2(slots, ciphertext)
	if err != nil {
		t.Fatal(err)
	}

	// Verify it's detected as V2
	if !vault.IsV2(encoded) {
		t.Fatal("encoded vault not detected as V2")
	}

	// Decode
	decoded, err := vault.DecodeV2(encoded)
	if err != nil {
		t.Fatal(err)
	}

	// Decrypt as bob
	result, err := MultiKeyDecrypt(decoded, bob.PrivateKey)
	if err != nil {
		t.Fatal(err)
	}

	if !bytes.Equal(result, plaintext) {
		t.Fatal("full round-trip failed")
	}
}
