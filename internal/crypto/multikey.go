package crypto

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"

	"github.com/nasimstg/xenvsync/internal/vault"
)

// Recipient represents a team member for multi-key encryption.
type Recipient struct {
	Name      string
	PublicKey [X25519KeySize]byte
}

// MultiKeyEncrypt encrypts plaintext for multiple recipients.
// It generates a random ephemeral symmetric key, encrypts the data with it,
// then seals the symmetric key for each recipient using their X25519 public key.
func MultiKeyEncrypt(recipients []Recipient, plaintext []byte) ([]vault.KeySlot, []byte, error) {
	if len(recipients) == 0 {
		return nil, nil, fmt.Errorf("at least one recipient is required")
	}

	// Generate a random ephemeral symmetric key.
	symKey := make([]byte, KeySize)
	if _, err := io.ReadFull(rand.Reader, symKey); err != nil {
		return nil, nil, fmt.Errorf("crypto/rand failed: %w", err)
	}

	// Encrypt the data with the symmetric key.
	ciphertext, err := Encrypt(symKey, plaintext)
	if err != nil {
		return nil, nil, fmt.Errorf("data encryption failed: %w", err)
	}

	// Create a key slot for each recipient.
	slots := make([]vault.KeySlot, 0, len(recipients))
	for _, r := range recipients {
		ephPub, encKey, err := SealKeySlot(r.PublicKey, symKey)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to seal key for %s: %w", r.Name, err)
		}
		slots = append(slots, vault.KeySlot{
			Name:         r.Name,
			EphemeralPub: base64.StdEncoding.EncodeToString(ephPub[:]),
			EncryptedKey: base64.StdEncoding.EncodeToString(encKey),
		})
	}

	return slots, ciphertext, nil
}

// MultiKeyDecrypt decrypts a V2 vault using the recipient's private key.
// It searches the key slots to find one that can be decrypted with the given identity.
func MultiKeyDecrypt(v2 *vault.V2Vault, privateKey [X25519KeySize]byte) ([]byte, error) {
	for _, slot := range v2.Slots {
		ephPubBytes, err := base64.StdEncoding.DecodeString(slot.EphemeralPub)
		if err != nil {
			continue
		}
		encKeyBytes, err := base64.StdEncoding.DecodeString(slot.EncryptedKey)
		if err != nil {
			continue
		}

		var ephPub [X25519KeySize]byte
		if len(ephPubBytes) != X25519KeySize {
			continue
		}
		copy(ephPub[:], ephPubBytes)

		symKey, err := OpenKeySlot(privateKey, ephPub, encKeyBytes)
		if err != nil {
			continue // Wrong key for this slot; try the next one.
		}

		// Decrypt the data with the recovered symmetric key.
		plaintext, err := Decrypt(symKey, v2.Ciphertext)
		if err != nil {
			continue // Symmetric key didn't work; try next slot.
		}

		return plaintext, nil
	}

	return nil, fmt.Errorf("no matching key slot found — your identity is not in the team roster")
}
