/* 
ItemMacro attached to the actual item the Rite of Dawn has been applied to via the rite-dawn.js and DAE effect
*/
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }\nif (args[0].hitTargets[0] === undefined) return;\nconst lastArg = args[args.length - 1];

if (lastArg.hitTargets[0].length === 0) return {};

let tokenD = canvas.tokens.get(lastArg.tokenId).actor;
let actorD = game.actors.get(lastArg.actor._id);
const target = canvas.tokens.get(lastArg.hitTargets[0].id);

// Rite of Dawn deals additional damage to undead. Is the target 'undead'
const undead = target.actor.data.type === "npc" ? ["undead"].some(value => (target.actor.data.data.details.type.value || "").toLowerCase().includes(value)) : ["undead"].some(race => (target.actor.data.data.details.race || "").toLowerCase().includes(race));

// determine hemocrit die that scales by Blood Hunter level
const level = actorD.data.type === "npc" ? actorD.data.data.details.cr : actorD.classes["blood-hunter"].data.data.levels;
let hemoDie = (4 + (2 * (Math.floor((level + 1) / 6)))); // 5 (d6), 11 (d8), 17 (d10)
let baseDie = 1;
let damage_type = "radiant";

if(undead) { baseDie += 1;} // if we hit an undead, roll another
let critDie = 2*baseDie; // default rules for crits
let numDice = lastArg.isCritical ? `${critDie}d${hemoDie}`  : `${baseDie}d${hemoDie}`;
let damageRoll = new Roll(`${numDice}d6`).roll();
game.dice3d?.showForRoll(damageRoll); // show the animated dice
// pass to Midi-QOL
new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damage_type, [target], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damage_type]})`, itemCardId: lastArg.itemCardId, damageList: lastArg.damageList});
