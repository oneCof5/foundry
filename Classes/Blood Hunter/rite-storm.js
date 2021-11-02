const lastArg = args[args.length - 1];
let actorD;
if (lastArg.tokenId) actorD = canvas.tokens.get(lastArg.tokenId).actor;
else actorD = game.actors.get(lastArg.actorId);
let tokenD = canvas.tokens.get(lastArg.tokenId).actor;
const target = canvas.tokens.get(lastArg.tokenId)

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
    title: 'Rite of the Storm',
    content: `
    <style>
    .rite-storm .form-group {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        align-items: flex-start;
      }

      .rite-storm .radio-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        justify-items: center;
        flex: 1 0 25%;
        line-height: normal;
      }

      .rite-storm .radio-label input {
        display: none;
      }

      .rite-storm img {
        border: 0px;
        width: 50px;
        height: 50px;
        flex: 0 0 50px;
        cursor: pointer;
      }

      /* CHECKED STYLES */
      .rite-storm [type=radio]:checked + img {
        outline: 2px solid #f00;
      }
    </style>

    <h3>Pick your weapon:</h3>

    <form class="rite-storm">
      <div class="form-group" id="weapons">
       ${weapon_content}
       </div>
    </form>
  `,
    buttons: {
      yes: {
        icon: '<i class="fas fa-check"></i>',
        label: 'Confirm',
        callback: async (html) => {
          let weaponId = $("input[type='radio'][name='weapon']:checked").val();
          let weapon = actorD.items.get(weaponId);
          let copyWeapon = foundry.utils.duplicate(weapon);

          let isMgc = copyWeapon.data.properties.mgc; // save current magic flag
          copyWeapon.data.properties.mgc = true; // regardless, its now magic

          copyWeapon.flags['midi-qol'].onUseMacroName = "ItemMacro"; // set the onUse to ItemMacro for this item

          // update the ItemMacro (copied from a manually configured Rapier with a working ItemMacro)
          copyWeapon.flags.itemacro = {
            "macro": {
                "data": {
                    "_id": null,
                    "name": weapon.name,
                    "type": "script",
                    "author": "5iqOgPLPmoUd9MiS",
                    "img": weapon.img,
                    "scope": "global",
                    "command": "async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }\nif (args[0].hitTargets[0] === undefined) return;\nconst lastArg = args[args.length - 1];\nif (lastArg.hitTargets[0].length === 0) return {};\nlet tokenD = canvas.tokens.get(lastArg.tokenId).actor;\nlet actorD = game.actors.get(lastArg.actor._id);\nconst target = canvas.tokens.get(lastArg.hitTargets[0].id);\nlet damage_type = \"lightning\";\nlet baseDie = 1;\nconst level = actorD.data.type === \"npc\" ? actorD.data.data.details.cr : actorD.classes[\"blood-hunter\"].data.data.levels;\nlet hemoDie = (4 + (2 * (Math.floor((level + 1) / 6))));\nlet critDie = 2*baseDie;\nlet attackDice = lastArg.isCritical ? `${critDie}d${hemoDie}`  : `${baseDie}d${hemoDie}`;\nlet damageRoll = new Roll(`${attackDice}`).evaluate({async:false});\ngame.dice3d?.showForRoll(damageRoll);\nnew MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damage_type, [target], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damage_type]})`, itemCardId: lastArg.itemCardId, damageList: lastArg.damageList});",
                    "folder": null,
                    "sort": 0,
                    "permission": {
                        "default": 0
                    },
                    "flags": {}
                }
            }
          }
          actorD.updateEmbeddedDocuments('Item', [copyWeapon])
          DAE.setFlag(actorD, 'flgRiteStorm', {
            weaponID: weaponId,
            isMagic: isMgc,
          });

          // Hemocrit Die Value and Damage Type
          const level = actorD.data.type === "npc" ? actorD.data.data.details.cr : actorD.classes["blood-hunter"].data.data.levels;
          let hemoDie = (4 + (2 * (Math.floor((level + 1) / 6))));
          let numDice = `1d${hemoDie}`
          let damage_type = "lightning";
          let damageRoll = new Roll(`${numDice}`).roll();

          game.dice3d?.showForRoll(damageRoll);
          new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damage_type, [target], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damage_type]})`, itemCardId: lastArg.itemCardId, damageList: lastArg.damageList});
        }
      },
    },
  }).render(true);
}

if (args[0] === "off") {
  let flag = await DAE.getFlag(actorD, 'flgRiteStorm')
  console.log("FLAG ",flag);
  let weapon = actorD.items.get(flag.weaponID);
  let copyWeapon = foundry.utils.duplicate(weapon);

  copyWeapon.data.properties.mgc = flag.isMagic;
  copyWeapon.flags['midi-qol'].onUseMacroName = "";
  delete copyWeapon.flags.itemacro;

  actorD.updateEmbeddedDocuments('Item', [copyWeapon])

  DAE.unsetFlag(actorD, `flgRiteStorm`);
}
