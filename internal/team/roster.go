package team

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"time"
)

const RosterFile = ".xenvsync-team.json"

// Member represents a team member in the roster.
type Member struct {
	Name      string    `json:"name"`
	PublicKey string    `json:"public_key"`
	AddedAt   time.Time `json:"added_at"`
}

// Roster holds the team member list.
type Roster struct {
	Members []Member `json:"members"`
}

// Load reads the roster from the given path. Returns an empty roster if the file doesn't exist.
func Load(path string) (*Roster, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return &Roster{}, nil
		}
		return nil, fmt.Errorf("cannot read %s: %w", path, err)
	}

	var r Roster
	if err := json.Unmarshal(data, &r); err != nil {
		return nil, fmt.Errorf("invalid roster file %s: %w", path, err)
	}
	return &r, nil
}

// Save writes the roster to the given path with readable formatting.
func (r *Roster) Save(path string) error {
	data, err := json.MarshalIndent(r, "", "  ")
	if err != nil {
		return fmt.Errorf("cannot marshal roster: %w", err)
	}
	data = append(data, '\n')
	return os.WriteFile(path, data, 0644)
}

// Add adds a member to the roster. Returns an error if the name already exists.
func (r *Roster) Add(name, publicKey string) error {
	for _, m := range r.Members {
		if m.Name == name {
			return fmt.Errorf("member %q already exists — use remove first to replace", name)
		}
	}

	// Check for duplicate public key.
	for _, m := range r.Members {
		if m.PublicKey == publicKey {
			return fmt.Errorf("public key already registered to %q", m.Name)
		}
	}

	r.Members = append(r.Members, Member{
		Name:      name,
		PublicKey:  publicKey,
		AddedAt:   time.Now().UTC().Truncate(time.Second),
	})

	sort.Slice(r.Members, func(i, j int) bool {
		return r.Members[i].Name < r.Members[j].Name
	})
	return nil
}

// Remove removes a member by name. Returns an error if not found.
func (r *Roster) Remove(name string) error {
	for i, m := range r.Members {
		if m.Name == name {
			r.Members = append(r.Members[:i], r.Members[i+1:]...)
			return nil
		}
	}
	return fmt.Errorf("member %q not found in roster", name)
}

// Find returns a member by name, or nil if not found.
func (r *Roster) Find(name string) *Member {
	for i := range r.Members {
		if r.Members[i].Name == name {
			return &r.Members[i]
		}
	}
	return nil
}
