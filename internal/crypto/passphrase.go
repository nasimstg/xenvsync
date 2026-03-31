package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"

	"golang.org/x/crypto/scrypt"
)

const (
	// Scrypt parameters for passphrase key derivation.
	scryptN      = 32768
	scryptR      = 8
	scryptP      = 1
	scryptSalt   = 16
	scryptKeyLen = 32 // AES-256
)

// PassphraseEncrypt encrypts data with a passphrase using scrypt + AES-256-GCM.
// Returns hex-encoded string: salt (16 bytes) || nonce (12 bytes) || ciphertext+tag.
func PassphraseEncrypt(passphrase string, plaintext []byte) (string, error) {
	// Generate random salt.
	salt := make([]byte, scryptSalt)
	if _, err := io.ReadFull(rand.Reader, salt); err != nil {
		return "", fmt.Errorf("salt generation failed: %w", err)
	}

	// Derive key from passphrase.
	derivedKey, err := scrypt.Key([]byte(passphrase), salt, scryptN, scryptR, scryptP, scryptKeyLen)
	if err != nil {
		return "", fmt.Errorf("key derivation failed: %w", err)
	}
	defer ZeroBytes(derivedKey)

	// Encrypt with AES-GCM.
	block, err := aes.NewCipher(derivedKey)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nil, nonce, plaintext, nil)

	// Concatenate: salt || nonce || ciphertext+tag.
	result := make([]byte, 0, len(salt)+len(nonce)+len(ciphertext))
	result = append(result, salt...)
	result = append(result, nonce...)
	result = append(result, ciphertext...)

	return hex.EncodeToString(result), nil
}

// PassphraseDecrypt decrypts data encrypted with PassphraseEncrypt.
// Takes hex-encoded ciphertext and returns the plaintext.
func PassphraseDecrypt(passphrase, hexData string) ([]byte, error) {
	data, err := hex.DecodeString(hexData)
	if err != nil {
		return nil, fmt.Errorf("invalid hex encoding: %w", err)
	}

	minLen := scryptSalt + NonceSize // salt + nonce minimum
	if len(data) < minLen {
		return nil, fmt.Errorf("encrypted data too short")
	}

	salt := data[:scryptSalt]
	rest := data[scryptSalt:]

	// Derive key from passphrase.
	derivedKey, err := scrypt.Key([]byte(passphrase), salt, scryptN, scryptR, scryptP, scryptKeyLen)
	if err != nil {
		return nil, fmt.Errorf("key derivation failed: %w", err)
	}
	defer ZeroBytes(derivedKey)

	// Decrypt with AES-GCM.
	block, err := aes.NewCipher(derivedKey)
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := gcm.NonceSize()
	if len(rest) < nonceSize {
		return nil, fmt.Errorf("encrypted data too short for nonce")
	}

	nonce := rest[:nonceSize]
	ciphertext := rest[nonceSize:]

	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, fmt.Errorf("decryption failed — wrong passphrase?")
	}

	return plaintext, nil
}

// IsPassphraseProtected checks if a key file contains passphrase-encrypted data.
// Passphrase-protected keys have the prefix "enc:" followed by hex data.
func IsPassphraseProtected(data []byte) bool {
	return len(data) > 4 && string(data[:4]) == "enc:"
}
