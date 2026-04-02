package cmd

import (
	"errors"
	"fmt"
	"runtime"
	"strings"
	"testing"
)

func runEnvEchoCommand() []string {
	if runtime.GOOS == "windows" {
		return []string{"cmd", "/c", "echo %XENVSYNC_TEST_SECRET%"}
	}
	return []string{"sh", "-c", "printf '%s' \"$XENVSYNC_TEST_SECRET\""}
}

func runExitCommand(code int) []string {
	if runtime.GOOS == "windows" {
		return []string{"cmd", "/c", fmt.Sprintf("exit %d", code)}
	}
	return []string{"sh", "-c", fmt.Sprintf("exit %d", code)}
}

func TestRun_InjectsVaultEnvIntoChild(t *testing.T) {
	testInDir(t, func(_ string) {
		resetAllFlags()
		setupVault(t, "XENVSYNC_TEST_SECRET=fromvault\n")

		args := append([]string{"run", "--"}, runEnvEchoCommand()...)
		rootCmd.SetArgs(args)

		output := captureStdout(t, func() {
			if err := rootCmd.Execute(); err != nil {
				t.Fatalf("run failed: %v", err)
			}
		})

		if !strings.Contains(output, "fromvault") {
			t.Fatalf("run output did not contain injected variable, got: %q", output)
		}
	})
}

func TestRun_PropagatesChildExitCode(t *testing.T) {
	testInDir(t, func(_ string) {
		resetAllFlags()
		setupVault(t, "K=V\n")

		args := append([]string{"run", "--"}, runExitCommand(7)...)
		rootCmd.SetArgs(args)

		err := rootCmd.Execute()
		if err == nil {
			t.Fatal("expected non-zero child exit to return an error")
		}

		var carrier ExitCodeCarrier
		if !errors.As(err, &carrier) {
			t.Fatalf("expected ExitCodeCarrier error, got: %T (%v)", err, err)
		}
		if got := carrier.ExitCode(); got != 7 {
			t.Fatalf("exit code = %d, want 7", got)
		}
	})
}

func TestRun_CommandNotFound(t *testing.T) {
	testInDir(t, func(_ string) {
		resetAllFlags()
		setupVault(t, "K=V\n")

		rootCmd.SetArgs([]string{"run", "--", "xenvsync-command-that-does-not-exist"})
		err := rootCmd.Execute()
		if err == nil {
			t.Fatal("expected command-not-found error")
		}
		if !strings.Contains(err.Error(), "command not found") {
			t.Fatalf("unexpected error: %v", err)
		}
	})
}
