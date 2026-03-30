package cmd

import (
	"fmt"
	"text/tabwriter"

	"github.com/nasimstg/xenvsync/internal/crypto"
	"github.com/nasimstg/xenvsync/internal/team"

	"github.com/spf13/cobra"
)

var teamCmd = &cobra.Command{
	Use:   "team",
	Short: "Manage team members' public keys for vault encryption",
	Long: `The team command manages a project-local roster of team members
and their X25519 public keys. The roster is stored in .xenvsync-team.json
and should be committed to version control.

Use 'team add' to register a member, 'team remove' to revoke access,
and 'team list' to display the current roster.`,
}

var teamAddCmd = &cobra.Command{
	Use:   "add <name> <public-key>",
	Short: "Add a team member's public key to the roster",
	Long: `Registers a team member by name and their X25519 public key
(base64-encoded, as shown by 'xenvsync whoami').`,
	Args: cobra.ExactArgs(2),
	RunE: runTeamAdd,
}

var teamRemoveCmd = &cobra.Command{
	Use:   "remove <name>",
	Short: "Remove a team member from the roster",
	Args:  cobra.ExactArgs(1),
	RunE:  runTeamRemove,
}

var teamListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all team members and their public keys",
	RunE:  runTeamList,
}

func init() {
	teamCmd.AddCommand(teamAddCmd)
	teamCmd.AddCommand(teamRemoveCmd)
	teamCmd.AddCommand(teamListCmd)
	rootCmd.AddCommand(teamCmd)
}

func runTeamAdd(cmd *cobra.Command, args []string) error {
	name, pubKeyStr := args[0], args[1]

	// Validate the public key is well-formed.
	if _, err := crypto.DecodePublicKey(pubKeyStr); err != nil {
		return fmt.Errorf("invalid public key: %w", err)
	}

	roster, err := team.Load(team.RosterFile)
	if err != nil {
		return err
	}

	if err := roster.Add(name, pubKeyStr); err != nil {
		return err
	}

	if err := roster.Save(team.RosterFile); err != nil {
		return err
	}

	fmt.Printf("Added %s to team roster (%s)\n", name, team.RosterFile)
	fmt.Printf("  Public key: %s\n", pubKeyStr)
	fmt.Printf("\nRoster now has %d member(s).\n", len(roster.Members))
	return nil
}

func runTeamRemove(cmd *cobra.Command, args []string) error {
	name := args[0]

	roster, err := team.Load(team.RosterFile)
	if err != nil {
		return err
	}

	if err := roster.Remove(name); err != nil {
		return err
	}

	if err := roster.Save(team.RosterFile); err != nil {
		return err
	}

	fmt.Printf("Removed %s from team roster\n", name)
	fmt.Printf("Roster now has %d member(s).\n", len(roster.Members))
	return nil
}

func runTeamList(cmd *cobra.Command, args []string) error {
	roster, err := team.Load(team.RosterFile)
	if err != nil {
		return err
	}

	if len(roster.Members) == 0 {
		fmt.Println("No team members yet. Use 'xenvsync team add <name> <public-key>' to get started.")
		return nil
	}

	fmt.Printf("Team roster (%d member(s)):\n", len(roster.Members))

	w := tabwriter.NewWriter(cmd.OutOrStdout(), 0, 0, 2, ' ', 0)
	_, _ = fmt.Fprintln(w, "  NAME\tPUBLIC KEY\tADDED")
	for _, m := range roster.Members {
		_, _ = fmt.Fprintf(w, "  %s\t%s\t%s\n", m.Name, m.PublicKey, m.AddedAt.Format("2006-01-02"))
	}
	_ = w.Flush()
	return nil
}
