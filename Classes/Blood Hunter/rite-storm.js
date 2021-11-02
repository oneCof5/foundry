//DAE Macro, effect value = @item.level

const lastArg = args[args.length - 1];
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);
const target = canvas.tokens.get(lastArg.tokenId)
const DAEItem = lastArg.efData.flags.dae.itemData

let weapons = tactor.items.filter(i => i.data.type === `weapon`);

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

// Hemocrit Die Value and Damage Type
let hemoDie = (4 + (2 * (Math.floor((level + 1) / 6))));
let riteDmgType = "lightning"
let riteDmgString = `1d${hemoDie}[${riteDmgType}]` // eg 1d4[radiant]

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

          let weapon = tactor.items.get(weaponId);

          let copyWeapon = foundry.utils.duplicate(weapon);

          let damageDice = copyWeapon.data.damage.parts
          damageDice.push([riteDmgString,riteDmgType])

          await tactor.updateEmbeddedDocuments("Item", [copyWeapon])

          DAE.setFlag(tactor, 'flgRiteStorm', {
            weaponID: weaponId
          });
        }
      },
    },
  }).render(true);
}

if (args[0] === "off") {
  let flag = await DAE.getFlag(tactor, 'flgRiteStorm')
  let { weaponID } = flag
  let Weapon = tactor.items.get(weaponID);

  let copyWeapon = foundry.utils.duplicate(Weapon);

  let weaponDamageParts = copyWeapon.data.damage.parts;
  for (let i = 0; i < weaponDamageParts.length; i++) {
    if (weaponDamageParts[i][0] === riteDmgString && weaponDamageParts[i][1] === riteDmgType){
      weaponDamageParts.splice(i, 1)
      tactor.updateEmbeddedDocuments("Item", [copyWeapon]);
      DAE.unsetFlag(tactor, `flgRiteStorm`);
      return;
    }
  }
}
