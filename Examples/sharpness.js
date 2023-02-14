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

// Updates selected weapon
if (args[0] === "on") {
  new Dialog({
    title: 'Sharpening Oil',
    content: `
    <style>
    .sharpening-oil .form-group {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        align-items: flex-start;
      }
      
      .sharpening-oil .radio-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        justify-items: center;
        flex: 1 0 25%;
        line-height: normal;
      }
      
      .sharpening-oil .radio-label input {
        display: none;
      }
      
      .sharpening-oil img {
        border: 0px;
        width: 50px;
        height: 50px;
        flex: 0 0 50px;
        cursor: pointer;
      }
          
      /* CHECKED STYLES */
      .sharpening-oil [type=radio]:checked + img {
        outline: 2px solid #f00;
      }
    </style>

    <h3>Pick your weapon:</h3>

    <form class="sharpening-oil">
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
          damageDice.push(["2d6", "slashing"])

          await tactor.updateEmbeddedDocuments("Item", [copyWeapon])
          
          DAE.setFlag(tactor, 'sharpeningOil', {
            weaponID: weaponId
          });
        }
      },
    },
  }).render(true);
}

if (args[0] === "off") {
  let flag = await DAE.getFlag(tactor, 'sharpeningOil')
  let { weaponID } = flag
  let Weapon = tactor.items.get(weaponID);

  let copyWeapon = foundry.utils.duplicate(Weapon);

  let weaponDamageParts = copyWeapon.data.damage.parts;
  for (let i = 0; i < weaponDamageParts.length; i++) {
    if (weaponDamageParts[i][0] === "2d6" && weaponDamageParts[i][1] === "slashing"){
      weaponDamageParts.splice(i, 1)
      tactor.updateEmbeddedDocuments("Item", [copyWeapon]);
      DAE.unsetFlag(tactor, `sharpeningOil`);
      return;
    }
  }
}