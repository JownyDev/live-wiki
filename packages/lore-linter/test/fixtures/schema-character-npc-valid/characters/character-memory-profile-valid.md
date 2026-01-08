---
type: character
id: character-memory-profile-valid
name: Character Memory Profile Valid
memory_profile:
  interest_tags:
    - "zone:old-docks.*"
  relationship_tags:
    - "player.*"
  allowed_tags:
    - "help.*"
  blocked_tags:
    - "divine.*"
  provenance_policy:
    allowed:
      - "seen"
      - "heard"
    default: "heard"
  retrieval_limits:
    max_items: 5
    max_tokens_summary: 120
---

Memory profile.
