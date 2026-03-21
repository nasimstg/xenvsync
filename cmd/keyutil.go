package cmd

import (
	"fmt"
	"os"
	"runtime"

	"github.com/nasimstg/xenvsync/internal/crypto"
)

// loadKey reads the key file, validates its permissions, and decodes it.
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

	keyHex, err := os.ReadFile(keyFile)
	if err != nil {
		return nil, fmt.Errorf("cannot read %s: %w", keyFile, err)
	}

	key, err := crypto.DecodeKey(string(keyHex))
	if err != nil {
		return nil, fmt.Errorf("invalid key in %s: %w", keyFile, err)
	}
	return key, nil
}
