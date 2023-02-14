async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }

// Check if Dex tiebreaker is being used in the dnd5e system
const tieBreakerCheck = game.settings.get("dnd5e", "initiativeDexTiebreaker") ? 1 : 0; 

// who is in the current combat?
const theCs = game.combat.combatants.map(t=> {
  return {
    _id: t.data._id,
    initiative: t.data.initiative,
    actorId: t.data.actorId,
    name: t.data.document.actor.name
  }
});
theCs.sort(function (a,b) {
  return a.actorId - b.actorId
});

// filter for unique actors (all share same initiative)
let uniqueCs = [...new Map(theCs.map((m) => [m.actorId, m])).values()];
uniqueCs.forEach(u => {
  let thisActor = theCs.filter(i=>i.actorId === u.actorId);
  let tieBreaker = tieBreakerCheck * (game.actors.get(u.actorId).data.data.abilities.dex.value/100);
  let avgInitiative = Math.floor(thisActor.map(i=>Math.floor(i.initiative)).reduce((partialSum, a) => partialSum + a, 0) / thisActor.length) + tieBreaker;
  u.initiative = avgInitiative;
});

// only the necessary for the update
let newCs = theCs.map(m => {
  return{ 
    _id: m._id,
    initiative: uniqueCs.find(k=>k.actorId === m.actorId).initiative 
  };
});

// Update the Combat Tracker
await game.combat.updateEmbeddedDocuments("Combatant", newCs);