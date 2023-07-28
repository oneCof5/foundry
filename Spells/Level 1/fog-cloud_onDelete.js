// REMOVE BLINDED FROM CONTAINED TOKENS
// const template = canvas.templates.get("lZySQQ3FH7sgbkJ0").document;
const uuids = await findContained(template);
console.log(uuids);
for (let uuid of uuids) {
  const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Blinded', uuid);
  if (hasEffectApplied) {
    game.dfreds.effectInterface.removeEffect({ effectName: 'Blinded', uuid });
  }
}

async function findContained(templateDoc) {
//  const origin = templateDoc.getFlag("dnd5e","origin");
  const item = await fromUuid(templateDoc.flags.dnd5e.origin);
  const tokens = canvas.tokens.placeables.filter(token => !!token.actor);
  const range = item.system.target.value;
  const contained = new Set();
  const {x,y} = templateDoc;
  const templateArgs = {coords: {x,y}, elevation: templateDoc.flags.levels.elevation};
  for (const token of tokens) {
    const tokenArgs = {coords: token.center, elevation: token.document.elevation}
    const dist = await checkDistance(tokenArgs, templateArgs);
    if (dist <= range) {
        contained.add(token.actor.uuid);
    }
  }
  return [...contained];
}

// 

async function checkDistance(A, B) {
  const dist = canvas.grid.measureDistance(A.coords,B.coords, {gridSpaces: true});
  const height = Math.abs(B.elevation - A.elevation);
  const maxDist = Math.max(dist,height);
  return maxDist;
}