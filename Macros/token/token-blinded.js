const lastArg = args[args.length - 1];
let actorD, tokenD;
if (lastArg.tokenId) {
  tokenD = canvas.tokens.get(lastArg.tokenId);
  actorD = tokenD.actor;
}
else { actorD = game.actors.get(lastArg.actorId); }
//console.log('TOKEN BLINDED MACRO ARGS: ', {lastArg, tokenD, actorD});
if (args[0] === "on") {
  // save current vision so it can be restored
  await DAE.setFlag(actorD, 'daeTokenBlind', {'_id': tokenD.id,'dimSight': tokenD.dimSight, 'brightSight': tokenD.brightSight});
  // remove vision from this token
  let updates = {'_id': tokenD.id,'dimSight': 0,'brightSight': 0};
  await canvas.scene.updateEmbeddedDocuments('Token', [updates]);
}

if (args[0] === 'off') {
  let flag = DAE.getFlag(actorD, 'daeTokenBlind');
  if (flag) {
    let updates = {'_id': flag._id,'dimSight': flag.dimSight,'brightSight': flag.brightSight};
    await canvas.scene.updateEmbeddedDocuments('Token', [updates]);
  } else {
    ui.notifications.error(`Could not locate any previously saved sight values.`);
  } 
}