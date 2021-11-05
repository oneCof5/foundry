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
let actorD = game.actors.get(args[0].actor._id);
let tokenD = canvas.tokens.get(args[0].tokenId);
let targetD  = canvas.tokens.get(args[0].hitTargets[0].id);
let itemD = args[0].item;
let itemCiD = args[0].itemCardId;
let damList = args[0].damageList;
let gameRound = game.combat ? game.combat.round : 0;
let damage_type = "necrotic";

const baseDice = 3;  // Bite is 3d6
const numDice = args[0].isCritical ? baseDice * 2 : baseDice; // double dice on crit hit
let damageRoll = new Roll(`${numDice}d6`).roll(); // roll the damage
game.dice3d.showForRoll(damageRoll); //brag

let hpNow = targetD.actor.data.data.attributes.hp.max; //current max hp
let atkDamage = damageRoll.total; // save this attack bite damage
let totDamage = hpNow - atkDamage;

// necrotic bite damage applied to target
new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, atkDamage, damage_type, [targetD], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damage_type]})`, itemCardId: itemCiD, damageList: damList});
// healing back to the vampire
await MidiQOL.applyTokenDamage([{damage: atkDamage, type: "healing"}], atkDamage, new Set([tokenD]), itemD.name, new Set());

// Check for an existing effect. If not found, create one. If found, update total Bite damage incurred.
const effectDataLabel = "Bitten";
let effectData;
let checkEffect = await targetD.actor.data.effects.find(i => i.data.label === effectDataLabel);
if (!checkEffect) {
  effectData = {
    changes: [{ key: "data.attributes.hp.max", value: `${totDamage}`, mode: 5, priority: 20 }],
    disabled: false,
    duration: {startTime: game.time.worldTime},
    flags: {
      dae: { transfer: true, macroRepeat: "none", specialDuration: [] },
      "dnd5e-helpers": { "rest-effect": "Long Rest" }
    },
    label : effectDataLabel,
    origin: args[0].uuid,
    icon : "icons/skills/wounds/blood-drip-droplet-red.webp",
    transfer: false
  }
  await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetD.actor.uuid, effects: [effectData]});
  return
} else if (checkEffect) {
  effectData = {
    _id: checkEffect.id,
    changes: [
      { key: "data.attributes.hp.max", value: `${totDamage}`, mode: 5, priority: 20 }
    ]
  }
  await targetD.actor.updateEmbeddedDocuments('ActiveEffect', [effectData])
}

// Notify the GM
let the_message = `<p>${tokenD.name} drains ${targetD.name} of ${atkDamage} pts from their maximum Hit Point value!</p><p>${targetD.name} now has Maximum Hit Point maximum of ${totDamage} (reduced from ${hpNow}.</p><p><b>If ${targetD.name} reaches zero, they die!</b></p><br><p> ${tokenD.name} regains ${atkDamage} Hit Points!</p>`;
await wait(600);
ChatMessage.create({
  user: game.user._id,
  speaker: ChatMessage.getSpeaker({actorD: actorD}),
  content: the_message,
  whisper: game.users.entities.filter(u => u.isGM).map(u => u._id),
  type: CONST.CHAT_MESSAGE_TYPES.EMOTE
  });
