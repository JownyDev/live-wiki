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
  relationship_tags:
    - "player.*"
  allowed_tags:
    - "help.*"
  blocked_tags:
    - "divine.*"
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
  toward_player_default:
    stance: "neutral"
    note: "Cautious by default."
  sensitivities:
    angers_if:
      - "threaten locals"
    calms_if:
      - "show empathy"
  manipulability:
    by_empathy: "high"
    by_bribe: "low"
    by_intimidation: "low"
    by_authority: "medium"
    notes:
      - "Bribes rarely work."
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
      filters:
        - "Avoids conflict if outnumbered."
---

Full profile.
