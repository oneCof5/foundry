if (args[0] === "off" && args[2]["expiry-reason"] === "midi-qol:isMoved") {
  const sourceItem = await fromUuid(args[2].origin);
  let casterActor = await fromUuid(sourceItem.parent.uuid);
  if (casterActor.actor) casterActor = casterActor.actor;
  const damageRoll = await new Roll(`${args[1]}d8[thunder}]`).evaluate({async: true});
  game.dice3d?.showForRoll(damageRoll);
  const bbMove = {
    "name": "Booming Blade (Movement)",
    "type": "feat",
    "system": {
      "description": {"value": "<p>Voluntary movement triggers Booming Blade secondary damage.</p>"},
      "activation": {"type": "special","cost": null,"condition": ""},
      "duration": {"value": null, "units": "inst"},
      "target": {"value": null, "width": null,"units": "", "type": "self"},
      "range": {"value": null, "long": null, "units": "self"},
      "actionType": "other",
      "damage": {"parts": [[`${args[2]}d8[thunder]`, "thunder"]] }
    },
    "img": "icons/skills/melee/sword-stuck-glowing-pink.webp",
    "effects": [{
      "label": "Booming Blade (Movement)",
      "icon": "icons/skills/melee/sword-stuck-glowing-pink.webp",
      "origin": `${args[2].origin}`,
      "duration": {"rounds": 1},
      "disabled": false,
      "changes": [{ "key": "macro.itemMacro", "mode": 0, "value": "2", "priority": 20}],
      "transfer": false,
      "flags": {"dae": {"selfTarget": false,"selfTargetAlways": true, "stackable": "none", "durationExpression": "", "macroRepeat": "none", "specialDuration": ["isMoved"]}}
    }],
    "flags": {"midi-qol": {"effectActivation": false,"noProvokeReaction": true}}
  };
  const pseudoOwneditem = new Item.implementation(bbMove, {parent: casterActor, temporary: true});
  const options = { showFullCard: false, createWorkflow: true, configureDialog: false, versatile: false, isCritical: false};
  await MidiQOL.completeItemRoll(pseudoOwneditem,options);
}