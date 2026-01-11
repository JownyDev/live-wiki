---
type: character
id: memory-profile-valid
name: Memory Profile Valid
memory_profile:
  interest_tags:
    - "zone:haven-docks.*"
    - "rumor.*"
  relationship_tags:
    - "character:arina-mora.*"
    - "player.*"
  allowed_tags:
    - "help.*"
    - "trade.*"
  blocked_tags:
    - "divine.*"
  provenance_policy:
    allowed:
      - "seen"
      - "heard"
      - "rumor"
      - "inferred"
    default: "heard"
  retrieval_limits:
    max_items: 6
    max_tokens_summary: 160
---

Memory profile.
