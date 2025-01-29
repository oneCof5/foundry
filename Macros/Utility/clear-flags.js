const flags = ['ddb-importer','ddbimporter','enhancedcombathud', 'midi-qol', `foundryvtt-mountup`]; // all flag names here
const updates = game.actors.map(a => {
  const update = {_id: a.id};
  for(const flag of flags) update[`flags.-=${flag}`] = null;
  return update;
});
await Actor.updateDocuments(updates);