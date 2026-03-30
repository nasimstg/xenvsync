package vault

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
)

const (
	headerV2  = "#/---xenvsync vault v2---/"
	dataSep   = "#/---data---/"
)

// KeySlot holds the encrypted symmetric key for one team member.
type KeySlot struct {
	Name         string `json:"name"`
	EphemeralPub string `json:"ephemeral_pub"` // base64
	EncryptedKey string `json:"encrypted_key"` // base64
}

// V2Vault represents a parsed V2 vault file.
type V2Vault struct {
	Slots      []KeySlot
	Ciphertext []byte
}

// IsV2 returns true if the data appears to be a V2 vault.
func IsV2(data []byte) bool {
	return bytes.Contains(data, []byte(headerV2))
}

// EncodeV2 writes a V2 vault file with key slots and ciphertext.
func EncodeV2(slots []KeySlot, ciphertext []byte) ([]byte, error) {
	slotsJSON, err := json.MarshalIndent(slots, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("cannot marshal key slots: %w", err)
	}

	encoded := base64.StdEncoding.EncodeToString(ciphertext)

	var buf bytes.Buffer
	buf.WriteString(headerV2 + "\n")
	buf.Write(slotsJSON)
	buf.WriteString("\n")
	buf.WriteString(dataSep + "\n")

	for i := 0; i < len(encoded); i += 76 {
		end := i + 76
		if end > len(encoded) {
			end = len(encoded)
		}
		buf.WriteString(encoded[i:end] + "\n")
	}

	buf.WriteString(footer + "\n")
	return buf.Bytes(), nil
}

// DecodeV2 parses a V2 vault file into key slots and raw ciphertext.
func DecodeV2(data []byte) (*V2Vault, error) {
	content := string(data)

	hIdx := strings.Index(content, headerV2)
	dIdx := strings.Index(content, dataSep)
	fIdx := strings.Index(content, footer)

	if hIdx < 0 || dIdx < 0 || fIdx < 0 || dIdx <= hIdx || fIdx <= dIdx {
		return nil, fmt.Errorf("malformed V2 vault structure")
	}

	// Parse key slots (JSON between header and data separator).
	slotsRaw := strings.TrimSpace(content[hIdx+len(headerV2) : dIdx])
	var slots []KeySlot
	if err := json.Unmarshal([]byte(slotsRaw), &slots); err != nil {
		return nil, fmt.Errorf("invalid key slots JSON: %w", err)
	}

	// Parse ciphertext (base64 between data separator and footer).
	payload := content[dIdx+len(dataSep) : fIdx]
	payload = strings.ReplaceAll(payload, "\n", "")
	payload = strings.ReplaceAll(payload, "\r", "")
	payload = strings.TrimSpace(payload)

	ciphertext, err := base64.StdEncoding.DecodeString(payload)
	if err != nil {
		return nil, fmt.Errorf("invalid base64 in V2 vault: %w", err)
	}

	return &V2Vault{Slots: slots, Ciphertext: ciphertext}, nil
}
