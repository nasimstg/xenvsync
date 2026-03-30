package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/nasimstg/xenvsync/internal/crypto"

	"github.com/spf13/cobra"
)

var keygenForce bool

var keygenCmd = &cobra.Command{
	Use:   "keygen",
	Short: "Generate an X25519 keypair for team vault encryption",
	Long: `Generates an X25519 keypair and stores the private key in
~/.xenvsync/identity with restricted permissions (0600).
The public key is printed to stdout for sharing with teammates.

This identity is user-global (not per-project). Use 'xenvsync whoami'
to display your public key later.`,
	RunE: runKeygen,
}

func init() {
	keygenCmd.Flags().BoolVarP(&keygenForce, "force", "f", false, "overwrite existing identity")
	rootCmd.AddCommand(keygenCmd)
}

func identityDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("cannot determine home directory: %w", err)
	}
	return filepath.Join(home, ".xenvsync"), nil
}

func identityPath() (string, error) {
	dir, err := identityDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, "identity"), nil
}

func runKeygen(cmd *cobra.Command, args []string) error {
	idPath, err := identityPath()
	if err != nil {
		return err
	}

	// Guard: don't overwrite unless --force.
	if _, err := os.Stat(idPath); err == nil && !keygenForce {
		return fmt.Errorf("identity already exists at %s — use --force to overwrite", idPath)
	}

	// Generate keypair.
	kp, err := crypto.GenerateKeypair()
	if err != nil {
		return fmt.Errorf("keypair generation failed: %w", err)
	}

	// Ensure ~/.xenvsync/ exists.
	dir := filepath.Dir(idPath)
	if err := os.MkdirAll(dir, 0700); err != nil {
		return fmt.Errorf("cannot create %s: %w", dir, err)
	}

	// Write private key with restricted permissions.
	if err := os.WriteFile(idPath, []byte(kp.EncodePrivateKey()+"\n"), 0600); err != nil {
		return fmt.Errorf("failed to write %s: %w", idPath, err)
	}

	fmt.Printf("Generated X25519 identity → %s (mode 0600)\n", idPath)
	fmt.Printf("\nYour public key:\n  %s\n", kp.EncodePublicKey())
	fmt.Println("\nShare this public key with your team to be added to project vaults.")
	return nil
}
