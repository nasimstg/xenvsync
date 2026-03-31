package cmd

import (
	"os"
	"strings"
	"testing"
)

func resetAllFlags() {
	pushEnvFile = defaultEnvFile
	pushVaultFile = defaultVaultFile
	pushEnvName = ""
	pushNoFallback = false
	pullVaultFile = defaultVaultFile
	pullEnvFile = defaultEnvFile
	pullEnvName = ""
	diffEnvFile = defaultEnvFile
	diffVaultFile = defaultVaultFile
	diffEnvName = ""
	diffShowValues = false
	exportVaultFile = defaultVaultFile
	exportFormat = "dotenv"
	exportEnvName = ""
	runVaultFile = defaultVaultFile
	runEnvName = ""
	statusEnvName = ""
	rotateEnvName = ""
	rotateRevoke = ""
	logEnvName = ""
	logShowValues = false
	logLimit = 10
}

func TestPushPull_NamedEnv(t *testing.T) {
	testInDir(t, func(dir string) {
		resetAllFlags()

		// 1. Init.
		rootCmd.SetArgs([]string{"init"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("init: %v", err)
		}

		// 2. Create .env.staging
		if err := os.WriteFile(".env.staging", []byte("DB_HOST=staging-db\nAPI_KEY=sk-staging\n"), 0644); err != nil {
			t.Fatal(err)
		}

		// 3. Push with --env staging → should create .env.staging.vault
		rootCmd.SetArgs([]string{"push", "--env", "staging"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("push --env staging: %v", err)
		}

		if _, err := os.Stat(".env.staging.vault"); err != nil {
			t.Fatal(".env.staging.vault not created")
		}

		// 4. Delete .env.staging, then pull --env staging → should restore it
		_ = os.Remove(".env.staging")
		rootCmd.SetArgs([]string{"pull", "--env", "staging"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("pull --env staging: %v", err)
		}

		restored, err := os.ReadFile(".env.staging")
		if err != nil {
			t.Fatal(".env.staging not restored after pull")
		}
		if !strings.Contains(string(restored), "DB_HOST=staging-db") {
			t.Fatal("restored .env.staging missing DB_HOST")
		}
	})
}

func TestDiff_NamedEnv(t *testing.T) {
	testInDir(t, func(dir string) {
		resetAllFlags()

		rootCmd.SetArgs([]string{"init"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("init: %v", err)
		}

		// Create and push a staging env.
		if err := os.WriteFile(".env.staging", []byte("KEY=original\n"), 0644); err != nil {
			t.Fatal(err)
		}

		resetAllFlags()
		rootCmd.SetArgs([]string{"push", "--env", "staging"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("push --env staging: %v", err)
		}

		// Modify the env file to create a diff.
		if err := os.WriteFile(".env.staging", []byte("KEY=changed\n"), 0644); err != nil {
			t.Fatal(err)
		}

		// Diff should not error.
		rootCmd.SetArgs([]string{"diff", "--env", "staging"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("diff --env staging: %v", err)
		}
	})
}

func TestEnvs_Discovery(t *testing.T) {
	testInDir(t, func(dir string) {
		// Create files for discovery.
		if err := os.WriteFile(".env", []byte("A=1\n"), 0644); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(".env.vault", []byte("vault"), 0644); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(".env.staging", []byte("B=2\n"), 0644); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(".env.production.vault", []byte("vault"), 0644); err != nil {
			t.Fatal(err)
		}

		envs := discoverEnvironments()

		if len(envs) != 3 {
			t.Fatalf("expected 3 environments, got %d", len(envs))
		}

		// Default should be first.
		if envs[0].Name != "(default)" {
			t.Fatalf("expected first env to be (default), got %s", envs[0].Name)
		}
		if !envs[0].HasEnv || !envs[0].HasVault {
			t.Fatal("default should have both .env and .env.vault")
		}

		// Check named environments are discovered (sorted).
		names := make(map[string]EnvInfo)
		for _, e := range envs {
			names[e.Name] = e
		}

		if info, ok := names["staging"]; !ok || !info.HasEnv || info.HasVault {
			t.Fatal("staging should have .env.staging but no vault")
		}
		if info, ok := names["production"]; !ok || info.HasEnv || !info.HasVault {
			t.Fatal("production should have vault but no .env.production")
		}
	})
}

func TestEnvFilePath(t *testing.T) {
	tests := []struct {
		name     string
		wantEnv  string
		wantVault string
	}{
		{"", ".env", ".env.vault"},
		{"staging", ".env.staging", ".env.staging.vault"},
		{"production", ".env.production", ".env.production.vault"},
	}

	for _, tt := range tests {
		if got := envFilePath(tt.name); got != tt.wantEnv {
			t.Errorf("envFilePath(%q) = %q, want %q", tt.name, got, tt.wantEnv)
		}
		if got := vaultFilePath(tt.name); got != tt.wantVault {
			t.Errorf("vaultFilePath(%q) = %q, want %q", tt.name, got, tt.wantVault)
		}
	}
}

func TestResolveEnvName_FlagOverridesEnvVar(t *testing.T) {
	t.Setenv("XENVSYNC_ENV", "from-env")

	if got := resolveEnvName("from-flag"); got != "from-flag" {
		t.Errorf("flag should override env var, got %q", got)
	}

	if got := resolveEnvName(""); got != "from-env" {
		t.Errorf("should fall back to XENVSYNC_ENV, got %q", got)
	}
}

func TestPush_FallbackMerge(t *testing.T) {
	testInDir(t, func(dir string) {
		resetAllFlags()

		rootCmd.SetArgs([]string{"init"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("init: %v", err)
		}

		// Create .env.shared (base), .env.staging (env-specific), .env.local (overrides)
		if err := os.WriteFile(".env.shared", []byte("SHARED=base\nDB_HOST=shared-db\n"), 0644); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(".env.staging", []byte("DB_HOST=staging-db\nAPI_KEY=sk-staging\n"), 0644); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(".env.local", []byte("API_KEY=sk-local-override\nDEBUG=true\n"), 0644); err != nil {
			t.Fatal(err)
		}

		// Push with --env staging (fallback enabled by default)
		resetAllFlags()
		rootCmd.SetArgs([]string{"push", "--env", "staging"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("push --env staging: %v", err)
		}

		// Pull and verify merged content
		resetAllFlags()
		rootCmd.SetArgs([]string{"pull", "--env", "staging"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("pull --env staging: %v", err)
		}

		restored, err := os.ReadFile(".env.staging")
		if err != nil {
			t.Fatal(err)
		}
		content := string(restored)

		// .env.shared provides SHARED=base
		if !strings.Contains(content, "SHARED=base") {
			t.Fatal("missing SHARED from .env.shared")
		}
		// .env.staging overrides DB_HOST from .env.shared
		if !strings.Contains(content, "DB_HOST=staging-db") {
			t.Fatal("DB_HOST should be staging-db (from .env.staging, not shared)")
		}
		// .env.local overrides API_KEY from .env.staging
		if !strings.Contains(content, "API_KEY=sk-local-override") {
			t.Fatal("API_KEY should be sk-local-override (from .env.local)")
		}
		// .env.local adds DEBUG
		if !strings.Contains(content, "DEBUG=true") {
			t.Fatal("missing DEBUG from .env.local")
		}
	})
}

func TestPush_NoFallback(t *testing.T) {
	testInDir(t, func(dir string) {
		resetAllFlags()

		rootCmd.SetArgs([]string{"init"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("init: %v", err)
		}

		// Create fallback files that should be ignored
		if err := os.WriteFile(".env.shared", []byte("SHARED=should-not-appear\n"), 0644); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(".env.staging", []byte("API_KEY=staging-only\n"), 0644); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(".env.local", []byte("LOCAL=should-not-appear\n"), 0644); err != nil {
			t.Fatal(err)
		}

		// Push with --no-fallback
		resetAllFlags()
		rootCmd.SetArgs([]string{"push", "--env", "staging", "--no-fallback"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("push --no-fallback: %v", err)
		}

		// Pull and verify only .env.staging content
		resetAllFlags()
		rootCmd.SetArgs([]string{"pull", "--env", "staging"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("pull --env staging: %v", err)
		}

		restored, err := os.ReadFile(".env.staging")
		if err != nil {
			t.Fatal(err)
		}
		content := string(restored)

		if !strings.Contains(content, "API_KEY=staging-only") {
			t.Fatal("missing API_KEY from .env.staging")
		}
		if strings.Contains(content, "SHARED") {
			t.Fatal("SHARED should not be present with --no-fallback")
		}
		if strings.Contains(content, "LOCAL") {
			t.Fatal("LOCAL should not be present with --no-fallback")
		}
	})
}

func TestLoadMergedPairs_Precedence(t *testing.T) {
	testInDir(t, func(dir string) {
		// shared < primary < local
		if err := os.WriteFile(".env.shared", []byte("A=shared\nB=shared\nC=shared\n"), 0644); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(".env", []byte("B=primary\nD=primary\n"), 0644); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(".env.local", []byte("C=local\nE=local\n"), 0644); err != nil {
			t.Fatal(err)
		}

		pairs, err := loadMergedPairs(".env", false)
		if err != nil {
			t.Fatalf("loadMergedPairs: %v", err)
		}

		m := make(map[string]string)
		for _, p := range pairs {
			m[p.Key] = p.Value
		}

		// A from shared (not overridden)
		if m["A"] != "shared" {
			t.Errorf("A = %q, want shared", m["A"])
		}
		// B overridden by primary
		if m["B"] != "primary" {
			t.Errorf("B = %q, want primary", m["B"])
		}
		// C overridden by local
		if m["C"] != "local" {
			t.Errorf("C = %q, want local", m["C"])
		}
		// D from primary
		if m["D"] != "primary" {
			t.Errorf("D = %q, want primary", m["D"])
		}
		// E from local
		if m["E"] != "local" {
			t.Errorf("E = %q, want local", m["E"])
		}
	})
}

func TestSyncStatus(t *testing.T) {
	tests := []struct {
		hasEnv   bool
		hasVault bool
		want     string
	}{
		{true, true, "synced"},
		{true, false, "not pushed"},
		{false, true, "not pulled"},
		{false, false, "empty"},
	}

	for _, tt := range tests {
		info := EnvInfo{HasEnv: tt.hasEnv, HasVault: tt.hasVault}
		if got := info.SyncStatus(); got != tt.want {
			t.Errorf("SyncStatus(env=%v, vault=%v) = %q, want %q", tt.hasEnv, tt.hasVault, got, tt.want)
		}
	}
}
