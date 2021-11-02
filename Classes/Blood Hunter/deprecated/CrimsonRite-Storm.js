/*
Blood Hunter Crimson Rite: Rite of the Storm
Contained in ItemMacro
DAE Custom ItemMacro with @target @itemCardId params

On cast, the blood hunter damages themselves, reducing their hit points.
The affected weapon then does bonus damage using the hemocrit die and rite type.
*/
let target = canvas.tokens.get(args[1]);
const lastArg = args[args.length - 1];
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);

// DAE flag
let flagName = 'rite_storm';

if (args[0] === "on") {
  // Establish damage and type
  let hemoDie;
  let char_level = tactor.data.data.details.level;
  if (char_level > 16) { // Levels 17-20: 1d10
    hemoDie = 10;
  } else if (char_level > 10) { // Levels 11-16: 1d8
    hemoDie = 8;
  } else if (char_level > 4) { // Levels 5-10: 1d6
    hemoDie = 6;
  } else { //Levels 1-4: 1d4
    hemoDie = 4;
  }
  let riteDmgType = "lightning"
  let dmgString = `1d${hemoDie}[${riteDmgType}]` // eg 1d4[radiant]
  let riteDamage = [dmgString, riteDmgType]

  // Get this actor's Weapons
  let weapons = tactor.items.filter(i => i.data.type === `weapon`);
  let weapon_content = ``;
  for (let weapon of weapons) {
    weapon_content += `<option value=${weapon.id}>${weapon.name}</option>`;
  }

  // weapon picker
  let content = `
<div class="form-group">
  <label>Weapons : </label>
  <select name="weapons">
    ${weapon_content}
  </select>
</div>`;

  new Dialog({
    title: "Rite of the Dawn: Choose a weapon",
    content,
    buttons: {
      Ok: {
        label: `Ok`,
        callback: (html) => {
          // select the weapon and make a copy
          let itemId = html.find('[name=weapons]')[0].value;
          let weaponItem = tactor.items.get(itemId);
          let copy_item = duplicate(weaponItem);

          // save off baseline
          DAE.setFlag(tactor, flagName, {
            id: itemId
          });

          // add the OnUse for MidiQOL
          copy_item.flags["midi-qol"] = {
            onUseMacroName: "CrimsonRiteStorm"
          };

          // midi-qol assumes itemCardId as param 3 (arg[3])
          let damageRoll = new Roll(`1d${hemoDie}`).roll();
          game.dice3d?.showForRoll(damageRoll);
          new MidiQOL.DamageOnlyWorkflow(tactor, target, damageRoll.total, riteDmgType, [target], damageRoll, {
            flavor: "Crimson Rite Self Inflicted Damage",
            itemCardId: args[2]
          });

          // save the damage taken
          DAE.setFlag(tactor, flagName, {
            rite_damage: damageRoll.total
          })

          // update max hp
          let newHP = tactor.data.data.attributes.hp.max - damageRoll.total;
          tactor.update({
            "data.attributes.hp.max": newHP
          });

          // update the item
          tactor.updateEmbeddedEntity("OwnedItem", copy_item);

          // inform the player
          ui.notifications.notify("Rite of the Storm (Activates): "+ copy_item.name + " is empowered.");

        }
      },
      Cancel: {
        label: `Cancel`
      }
    }
  }).render(true);
}

if (args[0] === "off") {
  // Remove OnUse
  let flag = DAE.getFlag(tactor, flagName);
  let weaponItem = tactor.items.get(flag.id);
  let copy_item = duplicate(weaponItem);
  copy_item.flags["midi-qol"] = {
    onUseMacroName: ""
  };
  tactor.updateEmbeddedEntity("OwnedItem", copy_item);

  // Restore HP
  let newHP = tactor.data.data.attributes.hp.max + flag.rite_damage;
  tactor.update({
    "data.attributes.hp.max": newHP
  })

  DAE.unsetFlag(tactor, flagName);

  ui.notifications.notify("Rite of the Storm (Fades): "+ copy_item.name + " returns to normal.");

}
