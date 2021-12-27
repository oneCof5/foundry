/*
DAE Macro.execute

Crimson Rite. As a bonus action, you can activate a crimson rite on a single
  weapon with the elemental energy of a known rite of your choice that lasts
  until you finish a short or long rest, or if you aren’t holding the weapon
  at the end of your turn. When you activate a rite, you lose a number of hit
  points equal to one roll of your hemocraft die, as shown in the Hemocraft Die
  column of the Blood Hunter table.
  For the duration, attacks from this weapon deal additional damage of the
    chosen rite’s type. This damage is magical, and increases as you gain levels
    as a blood hunter, as shown in the Hemocraft Die column of the Blood Hunter
    table. A weapon can only hold a single active rite at a time.
  Hemocraft Die by Level
  1-4: 1d4 | 5-10: 1d6 | 11-16: 1d8 | 17+: 1d10
*/

const lastArg = args[args.length - 1];
let actorD;
if (lastArg.tokenId) actorD = canvas.tokens.get(lastArg.tokenId).actor;
else actorD = game.actors.get(lastArg.actorId);
let tokenD = canvas.tokens.get(lastArg.tokenId).actor;
const target = canvas.tokens.get(lastArg.tokenId);

// Get Weapons
let weapons = actorD.items.filter(i => i.data.type === `weapon`);
if(!weapons) return;
let weapon_content = "";
for (let weapon of weapons) {
  weapon_content += `
  <label class="radio-label">
    <input type="radio" name="weapon" value="${weapon.id}">
    <img src="${weapon.img}" style="border:0px; width: 50px; height:50px;">
    ${weapon.data.name}
  </label>
  `;
}

// Updates selected weapon
if (args[0] === "on") {
  // dialog option
  new Dialog({
    title: 'Rite of the Dawn',
    content: `<style>.rite-dawn .form-group {display: flex; flex-wrap: wrap; width: 100%; align-items: flex-start;} .rite-dawn .radio-label {display: flex; flex-direction: column; align-items: center; text-align: center; justify-items: center; flex: 1 0 25%; line-height: normal;} .rite-dawn .radio-label input {display: none;} .rite-dawn img {border: 0px; width: 50px; height: 50px; flex: 0 0 50px; cursor: pointer;} /* CHECKED STYLES */ .rite-dawn [type=radio]:checked + img {outline: 2px solid #f00;}</style><h3>Pick your weapon:</h3><form class="rite-dawn"><div class="form-group" id="weapons">${weapon_content}</div></form>`,
    buttons: {
      yes: {
        icon: '<i class="fas fa-check"></i>',
        label: 'Confirm',
        callback: async (html) => {
/*
// remove any preexisting Crimson Rite effects
// cant run this here because it removes the effect applied at the start of this call by dae
          const riteEffects = ["Crimson Rite of the Dawn","Crimson Rite of the Storm"];
          let activeRites = target.actor.effects.filter(i => riteEffects.includes(i.data.label));
          console.log("DEBUG activeRites", activeRites);
          if ( activeRites.length > 0) {
            console.log("Existing Crimson Rite Effect will be removed.");
            const riteEffectIds = activeRites.map( e => e.id);
            await target.actor.deleteEmbeddedDocuments('ActiveEffect', riteEffectIds);
          }
*/
          // A weapon is chosen
          const weaponId = $("input[type='radio'][name='weapon']:checked").val();
          const weapon = await actorD.items.get(weaponId);
          let copyWeapon = await foundry.utils.duplicate(weapon);
          const weaponName = copyWeapon.name;
          const isMgc = copyWeapon.data.properties.mgc;
          const origOnUse = copyWeapon.flags["midi-qol"].onUseMacroName;
          let newOnUse = "[postActiveEffects]rite-dawn-weapon-attack," + origOnUse;
          console.log("ORIG ON USE: ",origOnUse);
          console.log("NEW ON USE: ",newOnUse);

          // update values
          copyWeapon.name = `${weaponName} (Rite of the Dawn)`;
          copyWeapon.data.properties.mgc = true;
          copyWeapon.flags["midi-qol"].onUseMacroName = newOnUse;

          await actorD.updateEmbeddedDocuments('Item', [copyWeapon]);
          DAE.setFlag(actorD, 'flgRiteDawn', {
            wId: weaponId,
            isMagic: isMgc,
            wName: weaponName,
            wMidiQOL: origOnUse
          });

          // The Blood Hunter damages themselves
          const level = actorD.data.type === "npc" ? actorD.data.data.details.cr : actorD.classes["blood-hunter"].data.data.levels;
          const hemoDie = (4 + (2 * (Math.floor((level + 1) / 6))));
          const damage_type = "radiant";
          let damageRoll = new Roll(`1d${hemoDie}`).evaluate({async:false});
//          game.dice3d?.showForRoll(damageRoll);
          await new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damage_type, [target], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damage_type]})`, itemCardId: lastArg.itemCardId, damageList: lastArg.damageList});
        }
      },
    },
  }).render(true);
}

if (args[0] === "off") {
  const flag = await DAE.getFlag(actorD, 'flgRiteDawn');
  const weapon = actorD.items.get(flag.wId);
  let copyWeapon = await foundry.utils.duplicate(weapon);

  // update values
  copyWeapon.name = `${flag.wName}`;
  copyWeapon.data.properties.mgc = flag.isMagic;
  copyWeapon.flags["midi-qol"].onUseMacroName = flag.wMidiQOL ;

  await actorD.updateEmbeddedDocuments('Item', [copyWeapon]);
  DAE.unsetFlag(actorD, `flgRiteDawn`);
}
