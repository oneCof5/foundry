/*
ItemMacro attached to the actual item the Rite of Storm has been applied to via the rite-storm.js and DAE effect
*/
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
if (lastArg.hitTargets[0].length === 0) return {};
let tokenD = canvas.tokens.get(lastArg.tokenId).actor;
let actorD = game.actors.get(lastArg.actor._id);
const targetD = canvas.tokens.get(lastArg.hitTargets[0].id);
// Rite of Dawn deals additional damage to undead. Is the target 'undead'
const undead = targetD.actor.data.type === "npc" ? ["undead"].some(value => (targetD.actor.data.data.details.type.value || "").toLowerCase().includes(value)) : ["undead"].some(race => (targetD.actor.data.data.details.race || "").toLowerCase().includes(race));

// determine hemocrit die that scales by Blood Hunter level
const level = actorD.data.type === "npc" ? actorD.data.data.details.cr : actorD.classes["blood-hunter"].data.data.levels;
let hemoDie = (4 + (2 * (Math.floor((level + 1) / 6)))); // 5 (d6), 11 (d8), 17 (d10)
let baseDie = 1;
let numDice = lastArg.isCritical ? 2 * baseDie : baseDie;
let damage_type = "lightning";
let damageRoll = new Roll(`${numDice}d${hemoDie}`).evaluate({async:false});
game.dice3d.showForRoll(damageRoll); // show the animated dice
// pass to Midi-QOL
new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damage_type, [targetD], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damage_type]})`, itemCardId: lastArg.itemCardId, damageList: lastArg.damageList});
