package cmd

import (
	"fmt"
	"os"
	"strings"

	"github.com/nasimstg/xenvsync/internal/crypto"
	"github.com/nasimstg/xenvsync/internal/env"
	"github.com/nasimstg/xenvsync/internal/team"
	"github.com/nasimstg/xenvsync/internal/vault"
)

// decryptVault reads a vault file and decrypts it, handling both V1 and V2 formats.
// For V1 vaults it uses the symmetric key from .xenvsync.key.
// For V2 vaults it uses the user's X25519 identity to open a key slot.
func decryptVault(vaultPath string) ([]byte, error) {
	vaultRaw, err := os.ReadFile(vaultPath)
	if err != nil {
		return nil, fmt.Errorf("cannot read %s: %w", vaultPath, err)
	}
	return decryptVaultBytes(vaultRaw)
}

// decryptVaultBytes decrypts raw vault data, handling both V1 and V2 formats.
// This is useful when vault content comes from sources other than a file (e.g., git show).
func decryptVaultBytes(vaultRaw []byte) ([]byte, error) {
	if vault.IsV2(vaultRaw) {
		return decryptV2(vaultRaw)
	}
	return decryptV1(vaultRaw)
}

func decryptV1(vaultRaw []byte) ([]byte, error) {
	key, err := loadKey()
	if err != nil {
		return nil, err
	}
	defer crypto.ZeroBytes(key)

	ciphertext, err := vault.Decode(vaultRaw)
	if err != nil {
		return nil, fmt.Errorf("invalid vault format: %w", err)
	}

	plaintext, err := crypto.Decrypt(key, ciphertext)
	if err != nil {
		return nil, fmt.Errorf("decryption failed (wrong key?): %w", err)
	}
	return plaintext, nil
}

func decryptV2(vaultRaw []byte) ([]byte, error) {
	v2, err := vault.DecodeV2(vaultRaw)
	if err != nil {
		return nil, fmt.Errorf("invalid V2 vault: %w", err)
	}

	idPath, err := identityPath()
	if err != nil {
		return nil, err
	}

	raw, err := os.ReadFile(idPath)
	if err != nil {
		return nil, fmt.Errorf("no identity found — run `xenvsync keygen` first")
	}

	kp, err := crypto.DecodePrivateKey(strings.TrimSpace(string(raw)))
	if err != nil {
		return nil, fmt.Errorf("invalid identity in %s: %w", idPath, err)
	}

	plaintext, err := crypto.MultiKeyDecrypt(v2, kp.PrivateKey)
	if err != nil {
		return nil, err
	}
	return plaintext, nil
}

// encryptForTeam encrypts plaintext using the team roster (V2 format).
// Returns encoded vault data ready to write.
func encryptForTeam(roster *team.Roster, plaintext []byte) ([]byte, error) {
	recipients := make([]crypto.Recipient, 0, len(roster.Members))
	for _, m := range roster.Members {
		pubKey, err := crypto.DecodePublicKey(m.PublicKey)
		if err != nil {
			return nil, fmt.Errorf("invalid public key for %s: %w", m.Name, err)
		}
		recipients = append(recipients, crypto.Recipient{
			Name:      m.Name,
			PublicKey: pubKey,
		})
	}

	slots, ciphertext, err := crypto.MultiKeyEncrypt(recipients, plaintext)
	if err != nil {
		return nil, fmt.Errorf("multi-key encryption failed: %w", err)
	}

	vaultData, err := vault.EncodeV2(slots, ciphertext)
	if err != nil {
		return nil, err
	}
	return vaultData, nil
}

// decryptVaultPairs is a convenience that decrypts and parses the vault into env pairs.
func decryptVaultPairs(vaultPath string) ([]env.Pair, error) {
	plaintext, err := decryptVault(vaultPath)
	if err != nil {
		return nil, err
	}
	return env.Parse(plaintext)
}
