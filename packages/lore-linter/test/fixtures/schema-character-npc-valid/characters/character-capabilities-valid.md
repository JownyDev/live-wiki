---
type: character
id: character-capabilities-valid
name: Character Capabilities Valid
capabilities:
  actions:
    - action: "insult"
      triggers:
        - "player.insult"
      notes:
        - "Short verbal response."
    - action: "give_hint"
      triggers:
        - "player.ask_help"
        - "player.polite"
      filters:
        - "Only if trust is above baseline."
---

Capabilities profile.
