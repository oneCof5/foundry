const lastArg = args.at(-1);
const caster = await fromUuid(lastArg.actorUuid);

// DAE itemMacro with spawned tokenId as argument
if (args[0] == "off") {
  warpgate.dismiss(args[1]); // kill the token
  return;
}

if (lastArg.macroPass === "postActiveEffects") {
  const casterToken = caster.getActiveTokens(false, true)[0];

  // define updates
  const updates = {};

  // define options
  const options = { controllingActor: caster };

  // define callbacks
  const callbacks = {};

  // Summon the token
  const steedTokenId = (await warpgate.spawn("Leux", updates, callbacks, options))[0];
  // console.log("#### Warpgate spawned tokenid is ", steedTokenId);

  // Update the DAE flag with the spawned token so it can be dismissed later
  let steedEffect = caster.effects.find(e => e.label === "Summon Steed");
  // console.log("#### steedEffect: ", steedEffect);
  steedEffect.update({
    "changes": [{
      "key": "macro.itemMacro",
      "value": `${steedTokenId}`,
      "mode": 0,
      "priority": 10
    }]
  })
}
