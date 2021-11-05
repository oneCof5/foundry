/*
Midi-QOL OnUseMacro calls this macro from the Macro library.
The Abbot's weapon attacks are magical. When the Abbot hits with any weapon,
  the weapon deals an extra 4d8 radiant damage (included in the attack).
*/
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
if (lastArg.hitTargets[0].length === 0) return {};
let tokenD = canvas.tokens.get(lastArg.tokenId).actor;
let actorD = game.actors.get(lastArg.actor._id);
const targetD = canvas.tokens.get(lastArg.hitTargets[0].id);
const damage_type = "radiant";
const baseDice = 4; //4d8[radiant]
let numDice = args[0].isCritical ? 2 * baseDice  : baseDice;
let damageRoll = new Roll(`${numDice}d8`).evaluate({async:false});
game.dice3d.showForRoll(damageRoll);
new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damage_type, [targetD], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damage_type]})`, itemCardId: lastArg.itemCardId, damageList: lastArg.damageList});
