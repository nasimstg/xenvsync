// Package vault handles the on-disk format of .env.vault files.
//
// Format:
//   The vault file stores the raw ciphertext as a base64-encoded string
//   wrapped with a header/footer for easy identification:
//
//     #/---xenvsync vault---/
//     <base64-encoded ciphertext>
//     #/---end xenvsync vault---/
//
// The key is NEVER included in the vault output.
package vault

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"strings"
)

const (
	header = "#/---xenvsync vault---/"
	footer = "#/---end xenvsync vault---/"
)

// Encode wraps raw ciphertext bytes into the vault file format.
func Encode(ciphertext []byte) []byte {
	encoded := base64.StdEncoding.EncodeToString(ciphertext)

	var buf bytes.Buffer
	buf.WriteString(header + "\n")

	// Wrap base64 at 76 characters for readability and cleaner diffs.
	for i := 0; i < len(encoded); i += 76 {
		end := i + 76
		if end > len(encoded) {
			end = len(encoded)
		}
		buf.WriteString(encoded[i:end] + "\n")
	}

	buf.WriteString(footer + "\n")
	return buf.Bytes()
}

// Decode extracts raw ciphertext bytes from a vault file.
func Decode(data []byte) ([]byte, error) {
	content := string(data)

	// Locate the header and footer.
	hIdx := strings.Index(content, header)
	fIdx := strings.Index(content, footer)
	if hIdx < 0 || fIdx < 0 || fIdx <= hIdx {
		return nil, fmt.Errorf("missing or malformed vault header/footer")
	}

	// Extract and clean the base64 payload between header and footer.
	payload := content[hIdx+len(header) : fIdx]
	payload = strings.ReplaceAll(payload, "\n", "")
	payload = strings.ReplaceAll(payload, "\r", "")
	payload = strings.TrimSpace(payload)

	ciphertext, err := base64.StdEncoding.DecodeString(payload)
	if err != nil {
		return nil, fmt.Errorf("invalid base64 in vault: %w", err)
	}
	return ciphertext, nil
}
