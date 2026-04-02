package cmd

import (
	"bytes"
	"fmt"
	"os/exec"
	"strings"

	"github.com/nasimstg/xenvsync/internal/crypto"
	"github.com/nasimstg/xenvsync/internal/env"
	"github.com/spf13/cobra"
)

var (
	logEnvName    string
	logShowValues bool
	logLimit      int
)

var logCmd = &cobra.Command{
	Use:   "log",
	Short: "Show vault change history from Git commits",
	Long: `Parses Git history for commits that modified the vault file and displays
a timeline of changes. For each commit, shows which keys were added,
modified, or removed.

By default, only key names are shown (values are hidden). Use
--show-values to display actual decrypted values.

Requires a Git repository.`,
	RunE: runLog,
}

func init() {
	logCmd.Flags().StringVar(&logEnvName, "env", "", "environment name (e.g., staging, production)")
	logCmd.Flags().BoolVar(&logShowValues, "show-values", false, "display actual values in output (sensitive)")
	logCmd.Flags().IntVarP(&logLimit, "limit", "n", 10, "maximum number of commits to show")
	rootCmd.AddCommand(logCmd)
}

type logEntry struct {
	Hash    string
	Author  string
	Date    string
	Subject string
}

func runLog(cmd *cobra.Command, args []string) error {
	// Verify we're inside a git repo.
	if err := exec.Command("git", "rev-parse", "--is-inside-work-tree").Run(); err != nil {
		return fmt.Errorf("xenvsync log requires a Git repository")
	}

	envName, err := resolveEnvName(logEnvName)
	if err != nil {
		return err
	}
	vFile := defaultVaultFile
	if envName != "" {
		vFile = vaultFilePath(envName)
	}

	// Get commits that touched the vault file.
	entries, err := gitLogForFile(vFile, logLimit)
	if err != nil {
		return err
	}

	if len(entries) == 0 {
		fmt.Printf("No commits found for %s.\n", vFile)
		return nil
	}

	fmt.Printf("Vault history for %s (%d commit(s)):\n\n", vFile, len(entries))

	for i, entry := range entries {
		fmt.Printf("commit %s (%s, %s)\n", entry.Hash, entry.Date, entry.Author)
		fmt.Printf("  %s\n", entry.Subject)

		// Try to diff this commit against its parent.
		current := gitShowFile(entry.Hash, vFile)
		parent := gitShowFile(entry.Hash+"~1", vFile)

		currentPairs := tryDecryptToPairs(current)
		parentPairs := tryDecryptToPairs(parent)

		if currentPairs == nil && parentPairs == nil {
			fmt.Println("  (unable to decrypt vault at this commit)")
		} else {
			if currentPairs == nil {
				currentPairs = []env.Pair{}
			}
			if parentPairs == nil {
				parentPairs = []env.Pair{}
			}

			changes := computeKeyChanges(parentPairs, currentPairs)
			if len(changes) == 0 {
				fmt.Println("  (no key-level changes)")
			} else {
				formatted := formatKeyChanges(changes, logShowValues, "new", "old")
				for _, line := range strings.Split(strings.TrimRight(formatted, "\n"), "\n") {
					fmt.Printf("  %s\n", line)
				}
				fmt.Printf("  %s\n", changeSummary(changes))
			}
		}

		if i < len(entries)-1 {
			fmt.Println()
		}
	}

	return nil
}

// gitLogForFile returns commit entries that touched the given file.
func gitLogForFile(file string, limit int) ([]logEntry, error) {
	out, err := exec.Command(
		"git", "log",
		fmt.Sprintf("-n%d", limit),
		"--pretty=format:%h|%an|%ad|%s",
		"--date=short",
		"--follow",
		"--", file,
	).Output()
	if err != nil {
		return nil, fmt.Errorf("git log failed: %w", err)
	}

	if len(bytes.TrimSpace(out)) == 0 {
		return nil, nil
	}

	var entries []logEntry
	for _, line := range strings.Split(strings.TrimSpace(string(out)), "\n") {
		parts := strings.SplitN(line, "|", 4)
		if len(parts) < 4 {
			continue
		}
		entries = append(entries, logEntry{
			Hash:    parts[0],
			Author:  parts[1],
			Date:    parts[2],
			Subject: parts[3],
		})
	}
	return entries, nil
}

// gitShowFile retrieves a file's content at a specific commit.
// Returns nil if the file doesn't exist at that commit.
func gitShowFile(ref, file string) []byte {
	out, err := exec.Command("git", "show", ref+":"+file).Output()
	if err != nil {
		return nil
	}
	return out
}

// tryDecryptToPairs attempts to decrypt raw vault data and parse it into pairs.
// Returns nil if decryption or parsing fails (e.g., rotated key, corrupt data).
func tryDecryptToPairs(vaultRaw []byte) []env.Pair {
	if vaultRaw == nil {
		return nil
	}
	plaintext, err := decryptVaultBytes(vaultRaw)
	if err != nil {
		return nil
	}
	defer crypto.ZeroBytes(plaintext)
	pairs, err := env.Parse(plaintext)
	if err != nil {
		return nil
	}
	return pairs
}
