package cmd

import (
	"fmt"
	"os"
	"strings"

	"github.com/nasimstg/xenvsync/internal/crypto"

	"github.com/spf13/cobra"
)

var whoamiCmd = &cobra.Command{
	Use:   "whoami",
	Short: "Display your public key and identity path",
	Long: `Reads your X25519 private key from ~/.xenvsync/identity, derives the
public key, and prints it in a copy-paste-friendly format.`,
	RunE: runWhoami,
}

func init() {
	rootCmd.AddCommand(whoamiCmd)
}

func runWhoami(cmd *cobra.Command, args []string) error {
	idPath, err := identityPath()
	if err != nil {
		return err
	}

	raw, err := os.ReadFile(idPath)
	if err != nil {
		return fmt.Errorf("no identity found — run `xenvsync keygen` first")
	}

	kp, err := crypto.DecodePrivateKey(strings.TrimSpace(string(raw)))
	if err != nil {
		return fmt.Errorf("invalid identity in %s: %w", idPath, err)
	}

	fmt.Printf("Identity:   %s\n", idPath)
	fmt.Printf("Public key: %s\n", kp.EncodePublicKey())
	return nil
}
