/*
Midi-QOL OnUseMacro calls this macro from the Macro library.
The Abbot's weapon attacks are magical. When the Abbot hits with any weapon,
  the weapon deals an extra 4d8 radiant damage (included in the attack).
*/
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
if (args[0].hitTargets[0] === undefined) return;
const lastArg = args[args.length - 1];
if (lastArg.hitTargets[0].length === 0) return {};
let tokenD = canvas.tokens.get(lastArg.tokenId).actor;
let actorD = game.actors.get(lastArg.actor._id);
const target = canvas.tokens.get(lastArg.hitTargets[0].id);
const damage_type = "radiant";
let numDice = lastArg.isCritical ? '8d8'  : '4d8';
let damageRoll = new Roll(`${numDice}`).roll();
game.dice3d.showForRoll(damageRoll); // show the animated dice
new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damage_type, [target], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damage_type]})`, itemCardId: lastArg.itemCardId, damageList: lastArg.damageList});
