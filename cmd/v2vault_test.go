package cmd

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/nasimstg/xenvsync/internal/crypto"
	"github.com/nasimstg/xenvsync/internal/team"
	"github.com/nasimstg/xenvsync/internal/vault"
)

func TestPushPull_V2_WithTeamRoster(t *testing.T) {
	dir := chdirTemp(t)
	tmpHome := setTempHome(t)
	resetAllFlags()
	keygenForce = false

	// Generate identity for the current user.
	rootCmd.SetArgs([]string{"keygen"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("keygen failed: %v", err)
	}

	// Read the user's public key.
	idPath := filepath.Join(tmpHome, ".xenvsync", "identity")
	raw, _ := os.ReadFile(idPath)
	kp, _ := crypto.DecodePrivateKey(strings.TrimSpace(string(raw)))
	pubKey := kp.EncodePublicKey()

	// Create a team roster with the current user.
	roster := &team.Roster{}
	_ = roster.Add("testuser", pubKey)
	_ = roster.Save(filepath.Join(dir, team.RosterFile))

	// Write a .env file.
	_ = os.WriteFile(filepath.Join(dir, ".env"), []byte("DB_HOST=localhost\nAPI_KEY=sk-secret\n"), 0644)

	// Push should use V2 format.
	pushNoFallback = true
	rootCmd.SetArgs([]string{"push"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("push failed: %v", err)
	}

	// Verify it's V2 format.
	vaultData, _ := os.ReadFile(filepath.Join(dir, ".env.vault"))
	if !vault.IsV2(vaultData) {
		t.Fatal("expected V2 vault format when team roster exists")
	}

	// Delete the .env file.
	_ = os.Remove(filepath.Join(dir, ".env"))

	// Pull should decrypt V2 using identity.
	rootCmd.SetArgs([]string{"pull"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("pull failed: %v", err)
	}

	// Verify the .env file was restored.
	restored, _ := os.ReadFile(filepath.Join(dir, ".env"))
	content := string(restored)
	if !strings.Contains(content, "DB_HOST=localhost") {
		t.Fatal("DB_HOST not found in restored .env")
	}
	if !strings.Contains(content, "API_KEY=sk-secret") {
		t.Fatal("API_KEY not found in restored .env")
	}
}

func TestPushPull_V2_MultipleMembers(t *testing.T) {
	dir := chdirTemp(t)
	tmpHome := setTempHome(t)
	resetAllFlags()
	keygenForce = false

	// Generate identity for the current user.
	rootCmd.SetArgs([]string{"keygen"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatal(err)
	}

	idPath := filepath.Join(tmpHome, ".xenvsync", "identity")
	raw, _ := os.ReadFile(idPath)
	kp, _ := crypto.DecodePrivateKey(strings.TrimSpace(string(raw)))

	// Generate another team member's keypair.
	otherKp, _ := crypto.GenerateKeypair()

	// Create roster with both members.
	roster := &team.Roster{}
	_ = roster.Add("me", kp.EncodePublicKey())
	_ = roster.Add("teammate", otherKp.EncodePublicKey())
	_ = roster.Save(filepath.Join(dir, team.RosterFile))

	_ = os.WriteFile(filepath.Join(dir, ".env"), []byte("SECRET=value\n"), 0644)

	pushNoFallback = true
	rootCmd.SetArgs([]string{"push"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("push failed: %v", err)
	}

	// Verify vault has 2 key slots.
	vaultData, _ := os.ReadFile(filepath.Join(dir, ".env.vault"))
	v2, err := vault.DecodeV2(vaultData)
	if err != nil {
		t.Fatal(err)
	}
	if len(v2.Slots) != 2 {
		t.Fatalf("expected 2 slots, got %d", len(v2.Slots))
	}

	// Pull as the current user should work.
	_ = os.Remove(filepath.Join(dir, ".env"))
	rootCmd.SetArgs([]string{"pull"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("pull failed: %v", err)
	}

	restored, _ := os.ReadFile(filepath.Join(dir, ".env"))
	if !strings.Contains(string(restored), "SECRET=value") {
		t.Fatal("SECRET not restored")
	}
}

func TestPull_V1_BackwardCompatible(t *testing.T) {
	dir := chdirTemp(t)
	resetAllFlags()

	// Create a V1 vault the old way (no roster).
	keyHex, _ := crypto.GenerateKey()
	_ = os.WriteFile(filepath.Join(dir, ".xenvsync.key"), []byte(keyHex), 0600)

	key, _ := crypto.DecodeKey(keyHex)
	plaintext := []byte("OLD_VAR=legacy\n")
	ciphertext, _ := crypto.Encrypt(key, plaintext)
	vaultData := vault.Encode(ciphertext)
	_ = os.WriteFile(filepath.Join(dir, ".env.vault"), vaultData, 0644)

	// Pull without team roster — should use V1 decryption.
	rootCmd.SetArgs([]string{"pull"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("V1 pull failed: %v", err)
	}

	restored, _ := os.ReadFile(filepath.Join(dir, ".env"))
	if !strings.Contains(string(restored), "OLD_VAR=legacy") {
		t.Fatal("V1 backward compatibility broken")
	}
}
