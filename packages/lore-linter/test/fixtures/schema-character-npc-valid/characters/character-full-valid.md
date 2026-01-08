---
type: character
id: character-full-valid
name: Character Full Valid
persona:
  archetype: "Street guardian"
  traits:
    - "watchful"
  voice:
    tone: "dry"
    style_notes:
      - "short replies"
  values:
    - "protect locals"
  taboos:
    - "no betrayal"
  biography_bullets:
    - "Keeps the dock safe."
knowledge:
  summary: "Knows the old docks and their factions."
  knows_about:
    - "Dock routes"
  blindspots:
    - "High court politics"
  can_reveal:
    - "Safe houses"
memory_profile:
  interest_tags:
    - "zone:old-docks.*"
  allowed_tags:
    - "help.*"
  provenance_policy:
    allowed:
      - "heard"
    default: "heard"
  retrieval_limits:
    max_items: 6
    max_tokens_summary: 150
emotions_profile:
  baseline_mood:
    calm: 55
    trust: 35
goals:
  long_term:
    - "keep the docks safe"
  typical_priorities:
    - "safety"
capabilities:
  actions:
    - action: "warn"
      triggers:
        - "player.threat"
      notes:
        - "Gives a warning before escalation."
---

Full profile.
