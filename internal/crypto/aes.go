// Package crypto provides AES-256-GCM encryption and decryption
// along with secure key generation for xenvsync.
//
// Cryptographic flow:
//   1. Key generation: 32 random bytes via crypto/rand, hex-encoded for storage.
//   2. Encryption: A fresh 12-byte nonce is generated per Encrypt call.
//      The nonce is prepended to the ciphertext so Decrypt can extract it.
//      Layout: [nonce (12 bytes) | ciphertext + GCM tag]
//   3. Decryption: Splits the nonce from the payload and authenticates + decrypts.
//
// The key file (.xenvsync.key) is NEVER embedded in the ciphertext output.
package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"strings"
)

const (
	// KeySize is 32 bytes for AES-256.
	KeySize = 32
	// NonceSize is 12 bytes, the standard size for GCM nonces.
	NonceSize = 12
)

// GenerateKey creates a cryptographically secure 256-bit key
// and returns it as a hex-encoded string.
func GenerateKey() (string, error) {
	key := make([]byte, KeySize)
	if _, err := io.ReadFull(rand.Reader, key); err != nil {
		return "", fmt.Errorf("crypto/rand failed: %w", err)
	}
	return hex.EncodeToString(key), nil
}

// DecodeKey converts a hex-encoded key string back to raw bytes.
// It validates that the key is exactly 32 bytes (256 bits).
func DecodeKey(hexKey string) ([]byte, error) {
	hexKey = strings.TrimSpace(hexKey)
	key, err := hex.DecodeString(hexKey)
	if err != nil {
		return nil, fmt.Errorf("key is not valid hex: %w", err)
	}
	if len(key) != KeySize {
		return nil, fmt.Errorf("key must be %d bytes, got %d", KeySize, len(key))
	}
	return key, nil
}

// Encrypt encrypts plaintext using AES-256-GCM.
// A unique nonce is generated for each call and prepended to the output.
// Returns: [nonce (12 bytes) | ciphertext + GCM auth tag]
func Encrypt(key, plaintext []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("aes.NewCipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("cipher.NewGCM: %w", err)
	}

	// Generate a random nonce. Never reuse a nonce with the same key.
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, fmt.Errorf("nonce generation failed: %w", err)
	}

	// Seal appends the ciphertext (with auth tag) after the nonce.
	sealed := gcm.Seal(nonce, nonce, plaintext, nil)
	return sealed, nil
}

// Decrypt decrypts data produced by Encrypt.
// It expects the nonce prepended to the ciphertext.
func Decrypt(key, data []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("aes.NewCipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("cipher.NewGCM: %w", err)
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return nil, fmt.Errorf("ciphertext too short (less than nonce size)")
	}

	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, fmt.Errorf("decryption/authentication failed: %w", err)
	}

	return plaintext, nil
}
