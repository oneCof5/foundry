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

/*
data: {
    "_id": "jU8yhzbqRINNcDj5",
    "changes": [
        {
            "key": "data.attributes.hp.max",
            "mode": 5,
            "value": "15",
            "priority": "20"
        }
    ],
    "disabled": false,
    "duration": {
        "seconds": 86400,
        "startRound": 0,
        "startTime": 23124260700
    },
    "icon": "icons/skills/wounds/blood-drip-droplet-red.webp",
    "label": "Drain",
    "origin": "Actor.UkEZflEgjI4ysG2V.Item.SMv73BhOQa7lr2MW",
    "tint": "",
    "transfer": false,
    "flags": {
        "dae": {
            "transfer": true,
            "macroRepeat": "none",
            "specialDuration": []
        },
        "dnd5e-helpers": {
            "rest-effect": "Ignore"
        }
    }
}
*/
