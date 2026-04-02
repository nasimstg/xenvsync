package cmd

import (
	"errors"
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

// rootCmd is the base command when called without any subcommands.
var rootCmd = &cobra.Command{
	Use:   "xenvsync",
	Short: "Securely encrypt, sync, and inject environment variables",
	Long: `xenvsync is a cross-platform CLI tool that encrypts .env files into
.env.vault using AES-256-GCM, allowing you to safely commit secrets
to version control while keeping the decryption key strictly local.`,
}

// Execute runs the root command. Called from main.go.
func Execute() error {
	if err := rootCmd.Execute(); err != nil {
		var quiet quietError
		if !(errors.As(err, &quiet) && quiet.Quiet()) {
			fmt.Fprintln(os.Stderr, err)
		}
		return err
	}
	return nil
}
