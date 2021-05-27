/*
Paladin Channel Divinity Sacred Weapon
Contained in ItemMacro
DAE Custom ItemMacro with @target as a param
*/
let target = canvas.tokens.get(args[1]);
const lastArg = args[args.length - 1];
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);


const DAEItem = lastArg.efData.flags.dae.itemData
const saveData = DAEItem.data.save

// DAE flag
let flagName = 'sacredWeapon';

// Get this actor's Weapons
let weapons = tactor.items.filter(i => i.data.type === `weapon`);
let weapon_content = ``;

for (let weapon of weapons) {
  weapon_content += `<option value=${weapon.id}>${weapon.name}</option>`;
}

if (args[0] === "on") {
  // weapon picker
  let content = `
<div class="form-group">
  <label>Weapons : </label>
  <select name="weapons">
    ${weapon_content}
  </select>
</div>`;

  new Dialog({
    title: "Sacred Weapon: Choose a weapon",
    content,
    buttons: {
      Ok: {
        label: `Ok`,
        callback: (html) => {
          // select the weapon and make a copy
          let itemId = html.find('[name=weapons]')[0].value;
          let weaponItem = tactor.items.get(itemId);
          let copy_item = duplicate(weaponItem);
          let attackBonus = copy_item.data.attackBonus;
          let weaponMagic = copy_item.data.properties.mgc;

          // save off baseline
          DAE.setFlag(tactor, flagName, {
            id: itemId,
            attackBonus: attackBonus,
            propertiesMgc: weaponMagic
          });

          // add the CHA based attack bonus
          let chaBonus = tactor.data.data.abilities.cha.mod
          attackBonus = Number(attackBonus) + chaBonus;
          copy_item.data.attackBonus = attackBonus;

          // set weapon as magical
          copy_item.data.properties.mgc = true;

          // update the weapon
          tactor.updateEmbeddedEntity("OwnedItem", copy_item);

          // inform the player
          ui.notifications.notify("Sacred Weapon (Active): "+ copy_item.name + " is empowered.");
        }
      },
      Cancel: {
        label: `Cancel`
      }
    }
  }).render(true);

  // emit bright light from weapon for 20 ft
  target.update({
    "dimLight": 40,
    "brightLight": 20,
    "lightAlpha": 0.10,
    "lightAngle": 360,
    "lightAnimation": {
      "type": "torch",
      "speed": 1,
      "intensity": 1
    },
    "lightColor": "#ffdd00"
  });

}

if (args[0] === "off") {
  // Remove OnUse
  let flag = DAE.getFlag(tactor, flagName)
  let weaponItem = tactor.items.get(flag.id);
  let copy_item = duplicate(weaponItem);
  copy_item.data.attackBonus = flag.attackBonus;
  tactor.updateEmbeddedEntity("OwnedItem", copy_item);

  // remove the light from the weapon
  target.update({
    "dimLight": 0,
    "brightLight": 0,
    "lightAlpha": 1,
    "lightAnimation": {
      "type": "none"
    },
    "lightColor": "#ffdd00"
  });

  DAE.unsetFlag(tactor, flagName);

  ui.notifications.notify("Sacred Weapon (Fades): "+ copy_item.name + " returns to normal.");

}
