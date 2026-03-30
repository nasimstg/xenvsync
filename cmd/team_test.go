package cmd

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/nasimstg/xenvsync/internal/crypto"
	"github.com/nasimstg/xenvsync/internal/team"
)

func TestTeamAdd(t *testing.T) {
	dir := t.TempDir()
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}

	kp, _ := crypto.GenerateKeypair()
	pubKey := kp.EncodePublicKey()

	rootCmd.SetArgs([]string{"team", "add", "alice", pubKey})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("team add failed: %v", err)
	}

	// Verify roster file exists and has correct content.
	roster, err := team.Load(filepath.Join(dir, team.RosterFile))
	if err != nil {
		t.Fatal(err)
	}
	if len(roster.Members) != 1 {
		t.Fatalf("expected 1 member, got %d", len(roster.Members))
	}
	if roster.Members[0].Name != "alice" {
		t.Fatalf("name = %q, want alice", roster.Members[0].Name)
	}
	if roster.Members[0].PublicKey != pubKey {
		t.Fatalf("public key mismatch")
	}
}

func TestTeamAdd_InvalidKey(t *testing.T) {
	dir := t.TempDir()
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}

	rootCmd.SetArgs([]string{"team", "add", "bob", "not-a-valid-key"})
	if err := rootCmd.Execute(); err == nil {
		t.Fatal("expected error for invalid public key")
	}
}

func TestTeamAdd_DuplicateName(t *testing.T) {
	dir := t.TempDir()
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}

	kp1, _ := crypto.GenerateKeypair()
	kp2, _ := crypto.GenerateKeypair()

	rootCmd.SetArgs([]string{"team", "add", "alice", kp1.EncodePublicKey()})
	_ = rootCmd.Execute()

	rootCmd.SetArgs([]string{"team", "add", "alice", kp2.EncodePublicKey()})
	if err := rootCmd.Execute(); err == nil {
		t.Fatal("expected error for duplicate name")
	}
}

func TestTeamRemove(t *testing.T) {
	dir := t.TempDir()
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}

	kp, _ := crypto.GenerateKeypair()

	rootCmd.SetArgs([]string{"team", "add", "alice", kp.EncodePublicKey()})
	_ = rootCmd.Execute()

	rootCmd.SetArgs([]string{"team", "remove", "alice"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("team remove failed: %v", err)
	}

	roster, _ := team.Load(filepath.Join(dir, team.RosterFile))
	if len(roster.Members) != 0 {
		t.Fatalf("expected 0 members after remove, got %d", len(roster.Members))
	}
}

func TestTeamRemove_NotFound(t *testing.T) {
	dir := t.TempDir()
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}

	rootCmd.SetArgs([]string{"team", "remove", "ghost"})
	if err := rootCmd.Execute(); err == nil {
		t.Fatal("expected error for non-existent member")
	}
}

func TestTeamList_Empty(t *testing.T) {
	dir := t.TempDir()
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}

	rootCmd.SetArgs([]string{"team", "list"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("team list failed: %v", err)
	}
}

func TestTeamList_WithMembers(t *testing.T) {
	dir := t.TempDir()
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}

	kp1, _ := crypto.GenerateKeypair()
	kp2, _ := crypto.GenerateKeypair()

	rootCmd.SetArgs([]string{"team", "add", "alice", kp1.EncodePublicKey()})
	_ = rootCmd.Execute()
	rootCmd.SetArgs([]string{"team", "add", "bob", kp2.EncodePublicKey()})
	_ = rootCmd.Execute()

	rootCmd.SetArgs([]string{"team", "list"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("team list failed: %v", err)
	}
}

func TestRosterFile_IsValidJSON(t *testing.T) {
	dir := t.TempDir()
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}

	kp, _ := crypto.GenerateKeypair()
	rootCmd.SetArgs([]string{"team", "add", "alice", kp.EncodePublicKey()})
	_ = rootCmd.Execute()

	data, err := os.ReadFile(filepath.Join(dir, team.RosterFile))
	if err != nil {
		t.Fatal(err)
	}

	var parsed map[string]interface{}
	if err := json.Unmarshal(data, &parsed); err != nil {
		t.Fatalf("roster file is not valid JSON: %v", err)
	}
}
