package crypto

import (
	"crypto/rand"
	"crypto/sha256"
	"fmt"
	"io"

	"golang.org/x/crypto/curve25519"
)

// SharedSecret performs X25519 ECDH and returns a 32-byte shared secret
// derived by hashing the raw shared point with SHA-256.
func SharedSecret(privateKey, publicKey [X25519KeySize]byte) ([KeySize]byte, error) {
	raw, err := curve25519.X25519(privateKey[:], publicKey[:])
	if err != nil {
		return [KeySize]byte{}, fmt.Errorf("X25519 ECDH failed: %w", err)
	}
	// Hash the raw shared point to produce a uniformly distributed key.
	return sha256.Sum256(raw), nil
}

// SealKeySlot encrypts a symmetric key for a recipient using an ephemeral keypair.
// Returns the ephemeral public key and the encrypted symmetric key.
func SealKeySlot(recipientPub [X25519KeySize]byte, symmetricKey []byte) (ephemeralPub [X25519KeySize]byte, encryptedKey []byte, err error) {
	// Generate ephemeral keypair.
	var ephPriv [X25519KeySize]byte
	if _, err := io.ReadFull(rand.Reader, ephPriv[:]); err != nil {
		return [X25519KeySize]byte{}, nil, fmt.Errorf("crypto/rand failed: %w", err)
	}
	ephPriv[0] &= 248
	ephPriv[31] &= 127
	ephPriv[31] |= 64

	ephPubBytes, err := curve25519.X25519(ephPriv[:], curve25519.Basepoint)
	if err != nil {
		return [X25519KeySize]byte{}, nil, fmt.Errorf("ephemeral pubkey derivation failed: %w", err)
	}
	copy(ephemeralPub[:], ephPubBytes)

	// Derive shared secret.
	shared, err := SharedSecret(ephPriv, recipientPub)
	if err != nil {
		return [X25519KeySize]byte{}, nil, err
	}

	// Encrypt the symmetric key with the shared secret.
	encryptedKey, err = Encrypt(shared[:], symmetricKey)
	if err != nil {
		return [X25519KeySize]byte{}, nil, fmt.Errorf("key slot encryption failed: %w", err)
	}

	return ephemeralPub, encryptedKey, nil
}

// OpenKeySlot decrypts a key slot using the recipient's private key.
func OpenKeySlot(recipientPriv [X25519KeySize]byte, ephemeralPub [X25519KeySize]byte, encryptedKey []byte) ([]byte, error) {
	shared, err := SharedSecret(recipientPriv, ephemeralPub)
	if err != nil {
		return nil, err
	}

	symmetricKey, err := Decrypt(shared[:], encryptedKey)
	if err != nil {
		return nil, fmt.Errorf("key slot decryption failed (wrong identity?): %w", err)
	}

	return symmetricKey, nil
}
