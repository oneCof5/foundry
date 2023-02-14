// console.log(args);
if (args[0].tag === "OnUse" && args[0].isCritical) {
  let attackingActor = await fromUuid(args[0].actorUuid);
  if (attackingActor.actor) attackingActor = attackingActor.actor;

  const castingToken = canvas.tokens.get(args[0].tokenId);
  const targets = MidiQOL.findNearby(null, castingToken, 30, 0);
  let theTs = targets.filter(function (token) {
    let undead = ['undead', 'fiend', 'reborn'].some(i => (token.actor.type === 'character' ? token.actor.system.details.race : token.actor.system.details.type.value).toLowerCase().includes(i));
    if (undead) return token;
  });
  const newTs = theTs.map((token) => token.document.id);
  game.user?.updateTokenTargets(newTs);
  game.user?.broadcastActivity({newTs});

  //const itemJson = `{"name": "Argynvost's Fury","type": "feat","img": "icons/creatures/reptiles/dragon-winged-blue.webp","effects": [{"changes": [{"key": "ATL.light.animation", "mode": 5, "value": "{'type':'ghost','speed':3,'intensity':5}", "priority": 50},{"key": "ATL.light.dim", "mode": 4, "value": "5", "priority": 50},{"key": "ATL.light.alpha", "mode": 5, "value": "0.5", "priority": 20},{"key": "ATL.light.bright", "mode": 4, "value": "1", "priority": 20},{"key": "ATL.light.color", "mode": 5, "value": "#80f6ff", "priority": 20}],"disabled": false,"icon": "icons/creatures/reptiles/dragon-winged-blue.webp","label": "Argynvost's Fury","transfer": false,"flags": {"dae": {"selfTarget": false,"stackable": "none","specialDuration": ["turnStartSource"],"transfer": false,"durationExpression": "","macroRepeat": "none"}}}],"system": {"description": {"value": "<p>When you score a critical hit with this weapon, the ornate dragon carving on the hilt animates and breathes holy fire along the blade, which then explodes outward from the wielder. The flames dispel any magical darkness within 30 feet of you. Each creature that is an aberration, fiend or undead within 30 feet of you must make a Constitution saving throw using your spell DC. On failed save, that creature takes 25 (10d4) radiant damage and emits dim light in a 5 ft. radius until the start of your next turn. On a successful save, the creature takes half as much damage and does not emit light.</p>"},"activation": {"type": "special"},"duration": {"units": "inst"},"actionType": "save","damage": {"parts": [["10d4[radiant]","radiant"]]},"save": {"ability": "con","dc": null,"scaling": "spell"}}}`;
  //const pseudoItem = new Item.implementation(JSON.parse(itemJson), { temporary: true, parent: attackingActor});

  // Build the Pseudo Item
  const myItem = game.items.getName("Argynvost's Fury");
  const myItemData = game.items.fromCompendium(myItem);
  const fake = new Item.implementation(myItemData, {parent: attackingActor, temporary: true});

  // Use the Pseudo Item
  //const use = await pseudoItem.use();
  const use = await fake.use({}, {flags: {dnd5e: {myItemData}}});
  if (!use) return;

  // Sparkles!
  if (game.modules.get("sequencer")?.active) {
    const seq = new Sequence();
    seq.effect()
      .file("modules/JB2A_DnD5e/Library/2nd_Level/Divine_Smite/DivineSmiteReversed_01_Regular_BlueYellow_Caster_400x400.webm")
      .atLocation(castingToken)
      .scaleToObject(12.5)
      .belowTokens()
      .fadeIn(500)
      .rotateIn(350, 1500, { ease: "easeInCubic" })
      .scaleIn(0, 1500, { ease: "easeInCubic" })
      .fadeOut(1500, { ease: "easeOutCubic", delay: 500 })
      .rotateOut(90, 2500, { ease: "easeInOutCubic" })
      .scaleOut(12, 2500, { ease: "easeInOutCubic" });
    seq.play()
  }

}

// https://discord.com/channels/170995199584108546/1010273821401555087/1055291151130824734
