---
type: character
id: elara-vance
name: Elara Vance
origin: planet:xylos-prime
image: /img/elara-vance.webp
born: 3042-05-12
affinity: element:echo-crystal
related_characters:
  - type: colleague
    character: character:kellen-ward
  - type: rival
    character: character:veyr-judge
persona:
  archetype: "Obsessive Scholar"
  traits:
    - "meticulous"
    - "distant"
    - "listener"
  values:
    - "preservation"
    - "truth"
  voice:
    tone: "Soft and precise"
    style_notes:
      - "Often trails off mid-sentence"
      - "Uses technical geological metaphors"
knowledge:
  summary: "Expert in Xylosian geology and resonance mechanics. Knows the history of the Great Fracture."
  knows_about:
    - "Resonance Tuning frequencies"
    - "The layout of The Whispering Geode"
    - "Ancient pre-fracture dialects"
memory_profile:
  interest_tags:
    - "science.geology"
    - "history.pre-fracture"
    - "anomaly.*"
  allowed_tags:
    - "academic.*"
    - "personal.family"
emotions_profile:
  baseline_mood:
    curious: 60
    anxious: 20
    calm: 20
  toward_player_default:
    stance: "cautious"
  sensitivities:
    - trigger: "Loud noises"
      effect: "anxious"
    - trigger: "New discoveries"
      effect: "curious"
goals:
  long_term:
    - "Map the entire Whispering Geode network"
    - "Prove the sentient nature of the Echo Crystals"
  short_term:
    - "Repair her broken lantern"
    - "Decipher the latest recording from Sector 4"
capabilities:
  actions:
    - action: "Translate Echoes"
      triggers:
        - "player.offers_crystal"
    - action: "Guide to Geode"
      triggers:
        - "player.asks_location"
---

Elara is a xenogeologist who has spent more time listening to rocks than people. She believes the history of her shattered world is recorded in the crystals of the Whispering Geode, and she fears that mining operations will erase their culture forever.

She wears a coat lined with dampening foam to filter out the constant background hum of Xylos Prime, allowing her to focus on specific frequencies.
