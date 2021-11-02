/*
Midi-QOL OnUseMacro calls this macro from the Macro library.
BITE (Strahd von Zarovich)
*Melee Weapon Attack*: +9 to hit, reach 5 ft., one willing creature, or a creature
that is grappled by Strahd, incapacitated, or restrained. *Hit*: 7 (1d6 + 4)
piercing damage plus 10 (3d6) necrotic damage.
The target’s hit point maximum is reduced by an amount equal to the necrotic
damage taken, and Strahd regains hit points equal to that amount. The reduction
lasts until the target finishes a long rest. The target dies if its hit point
maximum is reduced to 0. A humanoid slain in this way and then buried in the
ground rises the following night as a vampire spawn under Strahd’s control.
*/
async function wait(ms) {return new Promise(resolve => {setTimeout(resolve, ms);});}

if(args[0].hitTargets.length === 0) return {};

let tokenD = canvas.tokens.get(args[0].tokenId);
let actorD = game.actors.get(args[0].actor._id);
let target  = canvas.tokens.get(args[0].hitTargets[0].id);
let itemD = args[0].item;
let gameRound = game.combat ? game.combat.round : 0;
let damage_type;

const diceMult = args[0].isCritical ? 2: 1;
const numDice = 3 * diceMult;
args[0].isCritical ? numDice * 2 : numDice;
let damageRoll = new Roll(`${numDice}d6`).roll();
game.dice3d?.showForRoll(damageRoll); // show the animated dice

// necrotic damage
damage_type = "necrotic";
new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damage_type, [target], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damage_type]})`, itemCardId: lastArg.itemCardId, damageList: lastArg.damageList});
// healing back to the vampire
damage_type = "healing"
await MidiQOL.applyTokenDamage([{damage: damageRoll.total, type: damage_type}], damageRoll.total, new Set([tokenD]), itemD.name, new Set());

// Create an Effect for this necrotic damage
const effectData = {
  label : "Drain",
  icon : "icons/skills/wounds/blood-drip-droplet-red.webp",
  origin: args[0].uuid,
  changes: [{
    "key": "data.attributes.hp.tempmax", //   "key": "data.attributes.hp.max",
    "value": `-${damageRoll.total}`,
    "mode": 2,
    "priority": 20
    }],
  disabled: false,
  duration: {seconds: 86400,startRound: gameRound, startTime: game.time.worldTime}, // expires after long rest, but for now 24h
}

await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: target.actor.uuid, effects: [effectData]});

// Notify the GM
let hpNow = target.actor.data.data.attributes.hp.max; //current max hp
let hpNowMax = target.actor.data.data.attributes.hp.tempmax; // current tempmax hp (if previously drained, this will be negative)
let updateHP = hpNow + hpNowMax; // total hitpoint reduction
let the_message = `<p>${tokenD.name} drains ${target.name} of ${damageRoll.total} pts from their maximum Hit Point value!</p><p>${target.name} now has Maximum Hit Point maximum of ${updateHP}.</p><br><p><b>If it reaches ZERO, they die!!</b></p><br><p> ${tokenD.name} regains ${damageRoll.total} Hit Points back!</p>`;

await wait(600);
ChatMessage.create({
  user: game.user._id,
  speaker: ChatMessage.getSpeaker({actorD: actorD}),
  content: the_message,
  whisper: game.users.entities.filter(u => u.isGM).map(u => u._id),
  type: CONST.CHAT_MESSAGE_TYPES.EMOTE
  });
