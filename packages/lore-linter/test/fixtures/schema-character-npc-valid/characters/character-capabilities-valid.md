---
type: character
id: character-capabilities-valid
name: Character Capabilities Valid
capabilities:
  actions:
    - action: "give_hint"
      triggers:
        - "player.ask_help"
      notes:
        - "Offers a small hint."
    - action: "refuse"
      triggers:
        - "player.threat"
      filters:
        - "Avoids conflict if outnumbered."
---

Capabilities profile.
