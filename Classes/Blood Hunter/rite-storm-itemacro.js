//  Midi-QOL OnUse macro from the weapon making the attack.
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
if (lastArg.hitTargets[0] === undefined) return {};
let tokenD = canvas.tokens.get(lastArg.tokenId).actor;
let actorD = game.actors.get(lastArg.actor._id);
const target = canvas.tokens.get(lastArg.hitTargets[0].id);
const damage_type = "lightning";
const level = actorD.data.type === "npc" ? actorD.data.data.details.cr : actorD.classes["blood-hunter"].data.data.levels;
const hemoDie = (4 + (2 * (Math.floor((level + 1) / 6))));
const numDice = lastArg.isCritical ? 2 : 1;
let damageRoll = new Roll(`${numDice}d${hemoDie}[${damage_type}]`).evaluate({async:false});
game.dice3d?.showForRoll(damageRoll);
new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damage_type, [target], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damage_type]})`, itemCardId: lastArg.itemCardId, damageList: lastArg.damageList});
