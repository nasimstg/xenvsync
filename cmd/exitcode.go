package cmd

import "fmt"

// ExitCodeCarrier is implemented by errors that map to a specific process exit code.
type ExitCodeCarrier interface {
	ExitCode() int
}

// quietError marks errors that should not be printed by Execute.
type quietError interface {
	Quiet() bool
}

type exitCodeError struct {
	code  int
	quiet bool
}

func (e *exitCodeError) Error() string {
	if e.quiet {
		return ""
	}
	return fmt.Sprintf("process exited with code %d", e.code)
}

func (e *exitCodeError) ExitCode() int {
	return e.code
}

func (e *exitCodeError) Quiet() bool {
	return e.quiet
}

func newQuietExitCodeError(code int) error {
	return &exitCodeError{code: code, quiet: true}
}
