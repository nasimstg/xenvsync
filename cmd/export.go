package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/nasimstg/xenvsync/internal/crypto"
	"github.com/nasimstg/xenvsync/internal/env"
	"github.com/nasimstg/xenvsync/internal/vault"

	"github.com/spf13/cobra"
)

var (
	exportVaultFile string
	exportFormat    string
)

var exportCmd = &cobra.Command{
	Use:   "export",
	Short: "Decrypt vault and output in various formats",
	Long: `Decrypt the vault and write variables to stdout in the specified format.
Output is always written to stdout (never to disk) to preserve security.

Supported formats:
  dotenv      KEY=value (default)
  json        {"KEY": "value", ...}
  yaml        KEY: "value"
  shell       export KEY="value"
  tfvars      KEY = "value"

Examples:
  xenvsync export --format=json
  xenvsync export --format=shell | source
  eval $(xenvsync export --format=shell)
  xenvsync export --format=yaml > /dev/stdout`,
	RunE: runExport,
}

func init() {
	exportCmd.Flags().StringVarP(&exportVaultFile, "vault", "v", defaultVaultFile, "path to the vault file")
	exportCmd.Flags().StringVarP(&exportFormat, "format", "f", "dotenv", "output format: dotenv, json, yaml, shell, tfvars")
	rootCmd.AddCommand(exportCmd)
}

func runExport(cmd *cobra.Command, args []string) error {
	key, err := loadKey()
	if err != nil {
		return err
	}

	vaultRaw, err := os.ReadFile(exportVaultFile)
	if err != nil {
		return fmt.Errorf("cannot read %s: %w", exportVaultFile, err)
	}

	ciphertext, err := vault.Decode(vaultRaw)
	if err != nil {
		return fmt.Errorf("invalid vault format in %s: %w", exportVaultFile, err)
	}

	plaintext, err := crypto.Decrypt(key, ciphertext)
	if err != nil {
		return fmt.Errorf("decryption failed (wrong key?): %w", err)
	}

	pairs, err := env.Parse(plaintext)
	if err != nil {
		return fmt.Errorf("corrupt decrypted payload: %w", err)
	}

	switch exportFormat {
	case "dotenv":
		return formatDotenv(pairs)
	case "json":
		return formatJSON(pairs)
	case "yaml":
		return formatYAML(pairs)
	case "shell":
		return formatShell(pairs)
	case "tfvars":
		return formatTfvars(pairs)
	default:
		return fmt.Errorf("unknown format %q (supported: dotenv, json, yaml, shell, tfvars)", exportFormat)
	}
}

func formatDotenv(pairs []env.Pair) error {
	_, err := os.Stdout.Write(env.Marshal(pairs))
	return err
}

func formatJSON(pairs []env.Pair) error {
	m := make(map[string]string, len(pairs))
	for _, p := range pairs {
		m[p.Key] = p.Value
	}
	enc := json.NewEncoder(os.Stdout)
	enc.SetIndent("", "  ")
	return enc.Encode(m)
}

func formatYAML(pairs []env.Pair) error {
	for _, p := range pairs {
		if needsYAMLQuoting(p.Value) {
			fmt.Fprintf(os.Stdout, "%s: %q\n", p.Key, p.Value)
		} else {
			fmt.Fprintf(os.Stdout, "%s: %s\n", p.Key, p.Value)
		}
	}
	return nil
}

func needsYAMLQuoting(s string) bool {
	if s == "" || s == "true" || s == "false" || s == "null" || s == "~" {
		return true
	}
	if strings.ContainsAny(s, ": \t\n\"'#{}[]|>&!%@`,?") {
		return true
	}
	// Quote if it looks numeric
	if len(s) > 0 && (s[0] >= '0' && s[0] <= '9' || s[0] == '-' || s[0] == '.') {
		return true
	}
	return false
}

func formatShell(pairs []env.Pair) error {
	for _, p := range pairs {
		fmt.Fprintf(os.Stdout, "export %s=%q\n", p.Key, p.Value)
	}
	return nil
}

func formatTfvars(pairs []env.Pair) error {
	for _, p := range pairs {
		fmt.Fprintf(os.Stdout, "%s = %q\n", p.Key, p.Value)
	}
	return nil
}
