/*
Blood Hunter Crimson Rite: Ghosthunter's Rite of the Dawn
Contained in ItemMacro
DAE Custom ItemMacro with @target as a param

On cast, the blood hunter damages themselves, reducing their hit points.
The affected weapon then does bonus damage using the hemocrit die and rite type.
The rite of dawn also does and additional die to undead targets. (TBD)
*/
let target = canvas.tokens.get(args[1]); //passed param
let tactor = target.actor; // get the target's actor
console.log(tactor);

// DAE flag
let flagName = 'rite_dawn';
let flag = DAE.getFlag(tactor, flagName);

// Save character max HP
let maxHP = tactor.data.data.attributes.hp.max;
console.log(maxHP);

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
let riteDmgType = "radiant"
let dmgString = "1d" + hemoDie + "[" + riteDmgType + "]" // eg 1d4[radiant]
let riteDamage = [dmgString, riteDmgType]

// Get this actor's Weapons
let weapons = tactor.items.filter(i => i.data.type === `weapon`);
let weapon_content = ``;

for (let weapon of weapons) {
  weapon_content += `<option value=${weapon.id}>${weapon.name}</option>`;
}

if (args[0] === "on") {
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

  // weapon picker
  let content = `
<div class="form-group">
  <label>Weapons : </label>
  <select name="weapons">
    ${weapon_content}
  </select>
</div>`;

  new Dialog({
    title: "Choose a weapon for the Rite of the Dawn",
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
            onUseMacroName: "CrimsonRiteDawn"
          };
          tactor.updateEmbeddedEntity("OwnedItem", copy_item);

          // midi-qol assumes itemCardId as param 3 (arg[3])
          let damageRoll = new Roll(`1d${hemoDie}`).roll();
          new MidiQOL.DamageOnlyWorkflow(tactor, target, damageRoll.total, riteDmgType, [target], damageRoll, {
            flavor: "Crimson Rite Self Inflicted Damage",
            itemCardId: args[2]
          })

          // save the damage taken
          DAE.setFlag(tactor, flagName, {
            rite_damage: damageRoll.total
          })
          let newHP = maxHP - damageRoll.total;
          tactor.update({
            "data.attributes.hp.max": newHP
          });

          // inform the player
          ChatMessage.create({
            content: copy_item.name + " is empowered."
          });
        }
      },
      Cancel: {
        label: `Cancel`
      }
    }
  }).render(true);
}

if (args[0] === "off") {
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

  // Remove OnUse
  let weaponItem = tactor.items.get(flag.id);
  let copy_item = duplicate(weaponItem);

  // Remove OnUse
  copy_item.flags["midi-qol"] = {
    onUseMacroName: ""
  };
  tactor.updateEmbeddedEntity("OwnedItem", copy_item);

  // Restore HP
  let newHP = maxHP + flag.rite_damage;
  tactor.update({
    "data.attributes.hp.max": newHP
  })

  DAE.unsetFlag(tactor, flagName);

  ChatMessage.create({
    content: copy_item.name + " returns to normal."
  });

}
