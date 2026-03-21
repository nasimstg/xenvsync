package cmd

import (
	"fmt"
	"os"
	"strings"

	"github.com/nasimstg/xenvsync/internal/crypto"

	"github.com/spf13/cobra"
)

const (
	keyFile       = ".xenvsync.key"
	gitignoreFile = ".gitignore"
)

var forceInit bool

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize xenvsync in the current directory",
	Long: `Generates a new AES-256 symmetric key, saves it to .xenvsync.key
with restricted file permissions (0600), and ensures the key file
is listed in .gitignore so it is never committed.

Use --force to regenerate the key even if one already exists.`,
	RunE: runInit,
}

func init() {
	initCmd.Flags().BoolVarP(&forceInit, "force", "f", false, "overwrite existing key file")
	rootCmd.AddCommand(initCmd)
}

func runInit(cmd *cobra.Command, args []string) error {
	// Guard: do not overwrite an existing key unless --force is set.
	if _, err := os.Stat(keyFile); err == nil && !forceInit {
		return fmt.Errorf("%s already exists — use --force to overwrite", keyFile)
	}

	// Generate a cryptographically secure 256-bit key.
	key, err := crypto.GenerateKey()
	if err != nil {
		return fmt.Errorf("failed to generate key: %w", err)
	}

	// Write the key with owner-only permissions (0600).
	if err := os.WriteFile(keyFile, []byte(key), 0600); err != nil {
		return fmt.Errorf("failed to write %s: %w", keyFile, err)
	}
	fmt.Printf("Generated encryption key → %s (mode 0600)\n", keyFile)

	// Ensure .xenvsync.key and .env are in .gitignore.
	if err := ensureGitignore(keyFile, ".env"); err != nil {
		return fmt.Errorf("failed to update %s: %w", gitignoreFile, err)
	}
	fmt.Printf("Updated %s (added %s, .env)\n", gitignoreFile, keyFile)

	return nil
}

// ensureGitignore appends entries to .gitignore if they are not already present.
func ensureGitignore(entries ...string) error {
	existing, _ := os.ReadFile(gitignoreFile) // ignore error; file may not exist yet
	content := string(existing)

	var toAdd []string
	for _, entry := range entries {
		if !strings.Contains(content, entry) {
			toAdd = append(toAdd, entry)
		}
	}
	if len(toAdd) == 0 {
		return nil
	}

	f, err := os.OpenFile(gitignoreFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer func() { _ = f.Close() }()

	// Add a newline separator if the file doesn't end with one.
	if len(content) > 0 && !strings.HasSuffix(content, "\n") {
		if _, err := f.WriteString("\n"); err != nil {
			return err
		}
	}

	for _, entry := range toAdd {
		if _, err := fmt.Fprintln(f, entry); err != nil {
			return err
		}
	}
	return nil
}
