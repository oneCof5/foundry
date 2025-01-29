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

if(args[0].hitTargets[0] === undefined) return {};
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
let damageRoll = new Roll(`${numDice}d6[${damage_type}]`).evaluate({async:false});
game.dice3d.showForRoll(damageRoll); //brag

let hpNow = targetD.actor.data.data.attributes.hp.max; //current max hp
let atkDamage = damageRoll.total; // save this attack bite damage
let totDamage = hpNow - atkDamage;

// necrotic bite damage applied to target
new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, atkDamage, damage_type, [targetD], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damage_type]})`, itemCardId: itemCiD, damageList: damList});
// healing back to the vampire
await MidiQOL.applyTokenDamage([{damage: atkDamage, type: "healing"}], atkDamage, new Set([tokenD]), itemD.name, new Set());

// Notify the GM
/*
The target’s hit point maximum is reduced by an amount equal to the necrotic
damage taken, and the vampire regains hit points equal to that amount. The reduction
lasts until the target finishes a long rest. The target dies if its hit point
maximum is reduced to 0.
*/
let hitContent = `<div class="midi-qol-nobox"><div class="midi-qol-flex-container"><div>This attack reduces ${targetD.name}'s Maximum Hit Points by ${atkDamage}.</div><div class="midi-qol-target-npc-GM"><em>The maximum hit points for ${targetD.name} have been reduced from ${hpNow} to ${totDamage} in this attack.</em></div><div class="midi-qol-target-npc-GM"><em>The reduction lasts until ${targetD.name} finishes a long rest.</em></div><div class="midi-qol-target-npc-GM"><em>${targetD.name} dies if this effect reduces its hit point maximum to 0.</em></div><div class="midi-qol-target-npc-GM"><em><b>${tokenD.name}<b> is healed for ${atkDamage}.</em></div></div></div>`;

await wait(600);
let chatMessage = game.messages.get(itemCiD);
let content = duplicate(chatMessage.data.content);
let searchString =  /<div class="midi-qol-saves-display">[\s\S]*<div class="end-midi-qol-saves-display">/g;
let replaceString = `<div class="midi-qol-saves-display"><div class="end-midi-qol-saves-display">${hitContent}`;
content = content.replace(searchString, replaceString);
chatMessage.update({content: content});

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
  await targetD.actor.updateEmbeddedDocuments('ActiveEffect', [effectData]);
}
