if (args[0].tag === "OnUse" && (args[0].isCritical || args[0].isFumble)) {
  let attackingActor = await fromUuid(args[0].actorUuid);
  if (attackingActor.actor) attackingActor = attackingActor.actor;

  // On Critical Fail, target yourself
  if (args[0].isFumble) {
    const myself = await fromUuid(tokenUuid);
    game.user?.updateTokenTargets(myself);
    game.user?.broadcastActivity({ myself });
  }

  // Locate the Roll Table from the world compendium and draw a result
  const comp = game.packs.get("world.curse-of-strahd-tables");
  const tableId = comp.index.find(n => n.name === "Mockeries")._id;
  const table = await comp.getDocument(tableId);
  if (!table) return ui.notifications.warn("Missing Mockeries table.");
  const { results } = await table.draw();
  let outputHTML = `<hr>${results[0].text}<br/>`
  ChatMessage.create({
    user: game.user._id,
    content: outputHTML,
    speaker: game.collections.get("User").filter((u) => u.isGM).map((u) => game.data.userId),
    flavor: "Hawksinger's Legacy mocks [theTarget] mercilessly."
  });

  // Build the Pseudo Item
  const itemJson = `
  {"name": "Harsh Critique","type": "feat","img": "icons/skills/toxins/cup-goblet-poisoned-spilled.webp","effects": [{"changes": [{"key": "flags.midi-qol.disadvantage.attack.all","mode": 2,"value": "1","priority": 20}],"disabled": false,"duration": {"startTime": null,"seconds": null,"combat": null,"rounds": null,"turns": null,"startRound": null,"startTurn": null},"icon": "icons/skills/toxins/cup-goblet-poisoned-spilled.webp","label": "Harsh Critique","transfer": false,"flags": {"dae": {"stackable": "none","durationExpression": "","macroRepeat": "none","specialDuration": ["1Attack","turnEnd"],"transfer": false}}}],"system": {"description": {"value": "<p>Hawksinger's Legacy unleashes a string of insults laced with subtle enchantments at a creature within it's perception. If the target can hear (though it need not understand), it must succeed on a Wisdom saving throw (DC 16) or take 2d4 psychic damage and have disadvantage on the next attack roll it makes before the end of its next turn.</p>"},"activation": {"type": "special",},"duration": {"value": null,"units": "inst"},"target": {"value": null,"width": null,"units": "","type": "creature"},"actionType": "save","damage": {"parts": [["2d4[psychic]","psychic"]]},"save": {"ability": "wis","dc": 16,"scaling": "flat"}}}`;
  const pseudoItem = new Item.implementation(JSON.parse(itemJson), { temporary: true, parent: attackingActor });

  // Use the Pseudo Item
  const use = await pseudoItem.use();
  if (!use) return;

}