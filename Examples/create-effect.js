let effectData = [{
  label: "Unconscious",
  icon: "icons/svg/sleep.svg",
  origin: args[0].uuid,
  disabled: false,
  duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
  flags: { dae: { specialDuration: ["isDamaged"] } },

  changes: [
    { key: `flags.midi-qol.grants.critical.mwak`, mode: 2, value: 1, priority: 20 },
    { key: `flags.midi-qol.grants.advantage.attack.all`, mode: 2, value: 1, priority: 20 },
    { key: `flags.midi-qol.fail.ability.save.str`, mode: 2, value: 1, priority: 20 },
    { key: `flags.midi-qol.fail.ability.save.dex`, mode: 2, value: 1, priority: 20 },
    { key: `data.attributes.movement.all`, mode: 5, value: 0, priority: 20 }
  ]
}];
await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: effectData });


let checkEffect = await target.actor.data.effects.find(i => i.data.label === 'Hex');
let effectData = {
  _id: checkEffect.id,
  changes: [
    { key: `flags.midi-qol.disadvantage.ability.check.${skill}`, mode: 0, value: 1, priority: 20 }
  ]
}
if (!checkEffect) {
  ui.notifications.info("Could not find effect to toggle");
  return
} else if (checkEffect) {
  await target.actor.updateEmbeddedDocuments('ActiveEffect', [effectData])
}


{
  "key": "L9lvxYPo5YOrZouM",
  "value": {
    "_id": "L9lvxYPo5YOrZouM",
    "changes": [{
        "key": "ATL.preset",
        "mode": 0,
        "value": "RiteOfTheDawn",
        "priority": "20"
      },
      {
        "key": "flags.midi-qol.DR.necrotic",
        "mode": 0,
        "value": "1",
        "priority": "18"
      },
      {
        "key": "macro.execute",
        "mode": 0,
        "value": "rite-dawn",
        "priority": "20"
      }
    ],
    "disabled": false,
    "duration": {
      "startTime": 23124260700,
      "seconds": 0
    },
    "icon": "icons/magic/light/explosion-beam-impact-silhouette.webp",
    "label": "Crimson Rite of the Dawn",
    "origin": "Actor.BfeJuX7IC9oCzh5U.Item.X8Y0CLydhpcvJfCy",
    "tint": null,
    "transfer": false,
    "flags": {
      "dae": {
        "stackable": "none",
        "macroRepeat": "none",
        "specialDuration": [],
        "transfer": false,
        "itemData": {
          "_id": "X8Y0CLydhpcvJfCy",
          "name": "Crimson Rite of the Dawn",
          "type": "feat",
          "img": "icons/magic/light/explosion-beam-impact-silhouette.webp",
          "data": {
            "description": {
              "value": "<p><em><strong>Rite of the Dawn.</strong></em> Your rite damage is radiant damage. While the rite is active, you gain the following benefits:</p>\n<ul>\n<li>Your weapon sheds bright light out to a radius of 20 feet.</li>\n<li>You have resistance to necrotic damage.</li>\n<li>Your weapon deals one additional hemocraft die of rite damage when you hit an undead</li>\n</ul>",
              "chat": "<p>When you join this order at 3rd level, you learn the Rite of the Dawn esoteric rite (detailed below).</p>\n<p><em><strong>Rite of the Dawn.</strong></em> Your rite damage is radiant damage. While the rite is active, you gain the following benefits:</p>\n<ul>\n<li>Your weapon sheds bright light out to a radius of 20 feet.</li>\n<li>You have resistance to necrotic damage.</li>\n<li>Your weapon deals one additional hemocraft die of rite damage when you hit an undead</li>\n</ul>",
              "unidentified": ""
            },
            "source": "Blood Hunter : Order of the Ghostslayer",
            "activation": {
              "type": "bonus",
              "cost": 1,
              "condition": ""
            },
            "duration": {
              "value": null,
              "units": ""
            },
            "target": {
              "value": null,
              "width": null,
              "units": null,
              "type": "self"
            },
            "range": {
              "value": null,
              "long": null,
              "units": ""
            },
            "uses": {
              "value": 0,
              "max": 0,
              "per": ""
            },
            "consume": {
              "type": "",
              "target": "",
              "amount": null
            },
            "ability": "",
            "actionType": "",
            "attackBonus": 0,
            "chatFlavor": "",
            "critical": {
              "threshold": null,
              "damage": null
            },
            "damage": {
              "parts": [],
              "versatile": ""
            },
            "formula": "",
            "save": {
              "ability": "",
              "dc": null,
              "scaling": "spell"
            },
            "requirements": "",
            "recharge": {
              "value": null,
              "charged": false
            },
            "equipped": true,
            "prof": {
              "_baseProficiency": 3,
              "multiplier": 0,
              "rounding": "down"
            }
          },
          "effects": [{
            "_id": "SqIsOL9aeW6uGrdS",
            "changes": [{
                "key": "ATL.preset",
                "value": "RiteOfTheDawn",
                "mode": 0,
                "priority": "20"
              },
              {
                "key": "flags.midi-qol.DR.necrotic",
                "value": "1",
                "mode": 0,
                "priority": "18"
              },
              {
                "key": "macro.execute",
                "value": "rite-dawn",
                "mode": 0,
                "priority": "20"
              }
            ],
            "disabled": false,
            "duration": {
              "startTime": null
            },
            "icon": "icons/magic/light/explosion-beam-impact-silhouette.webp",
            "label": "Crimson Rite of the Dawn",
            "tint": null,
            "transfer": false,
            "flags": {
              "dae": {
                "stackable": "none",
                "macroRepeat": "none",
                "specialDuration": [],
                "transfer": false
              },
              "dnd5e-helpers": {
                "rest-effect": "Short Rest"
              }
            }
          }],
          "folder": "Pm23ke4mrxcWHV4g",
          "sort": 100000,
          "permission": {
            "default": 0,
            "5iqOgPLPmoUd9MiS": 3
          },
          "flags": {
            "ddbimporter": {
              "id": 1660841,
              "dndbeyond": {
                "requiredLevel": 3,
                "displayOrder": 1,
                "levelScale": {
                  "id": 186403,
                  "level": 5,
                  "description": "1d6 Hemocraft die",
                  "dice": {
                    "diceCount": 1,
                    "diceValue": 6,
                    "diceMultiplier": null,
                    "fixedValue": null,
                    "diceString": "1d6"
                  },
                  "fixedValue": null
                },
                "levelScales": [{
                    "id": 186402,
                    "level": 3,
                    "description": "1d4 Hemocraft die",
                    "dice": {
                      "diceCount": 1,
                      "diceValue": 4,
                      "diceMultiplier": null,
                      "fixedValue": null,
                      "diceString": "1d4"
                    },
                    "fixedValue": null
                  },
                  {
                    "id": 186403,
                    "level": 5,
                    "description": "1d6 Hemocraft die",
                    "dice": {
                      "diceCount": 1,
                      "diceValue": 6,
                      "diceMultiplier": null,
                      "fixedValue": null,
                      "diceString": "1d6"
                    },
                    "fixedValue": null
                  },
                  {
                    "id": 186404,
                    "level": 11,
                    "description": "1d8 Hemocraft die",
                    "dice": {
                      "diceCount": 1,
                      "diceValue": 8,
                      "diceMultiplier": null,
                      "fixedValue": null,
                      "diceString": "1d8"
                    },
                    "fixedValue": null
                  },
                  {
                    "id": 186405,
                    "level": 17,
                    "description": "1d10 Hemocraft die",
                    "dice": {
                      "diceCount": 1,
                      "diceValue": 10,
                      "diceMultiplier": null,
                      "fixedValue": null,
                      "diceString": "1d10"
                    },
                    "fixedValue": null
                  }
                ],
                "limitedUse": [{
                  "level": null,
                  "uses": 1
                }],
                "class": "Blood Hunter : Order of the Ghostslayer"
              }
            },
            "midi-qol": {
              "onUseMacroName": ""
            },
            "enhancedcombathud": {
              "set1s": false,
              "set2s": false,
              "set3s": false
            },
            "core": {
              "sourceId": "Item.1qmWKr5c8IPG7fni"
            },
            "magicitems": {
              "enabled": false,
              "equipped": false,
              "attuned": false,
              "charges": "0",
              "chargeType": "c1",
              "destroy": false,
              "destroyFlavorText": "reaches 0 charges: it crumbles into ashes and is destroyed.",
              "rechargeable": false,
              "recharge": "0",
              "rechargeType": "t1",
              "rechargeUnit": "r1",
              "sorting": "l"
            }
          }
        },
        "token": "Scene.KsTkM4Cy2lJtMG0r.Token.hJlTQgQa5cTfQ93m"
      },
      "dnd5e-helpers": {
        "rest-effect": "Short Rest"
      }
    }
  }
}*/
