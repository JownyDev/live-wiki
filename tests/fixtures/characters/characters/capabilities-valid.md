---
type: character
id: capabilities-valid
name: Capabilities Valid
capabilities:
  actions:
    - action: "warn"
      triggers:
        - "player.threat"
      notes:
        - "Issues a calm warning before escalation."
    - action: "refuse_service"
      triggers:
        - "player.bribe"
      filters:
        - "Avoids refusal if harbor safety is at risk."
---

Capabilities profile.
