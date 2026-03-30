package crypto

import (
	"testing"
)

func TestGenerateKeypair(t *testing.T) {
	kp, err := GenerateKeypair()
	if err != nil {
		t.Fatalf("GenerateKeypair: %v", err)
	}

	// Keys should not be all zeros.
	var zero [X25519KeySize]byte
	if kp.PrivateKey == zero {
		t.Fatal("private key is all zeros")
	}
	if kp.PublicKey == zero {
		t.Fatal("public key is all zeros")
	}

	// Public key should differ from private key.
	if kp.PublicKey == kp.PrivateKey {
		t.Fatal("public and private key are identical")
	}
}

func TestGenerateKeypair_Unique(t *testing.T) {
	kp1, _ := GenerateKeypair()
	kp2, _ := GenerateKeypair()
	if kp1.PrivateKey == kp2.PrivateKey {
		t.Fatal("two generated keypairs have the same private key")
	}
}

func TestKeypair_EncodeDecodeRoundTrip(t *testing.T) {
	original, err := GenerateKeypair()
	if err != nil {
		t.Fatal(err)
	}

	encoded := original.EncodePrivateKey()
	restored, err := DecodePrivateKey(encoded)
	if err != nil {
		t.Fatalf("DecodePrivateKey: %v", err)
	}

	if original.PrivateKey != restored.PrivateKey {
		t.Fatal("private keys differ after round-trip")
	}
	if original.PublicKey != restored.PublicKey {
		t.Fatal("public keys differ after round-trip")
	}
}

func TestDecodePrivateKey_Invalid(t *testing.T) {
	if _, err := DecodePrivateKey("not-base64!!!"); err == nil {
		t.Fatal("expected error for invalid base64")
	}

	if _, err := DecodePrivateKey("dG9vc2hvcnQ="); err == nil {
		t.Fatal("expected error for wrong key length")
	}
}

func TestDecodePublicKey_RoundTrip(t *testing.T) {
	kp, _ := GenerateKeypair()
	encoded := kp.EncodePublicKey()

	decoded, err := DecodePublicKey(encoded)
	if err != nil {
		t.Fatalf("DecodePublicKey: %v", err)
	}

	if decoded != kp.PublicKey {
		t.Fatal("public key differs after round-trip")
	}
}

func TestDecodePublicKey_Invalid(t *testing.T) {
	if _, err := DecodePublicKey("not-base64!!!"); err == nil {
		t.Fatal("expected error for invalid base64")
	}

	if _, err := DecodePublicKey("dG9vc2hvcnQ="); err == nil {
		t.Fatal("expected error for wrong key length")
	}
}
