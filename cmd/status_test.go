package cmd

import (
	"os"
	"strings"
	"testing"
	"time"
)

func TestStatus_ShowsMissingFiles(t *testing.T) {
	testInDir(t, func(_ string) {
		resetAllFlags()
		rootCmd.SetArgs([]string{"status"})

		output := captureStdout(t, func() {
			if err := rootCmd.Execute(); err != nil {
				t.Fatalf("status failed: %v", err)
			}
		})

		if !strings.Contains(output, "xenvsync status") {
			t.Fatalf("missing status header, got: %q", output)
		}
		if !strings.Contains(output, "missing") {
			t.Fatalf("expected missing file markers, got: %q", output)
		}
	})
}

func TestStatus_NamedEnvShowsPushHint(t *testing.T) {
	testInDir(t, func(_ string) {
		resetAllFlags()
		rootCmd.SetArgs([]string{"init"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("init failed: %v", err)
		}

		if err := os.WriteFile(".env.staging.vault", []byte("vault"), 0644); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(".env.staging", []byte("A=1\n"), 0644); err != nil {
			t.Fatal(err)
		}

		now := time.Now()
		older := now.Add(-2 * time.Minute)
		if err := os.Chtimes(".env.staging.vault", older, older); err != nil {
			t.Fatal(err)
		}
		if err := os.Chtimes(".env.staging", now, now); err != nil {
			t.Fatal(err)
		}

		resetAllFlags()
		rootCmd.SetArgs([]string{"status", "--env", "staging"})
		output := captureStdout(t, func() {
			if err := rootCmd.Execute(); err != nil {
				t.Fatalf("status --env staging failed: %v", err)
			}
		})

		if !strings.Contains(output, "environment: staging") {
			t.Fatalf("missing environment marker, got: %q", output)
		}
		if !strings.Contains(output, "consider running: xenvsync push --env staging") {
			t.Fatalf("missing push hint, got: %q", output)
		}
	})
}
