package cmd

import (
	"fmt"
	"os"
	"runtime"
	"strings"

	"github.com/nasimstg/xenvsync/internal/crypto"
)

// loadKey reads the key file, validates its permissions, and decodes it.
// If the key is passphrase-protected (enc: prefix), prompts for the passphrase
// or uses XENVSYNC_PASSPHRASE environment variable.
// The caller should defer crypto.ZeroBytes(key) when done.
func loadKey() ([]byte, error) {
	info, err := os.Stat(keyFile)
	if err != nil {
		return nil, fmt.Errorf("cannot read %s — did you run `xenvsync init`? %w", keyFile, err)
	}

	// On Unix systems, warn if the key file is accessible by group or others.
	if runtime.GOOS != "windows" {
		if perm := info.Mode().Perm(); perm&0077 != 0 {
			fmt.Fprintf(os.Stderr, "WARNING: %s has mode %04o — should be 0600. Run: chmod 600 %s\n", keyFile, perm, keyFile)
		}
	}

	keyData, err := os.ReadFile(keyFile)
	if err != nil {
		return nil, fmt.Errorf("cannot read %s: %w", keyFile, err)
	}

	var keyHex string
	if crypto.IsPassphraseProtected(keyData) {
		// Key is passphrase-protected — decrypt it.
		passphrase := os.Getenv("XENVSYNC_PASSPHRASE")
		if passphrase == "" {
			return nil, fmt.Errorf("key is passphrase-protected — set XENVSYNC_PASSPHRASE or use xenvsync init to create an unprotected key")
		}

		encHex := strings.TrimSpace(string(keyData[4:])) // strip "enc:" prefix
		plaintext, err := crypto.PassphraseDecrypt(passphrase, encHex)
		if err != nil {
			return nil, fmt.Errorf("failed to decrypt key: %w", err)
		}
		keyHex = strings.TrimSpace(string(plaintext))
		crypto.ZeroBytes(plaintext)
	} else {
		keyHex = string(keyData)
	}

	// Zero the raw file data.
	crypto.ZeroBytes(keyData)

	key, err := crypto.DecodeKey(keyHex)
	if err != nil {
		return nil, fmt.Errorf("invalid key in %s: %w", keyFile, err)
	}
	return key, nil
}
