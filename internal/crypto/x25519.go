package crypto

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"

	"golang.org/x/crypto/curve25519"
)

const (
	// X25519KeySize is 32 bytes for X25519 keys.
	X25519KeySize = 32
)

// X25519Keypair holds an X25519 private and public key pair.
type X25519Keypair struct {
	PrivateKey [X25519KeySize]byte
	PublicKey  [X25519KeySize]byte
}

// GenerateKeypair generates a new X25519 keypair using crypto/rand.
func GenerateKeypair() (*X25519Keypair, error) {
	var privateKey [X25519KeySize]byte
	if _, err := io.ReadFull(rand.Reader, privateKey[:]); err != nil {
		return nil, fmt.Errorf("crypto/rand failed: %w", err)
	}

	// Clamp the private key per X25519 spec.
	privateKey[0] &= 248
	privateKey[31] &= 127
	privateKey[31] |= 64

	publicKey, err := curve25519.X25519(privateKey[:], curve25519.Basepoint)
	if err != nil {
		return nil, fmt.Errorf("X25519 scalar multiplication failed: %w", err)
	}

	kp := &X25519Keypair{}
	copy(kp.PrivateKey[:], privateKey[:])
	copy(kp.PublicKey[:], publicKey)

	return kp, nil
}

// EncodePublicKey returns the public key as a base64-encoded string.
func (kp *X25519Keypair) EncodePublicKey() string {
	return base64.StdEncoding.EncodeToString(kp.PublicKey[:])
}

// EncodePrivateKey returns the private key as a base64-encoded string.
func (kp *X25519Keypair) EncodePrivateKey() string {
	return base64.StdEncoding.EncodeToString(kp.PrivateKey[:])
}

// DecodePrivateKey decodes a base64-encoded private key and derives the public key.
func DecodePrivateKey(encoded string) (*X25519Keypair, error) {
	raw, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return nil, fmt.Errorf("invalid base64: %w", err)
	}
	if len(raw) != X25519KeySize {
		return nil, fmt.Errorf("private key must be %d bytes, got %d", X25519KeySize, len(raw))
	}

	kp := &X25519Keypair{}
	copy(kp.PrivateKey[:], raw)

	publicKey, err := curve25519.X25519(kp.PrivateKey[:], curve25519.Basepoint)
	if err != nil {
		return nil, fmt.Errorf("X25519 scalar multiplication failed: %w", err)
	}
	copy(kp.PublicKey[:], publicKey)

	return kp, nil
}

// DecodePublicKey decodes a base64-encoded public key.
func DecodePublicKey(encoded string) ([X25519KeySize]byte, error) {
	var key [X25519KeySize]byte
	raw, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return key, fmt.Errorf("invalid base64: %w", err)
	}
	if len(raw) != X25519KeySize {
		return key, fmt.Errorf("public key must be %d bytes, got %d", X25519KeySize, len(raw))
	}
	copy(key[:], raw)
	return key, nil
}
