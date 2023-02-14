const lastArg = args[args.length - 1];
if (!lastArg) return {};

// MidiQOL OnUse - checks for crit hits/fails and calls "Argynvost's Fury" if needed.
if (lastArg.tag === "OnUse" && lastArg.isCritical) {
  let attackingActor = await fromUuid(lastArg.actorUuid);
  if (attackingActor.actor) attackingActor = attackingActor.actor;
	const theItem = attackingActor.items.find(i=>i.name==="Argynvost's Fury")
	console.log('the found item',theItem);
  const use = await theItem.use();
	if (!use) return;
}