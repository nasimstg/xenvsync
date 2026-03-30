package crypto

import (
	"bytes"
	"testing"
)

func TestSharedSecret_Symmetric(t *testing.T) {
	alice, _ := GenerateKeypair()
	bob, _ := GenerateKeypair()

	s1, err := SharedSecret(alice.PrivateKey, bob.PublicKey)
	if err != nil {
		t.Fatal(err)
	}
	s2, err := SharedSecret(bob.PrivateKey, alice.PublicKey)
	if err != nil {
		t.Fatal(err)
	}

	if s1 != s2 {
		t.Fatal("shared secrets don't match")
	}
}

func TestSealOpenKeySlot_RoundTrip(t *testing.T) {
	recipient, _ := GenerateKeypair()
	symmetricKey := []byte("0123456789abcdef0123456789abcdef") // 32 bytes

	ephPub, encKey, err := SealKeySlot(recipient.PublicKey, symmetricKey)
	if err != nil {
		t.Fatal(err)
	}

	decrypted, err := OpenKeySlot(recipient.PrivateKey, ephPub, encKey)
	if err != nil {
		t.Fatal(err)
	}

	if !bytes.Equal(decrypted, symmetricKey) {
		t.Fatal("decrypted key doesn't match original")
	}
}

func TestOpenKeySlot_WrongKey(t *testing.T) {
	recipient, _ := GenerateKeypair()
	wrong, _ := GenerateKeypair()
	symmetricKey := []byte("0123456789abcdef0123456789abcdef")

	ephPub, encKey, _ := SealKeySlot(recipient.PublicKey, symmetricKey)

	_, err := OpenKeySlot(wrong.PrivateKey, ephPub, encKey)
	if err == nil {
		t.Fatal("expected error with wrong private key")
	}
}

func TestSealKeySlot_UniqueEphemeral(t *testing.T) {
	recipient, _ := GenerateKeypair()
	key := []byte("0123456789abcdef0123456789abcdef")

	eph1, _, _ := SealKeySlot(recipient.PublicKey, key)
	eph2, _, _ := SealKeySlot(recipient.PublicKey, key)

	if eph1 == eph2 {
		t.Fatal("ephemeral keys should be unique per seal")
	}
}
