console.log("Detect Evil and Good", args);
let evilGoodTokens = canvas.tokens.placeables.filter(t => {
  let raceOrType = t.actor?.type === 'character' ? t.actor?.system.details?.race : t.actor?.system.details?.type.value;
  raceOrType = raceOrType.toLowerCase();
  let nearbyEG = (
    t.actor &&
    t.actor?.id !== _token.actor?.id && // not source actor
    t.actor?.system.attributes?.hp?.value > 0 && // not incapacitated
    ['aberration','celestial','elemental','fey','fiend','undead','reborn'].some(i => raceOrType.includes(i))
  );
  return nearbyEG;
})
let actorUuids = nearbyEG.map(t => t.actor.uuid); // get multiple uuids
game.dfreds.effectInterface.toggleEffect('Purple Glow', { uuids: actorUuids });