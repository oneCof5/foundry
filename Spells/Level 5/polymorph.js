/* Source: https://ko-fi.com/post/Powermorph-Phase-3-Transform-ALL-the-Things-Z8Z67WTTM */
/* 
DAE ItemMacro - on shapes and off reverts 
DAE passes source token and actor
*/

if (args[0] === "on") {
  /* The casting actor and token (documents) */
  const casterActorDoc = game.actors.get(args[1].actorId);
  const casterTokenDoc = canvas.scene.tokens.get(args[1].tokenId);

  /* Define the matching actor names for shapes */
  const names = ["Vampiric Mist", "Bat", "Wolf"];

  /* Prompt for target form */
  const results = await warpgate.menu({ inputs: [{ type: 'select', label: 'Choose target form', options: names }] }, { title: 'Powermorph (alpha)' });

  /* if cancelled, bail */
  if (!results.buttons) return;

  /* get desired actor */
  const targetActor = game.actors.getName(results.inputs[0]);

  /* if we couldnt find the actor (weird), bail */
  if (!targetActor) return;

  /* get the full actor data */
  const actorUpdates = targetActor.toObject();

  /* prune un-needed actor data */
  /* proto token data isnt needed */
  delete actorUpdates.token;
  /* we will handle the items ourselves */
  delete actorUpdates.items;
  /* just ignoring active effects entirely */
  delete actorUpdates.effects;
  /* dnd5e: npc and character are nearly interchangable. If we dont switch the type, we dont have to fool with the sheet app caching. */
  delete actorUpdates.type;

  /* set up updates for the name and position */
  const updates = {
    "x": casterTokenDoc.x,
    "y": casterTokenDoc.y,
    "elevation": casterTokenDoc.elevation,
    "name": casterTokenDoc.name + " (" + results.inputs[0] + ")"
  };

  const tokenUpdates = (await targetActor.getTokenDocument(updates)).toObject();

  /* Protects the actor a bit more, but requires you 
   * to close and repon the sheet after reverting.
   */
  //tokenUpdates.actorLink = false; //protects the actor a bit more,
  //but requires you to close/reopon
  //the sheet after revert

  /* leave the actor link unchanged for a more seamless mutation */
  delete tokenUpdates.actorLink;

  /* we want to keep our source actor, not swap to a new one entirely */
  delete tokenUpdates.actorId;

  /* grab the item data from the new actor and flag it for later */
  const newItems = targetActor.getEmbeddedCollection('Item').reduce((acc, element) => {
    acc[element.id] = element.toObject();
    setProperty(acc[element.id], 'flags.warpgate.powerMorph.delete', true);
    return acc;
  }, {});

  /* mark all of our items (except for Shapechanger and Move Legendary Actions) for delete */
  const itemUpdates = casterActorDoc.items.reduce((acc, val) => {
    if (val.system.activation.type === "legendary" && (val.name === "Shapechanger" | val.name == "Move")) {
      let valObj = val.toObject();
      delete valObj._id;
      acc[val.id] = valObj;
      setProperty(acc[val.id], 'flags.warpgate.powerMorph.delete', true);
    } else {
      acc[val.id] = warpgate.CONST.DELETE;
    }
    return acc;
  }, newItems);

  console.log("SHAPECHANGER: ", { token: tokenUpdates, actor: actorUpdates, items: itemUpdates });

  const mutationName = `Mutated into ${targetActor.name}`

  /* Perform the mutation */
  await warpgate.mutate(casterTokenDoc,
    { token: tokenUpdates, actor: actorUpdates, embedded: { Item: itemUpdates } },
    {},
    { name: mutationName, comparisonKeys: { Item: 'id' }, updateOpts: { embedded: { Item: { renderSheet: false } } } }
  );

  /* We need to modify mutation stack to removed added items since we didn't know their IDs prior to creation */
  /* get our revert data */
  let mutationStack = warpgate.mutationStack(casterTokenDoc);
  let powerMorphStack = mutationStack.getName(mutationName);

  /* trim out delete keys for old IDs as they no longer exist */
  powerMorphStack.delta.embedded.Item = Object.values(powerMorphStack.delta.embedded.Item).reduce((acc, val) => {
    if (val.name !== val !== warpgate.CONST.DELETE) {
      acc[val._id] = val;
    }
    return acc;
  }, {})

  /* add in deletes for items that we added via powerMorph */
  casterActorDoc.items.forEach((item) => {
    if (getProperty(item, 'flags.warpgate.powerMorph.delete')) {
      powerMorphStack.delta.embedded.Item[item.id] = warpgate.CONST.DELETE;
    }
  });

  console.log("SHAPECHANGER: ", { mutationStack: mutationStack, powerMorphStack: powerMorphStack });

  /* update the data and commit the change */
  mutationStack.update(powerMorphStack.name, powerMorphStack, { overwrite: true })
  await mutationStack.commit();
}