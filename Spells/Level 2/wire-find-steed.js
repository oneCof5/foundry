// DAE itemMacro with spawned tokenId as argument
if (typeof args !== 'undefined') {
  if (args[0] == "off") {
    warpgate.dismiss(args[1]); // kill the token
    return;
  }
}

// WIRE itemMacro
if (typeof this !== 'undefined') {
  console.log("FIND STEED Flow");
  this.registerFlowStep("findSteed", true, async (activation) => {
    const caster = game.actors.get(this.item.parent._id);
    const casterToken = caster.getActiveTokens(false, true)[0];
    const spellSlot = activation.config.spellLevel; // base 2, above scales
    const upcastHealth = spellSlot * 10; // plus 10 health for each spell slot level
    let casterMsakBonus = 0;
    if (caster.system.bonuses.msak.attack.length > 0) {
      casterMsakBonus = Number(caster.system.bonuses.msak.attack.split("+").filter(Number).reduce(function (total, num) { return parseFloat(total) + parseFloat(num) }));
    }
    console.log("FIND STEED casterMsakBonus: ", casterMsakBonus);
    const casterAttack = 1 + Number(caster.system.abilities[caster.system.attributes.spellcasting].mod) + casterMsakBonus;
    console.log("FIND STEED casterAttack: ", casterAttack);

    let theCr;
    switch (caster.system.attributes.prof) {
      case 3:
        theCr = 5;
        break;
      case 4:
        theCr = 9;
        break;
      case 5:
        theCr = 13;
    };
    console.log("FIND STEED theCr: ", theCr);

    const buttonData = {
      title: "Choose the type of celestial spirit to summon.",
      buttons: [
        {
          /* 
          Healing Touch (Celestial Only; Recharges after a Long Rest). The 
          steed touches another creature and restores a number of Hit Points
          to it equal to 2d8 + the spell’s level.
          */
          label: "Celestial",
          value: {
            actor: {
              "system.details.type.value": "celestial"
            },
            embedded: {
              Item: {
                "Healing Touch": {
                  "img": "icons/magic/holy/saint-glass-portrait-halo.webp",
                  "system": {
                    "description": { "value": `<p>The steed touches another creature and restores a number of Hit Points to it equal to 2d8 + the spell's level [[${spellSlot}]].</p>` },
                    "activation": {
                      "type": "bonus",
                      "cost": null
                    },
                    "target": { "type": "creature" },
                    "range": { "units": "touch" },
                    "uses": {
                      "value": 1,
                      "max": "1",
                      "per": "lr"
                    },
                    "actionType": "heal",
                    "damage": { "parts": [[`2d8[healing]+${spellSlot}`, "healing"]] },
                    "type": { "value": "monster" }
                  },
                  "type": "feat"
                },
                "Otherworldly Maul": {
                  "system": {
                    "description.value": `<p><em>Melee Spell Attack</em>: your Spell Attack Modifier to hit, reach 5 ft., one target. <em>Hit</em>: 1d8 + ${spellSlot} (the spell's level) of radiant damage (Celestial).</p>`,
                    "damage.parts": [["1d8[radiant]+2", "radiant"]]
                  }
                }
              }
            }
          }
        },
        {
          /* 
          Fey Step (Fey Only; Recharges after a Long Rest). The steed 
          teleports, along with its rider, to an unoccupied space of your 
          choice up to 60 feet away.
          */
          label: "Fey",
          value: {
            actor: {
              "system.details.type.value": "fey"
            },
            embedded: {
              Item: {
                "Fey Step": {
                  "img": "icons/skills/movement/ball-spinning-blue.webp",
                  "system": {
                    "description": { "value": "<p>The steed teleports, along with its rider, to an unoccupied space of your choice up to 60 feet away.</p>" },
                    "activation": { "type": "bonus", "cost": null },
                    "target": { "type": "self" },
                    "range": { "value": 60, "units": "ft" },
                    "uses": { "value": 1, "max": "1", "per": "lr" },
                    "actionType": "util",
                    "type": { "value": "monster" }
                  },
                  "type": "feat"
                },
                "Otherworldly Maul": {
                  "system": {
                    "description.value": `<p><em>Melee Spell Attack</em>: your Spell Attack Modifier to hit, reach 5 ft., one target. <em>Hit</em>: 1d8 + ${spellSlot} (the spell's level) of psychic damage (Fey).</p>`,
                    "damage.parts": [["1d8[psychic]+2", "psychic"]]
                  }
                }
              }
            }
          }
        },
        {
          /* 
          Fell Glare (Fiend Only; Recharges after a Long Rest). The steed’s 
          eyes gleam with fiendish light as it targets one creature it can 
          perceive up to 60 feet away. The target must succeed on a Wisdom 
          saving throw against your Spell Save DC or have the Frightened 
          condition until the end of your next turn.
          */
          label: "Fiend",
          value: {
            actor: {
              "system.details.type.value": "fiend"
            },
            embedded: {
              Item: {
                "Fell Glare": {
                  "type": "feat",
                  "system": {
                    "description": { "value": `<p>The steed's eyes gleam with fiendish light as it targets one creature it can perceive up to 60 feet away. The target must succeed on a Wisdom saving throw against your Spell Save DC [[${caster.system.attributes.spelldc}]] or have the Frightened condition until the end of your next turn.</p>` },
                    "activation": { "type": "bonus", "cost": null },
                    "target": { "type": "creature" },
                    "range": { "value": 60, "units": "ft" },
                    "uses": { "value": 1, "max": "1", "per": "lr" },
                    "actionType": "save",
                    "save": { "ability": "wis", "dc": caster.system.attributes.spelldc, "scaling": "flat" },
                    "type": { "value": "monster" }
                  },
                  "img": "icons/magic/unholy/silhouette-robe-evil-glow.webp",
                  "effects": [
                    {
                      "label": "Fell Glare",
                      "icon": "icons/magic/unholy/silhouette-robe-evil-glow.webp",
                      "origin": "Item.PeE32NBlkLEEgmFX",
                      "duration": { "turns": 1 },
                      "disabled": false,
                      "changes": [
                        {
                          "key": "wire.custom.statusEffect",
                          "mode": 2,
                          "value": "frightened",
                          "priority": 20
                        }
                      ],
                      "transfer": false,
                      "flags": {
                        "dfreds-convenient-effects": {
                          "description": ""
                        },
                        "wire": {
                          "applyOnSaveOrMiss": false,
                          "applicationType": "immediate",
                          "blocksAreaConditions": false,
                          "auraTargets": "",
                          "stackEffects": false,
                          "rollEffects": false,
                          "independentDuration": false,
                          "conditions": []
                        }
                      }
                    }
                  ]
                },
                "Otherworldly Maul": {
                  "system": {
                    "description.value": `<p><em>Melee Spell Attack</em>: your Spell Attack Modifier to hit, reach 5 ft., one target. <em>Hit</em>: 1d8 + ${spellSlot} (the spell's level) of necrotic damage (Fiend).</p>`,
                    "damage.parts": [["1d8[necrotic]+2", "necrotic"]]
                  }
                }
              }
            }
          }
        }
      ]
    };
    console.log("FIND STEED - buttonData", buttonData);

    const choice = await warpgate.buttonDialog(buttonData);
    console.log("FIND STEED - Choice: ", choice);

    // combine general and specific updates
    let updates = {
      actor: {
        "system": {
          "attributes": {
            "hp": {
              "value": 5 + upcastHealth,
              "max": 5 + upcastHealth,
              "formula": `5 + ${upcastHealth}`
            },
            "movement.fly": (spellSlot > 3) ? 60 : 30,
            "prof": caster.system.attributes.prof
          },
          "details.cr": theCr
        }
      },
      embedded: {
        Item: {
          "Otherworldly Maul": {
            "system": {
              "attackBonus": casterAttack
            }
          }
        }
      }
    };
    updates = mergeObject(updates, choice);
    console.log("#### updates: ", updates);

    if (choice === true) return {}; // break if no choice

    // define options
    const options = { controllingActor: caster };

    // define callbacks
    const callbacks = {};

    // Summon the token
    const steedTokenId = (await warpgate.spawn("Leux", updates, callbacks, options))[0];
    console.log("#### Warpgate spawned tokenid is ", steedTokenId);

    // Update the DAE flag with the spawned token so it can be dismissed later
    let steedEffect = caster.effects.find(e => e.label === "Summon Steed");
    console.log("#### steedEffect: ", steedEffect);
    steedEffect.update({
      "changes": [{
        "key": "macro.itemMacro",
        "value": `${steedTokenId}`,
        "mode": 0,
        "priority": 10
      }]
    })

  });

  return this.applyDefaultTargetsAsEffective(
    this.sequence(
      this.applyEffects(),
      this.performCustomStep("findSteed")
    )
  )
}