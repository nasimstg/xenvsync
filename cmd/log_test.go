package cmd

import (
	"os"
	"os/exec"
	"strings"
	"testing"
)

// initGitRepo initializes a git repo in the current directory with initial config.
func initGitRepo(t *testing.T) {
	t.Helper()
	cmds := [][]string{
		{"git", "init"},
		{"git", "config", "user.email", "test@test.com"},
		{"git", "config", "user.name", "Test"},
	}
	for _, args := range cmds {
		if out, err := exec.Command(args[0], args[1:]...).CombinedOutput(); err != nil {
			t.Fatalf("%v failed: %s: %v", args, out, err)
		}
	}
}

func gitAdd(t *testing.T, files ...string) {
	t.Helper()
	args := append([]string{"add"}, files...)
	if out, err := exec.Command("git", args...).CombinedOutput(); err != nil {
		t.Fatalf("git add failed: %s: %v", out, err)
	}
}

func gitCommit(t *testing.T, msg string) {
	t.Helper()
	if out, err := exec.Command("git", "commit", "-m", msg, "--allow-empty").CombinedOutput(); err != nil {
		t.Fatalf("git commit failed: %s: %v", out, err)
	}
}

func TestLog_RequiresGitRepo(t *testing.T) {
	_ = chdirTemp(t)
	resetAllFlags()

	rootCmd.SetArgs([]string{"log"})
	err := rootCmd.Execute()
	if err == nil {
		t.Fatal("expected error in non-git directory")
	}
	if !strings.Contains(err.Error(), "Git repository") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestLog_NoVaultHistory(t *testing.T) {
	_ = chdirTemp(t)
	resetAllFlags()

	initGitRepo(t)

	// Create a dummy file and commit so the repo is not empty.
	_ = os.WriteFile("README.md", []byte("hello"), 0644)
	gitAdd(t, "README.md")
	gitCommit(t, "initial")

	rootCmd.SetArgs([]string{"log"})
	err := rootCmd.Execute()
	if err != nil {
		t.Fatalf("log should not error with no vault history: %v", err)
	}
}

func TestLog_ShowsCommitHistory(t *testing.T) {
	_ = chdirTemp(t)
	resetAllFlags()

	initGitRepo(t)

	// Init xenvsync.
	rootCmd.SetArgs([]string{"init"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("init: %v", err)
	}

	// First push.
	_ = os.WriteFile(".env", []byte("KEY=first\n"), 0644)
	resetAllFlags()
	pushNoFallback = true
	rootCmd.SetArgs([]string{"push", "--no-fallback"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("push 1: %v", err)
	}
	gitAdd(t, ".env.vault")
	gitCommit(t, "first push")

	// Second push with different content.
	_ = os.WriteFile(".env", []byte("KEY=second\nNEW=added\n"), 0644)
	resetAllFlags()
	pushNoFallback = true
	rootCmd.SetArgs([]string{"push", "--no-fallback"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("push 2: %v", err)
	}
	gitAdd(t, ".env.vault")
	gitCommit(t, "second push")

	// Run log.
	resetAllFlags()
	rootCmd.SetArgs([]string{"log"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("log: %v", err)
	}
}

func TestLog_LimitFlag(t *testing.T) {
	_ = chdirTemp(t)
	resetAllFlags()

	initGitRepo(t)

	rootCmd.SetArgs([]string{"init"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("init: %v", err)
	}

	// Create 3 commits.
	for i := 0; i < 3; i++ {
		_ = os.WriteFile(".env", []byte("KEY="+string(rune('a'+i))+"\n"), 0644)
		resetAllFlags()
		pushNoFallback = true
		rootCmd.SetArgs([]string{"push", "--no-fallback"})
		_ = rootCmd.Execute()
		gitAdd(t, ".env.vault")
		gitCommit(t, "push "+string(rune('a'+i)))
	}

	// Log with limit 1.
	resetAllFlags()
	logLimit = 1
	rootCmd.SetArgs([]string{"log", "-n", "1"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("log -n 1: %v", err)
	}
}

func TestLog_NamedEnv(t *testing.T) {
	_ = chdirTemp(t)
	resetAllFlags()

	initGitRepo(t)

	rootCmd.SetArgs([]string{"init"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("init: %v", err)
	}

	// Push to staging env.
	_ = os.WriteFile(".env.staging", []byte("DB=staging\n"), 0644)
	resetAllFlags()
	pushNoFallback = true
	rootCmd.SetArgs([]string{"push", "--env", "staging", "--no-fallback"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("push staging: %v", err)
	}
	gitAdd(t, ".env.staging.vault")
	gitCommit(t, "push staging")

	// Log for staging.
	resetAllFlags()
	rootCmd.SetArgs([]string{"log", "--env", "staging"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("log --env staging: %v", err)
	}
}
