package cmd

import (
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"syscall"

	"github.com/nasimstg/xenvsync/internal/crypto"
	"github.com/nasimstg/xenvsync/internal/env"
	"github.com/nasimstg/xenvsync/internal/vault"

	"github.com/spf13/cobra"
)

var runVaultFile string

var runCmd = &cobra.Command{
	Use:   "run -- <command> [args...]",
	Short: "Run a command with decrypted env vars injected",
	Long: `Decrypts .env.vault in-memory and spawns a child process with the
decrypted variables merged into the current environment. The plaintext
secrets never touch disk — they exist only in the child process's
memory space.

Example:
  xenvsync run -- python app.py
  xenvsync run -- npm start`,
	DisableFlagParsing: false,
	RunE:               runRun,
}

func init() {
	runCmd.Flags().StringVarP(&runVaultFile, "vault", "v", defaultVaultFile, "path to the vault file")
	rootCmd.AddCommand(runCmd)
}

func runRun(cmd *cobra.Command, args []string) error {
	// Everything after "--" is the child command.
	if len(args) == 0 {
		return fmt.Errorf("no command specified — usage: xenvsync run -- <command> [args...]")
	}

	// 1. Load and decode the key (validates permissions).
	key, err := loadKey()
	if err != nil {
		return err
	}

	// 2. Read and decrypt the vault (in-memory only).
	vaultRaw, err := os.ReadFile(runVaultFile)
	if err != nil {
		return fmt.Errorf("cannot read %s: %w", runVaultFile, err)
	}
	ciphertext, err := vault.Decode(vaultRaw)
	if err != nil {
		return fmt.Errorf("invalid vault format: %w", err)
	}
	plaintext, err := crypto.Decrypt(key, ciphertext)
	if err != nil {
		return fmt.Errorf("decryption failed: %w", err)
	}

	// 3. Parse decrypted vars.
	pairs, err := env.Parse(plaintext)
	if err != nil {
		return fmt.Errorf("corrupt vault payload: %w", err)
	}

	// 4. Build the child environment: current OS env + decrypted vars.
	childEnv := os.Environ()
	for _, p := range pairs {
		childEnv = append(childEnv, p.Key+"="+p.Value)
	}

	// 5. Spawn the child process.
	binary, err := exec.LookPath(args[0])
	if err != nil {
		return fmt.Errorf("command not found: %s", args[0])
	}

	child := exec.Command(binary, args[1:]...)
	child.Env = childEnv
	child.Stdin = os.Stdin
	child.Stdout = os.Stdout
	child.Stderr = os.Stderr

	// Forward signals to the child so Ctrl-C works as expected.
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		for sig := range sigCh {
			if child.Process != nil {
				_ = child.Process.Signal(sig)
			}
		}
	}()

	if err := child.Run(); err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			os.Exit(exitErr.ExitCode())
		}
		return fmt.Errorf("failed to run command: %w", err)
	}

	return nil
}
