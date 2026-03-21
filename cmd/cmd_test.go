package cmd

import (
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

// testInDir runs fn inside a temporary directory, restoring the original
// working directory when done.
func testInDir(t *testing.T, fn func(dir string)) {
	t.Helper()
	dir := t.TempDir()
	orig, _ := os.Getwd()
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chdir(orig) })
	fn(dir)
}

func TestInit_CreatesKeyAndGitignore(t *testing.T) {
	testInDir(t, func(dir string) {
		cmd := rootCmd
		cmd.SetArgs([]string{"init"})
		if err := cmd.Execute(); err != nil {
			t.Fatalf("init failed: %v", err)
		}

		// Key file must exist with restricted permissions.
		info, err := os.Stat(keyFile)
		if err != nil {
			t.Fatalf("key file not created: %v", err)
		}
		if runtime.GOOS != "windows" {
			if perm := info.Mode().Perm(); perm != 0600 {
				t.Fatalf("key file perm = %o, want 0600", perm)
			}
		}

		// .gitignore must contain the key file and .env.
		gi, err := os.ReadFile(gitignoreFile)
		if err != nil {
			t.Fatalf("gitignore not created: %v", err)
		}
		content := string(gi)
		if !strings.Contains(content, keyFile) {
			t.Fatalf(".gitignore missing %s", keyFile)
		}
		if !strings.Contains(content, ".env") {
			t.Fatal(".gitignore missing .env")
		}
	})
}

func TestInit_RefusesOverwrite(t *testing.T) {
	testInDir(t, func(dir string) {
		// Create a key file first.
		if err := os.WriteFile(keyFile, []byte("existing"), 0600); err != nil {
			t.Fatal(err)
		}

		cmd := rootCmd
		cmd.SetArgs([]string{"init"})
		err := cmd.Execute()
		if err == nil {
			t.Fatal("expected error when key already exists")
		}
	})
}

func TestInit_Force_OverwritesKey(t *testing.T) {
	testInDir(t, func(dir string) {
		if err := os.WriteFile(keyFile, []byte("old-key"), 0600); err != nil {
			t.Fatal(err)
		}

		cmd := rootCmd
		cmd.SetArgs([]string{"init", "--force"})
		if err := cmd.Execute(); err != nil {
			t.Fatalf("init --force failed: %v", err)
		}

		newKey, _ := os.ReadFile(keyFile)
		if string(newKey) == "old-key" {
			t.Fatal("--force should have generated a new key")
		}
	})
}

func TestPushPull_EndToEnd(t *testing.T) {
	testInDir(t, func(dir string) {
		// 1. Init.
		rootCmd.SetArgs([]string{"init"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("init: %v", err)
		}

		// 2. Create a .env file.
		envContent := "DB_HOST=localhost\nDB_PORT=5432\nSECRET=hunter2\n"
		if err := os.WriteFile(".env", []byte(envContent), 0644); err != nil {
			t.Fatal(err)
		}

		// 3. Push (encrypt).
		rootCmd.SetArgs([]string{"push"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("push: %v", err)
		}

		// Vault file must exist.
		if _, err := os.Stat(".env.vault"); err != nil {
			t.Fatal("vault file not created")
		}

		// 4. Delete .env, then pull (decrypt).
		_ = os.Remove(".env")
		rootCmd.SetArgs([]string{"pull"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("pull: %v", err)
		}

		// 5. Verify .env was restored.
		restored, err := os.ReadFile(".env")
		if err != nil {
			t.Fatal(".env not restored after pull")
		}
		if !strings.Contains(string(restored), "DB_HOST=localhost") {
			t.Fatal("restored .env missing DB_HOST")
		}
		if !strings.Contains(string(restored), "SECRET=hunter2") {
			t.Fatal("restored .env missing SECRET")
		}
	})
}

func TestPush_CustomPaths(t *testing.T) {
	testInDir(t, func(dir string) {
		rootCmd.SetArgs([]string{"init"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatal(err)
		}

		customEnv := filepath.Join(dir, "custom.env")
		customVault := filepath.Join(dir, "custom.vault")

		if err := os.WriteFile(customEnv, []byte("KEY=value\n"), 0644); err != nil {
			t.Fatal(err)
		}

		rootCmd.SetArgs([]string{"push", "-e", customEnv, "-o", customVault})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("push with custom paths: %v", err)
		}

		if _, err := os.Stat(customVault); err != nil {
			t.Fatal("custom vault file not created")
		}
	})
}
