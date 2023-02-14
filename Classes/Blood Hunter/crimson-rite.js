/*
MidiQOL OnUse Macro or ItemMacro
Feature of Blood hunter
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

/*
1. Choose a rite
2. Select the weapon to apply it to.
3. Create an effect for the Rite on the Blood hunter
4. Update the weapon in inventory to include updated properties (magic item
   flag, and the Item Macro for the weapon to use for its damage in an attack.)
*/

console.log("DEBUG INFO: ",args);
const lastArg = args[args.length - 1];
// if (lastArg.hitTargets[0].length === 0) return {};
let tokenD = canvas.tokens.get(lastArg.tokenId).actor;
let actorD = game.actors.get(lastArg.actor._id);
const target = canvas.tokens.get(lastArg.hitTargets[0].id);
const bhLvl = actorD.data.type === "npc" ? actorD.data.data.details.cr : actorD.classes["blood-hunter"].data.data.levels;
let hemoDie = (4 + (2 * (Math.floor((bhLvl + 1) / 6))));

const undead = target.actor.data.type === "npc" ? ["undead"].some(value => (target.actor.data.data.details.type.value || "").toLowerCase().includes(value)) : ["undead"].some(race => (target.actor.data.data.details.race || "").toLowerCase().includes(race));


  // Get the available weapons
  let weapons = actorD.items.filter(i => i.data.type === `weapon`);
  if(!weapons) {
//    ui.notifications.warn("my warning");
//    ui.notifications.error("my error");
    ui.notifications.notify("Unable to locate a weapon in inventory. Required for Crimson Rite.");
    return;
  }
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

  // save weaponID and modify that weapon to magic

  // dialog option
  new Dialog({
    title: 'Crimson Rite',
    content: `
    <style>
    .crimson-rite .form-group {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        align-items: flex-start;
      }

      .crimson-rite .radio-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        justify-items: center;
        flex: 1 0 25%;
        line-height: normal;
      }

      .crimson-rite .radio-label input {
        display: none;
      }

      .crimson-rite img {
        border: 0px;
        width: 50px;
        height: 50px;
        flex: 0 0 50px;
        cursor: pointer;
      }

      /* CHECKED STYLES */
      .crimson-rite [type=radio]:checked + img {
        outline: 2px solid #f00;
      }
    </style>

    <h3>Pick your weapon:</h3>

    <form class="crimson-rite">
      <div class="form-group" id="weapons">
       ${weapon_content}
       </div>
    </form>
  `,
    buttons: {
      dawn: {
        icon: '<i class="fas fa-sun"></i>',
        label: 'Dawn',
        callback: () => dawn(target, 'Crimson Rite: Rite of the Dawn')
      },
      storm: {
        icon: '<i class="fas fa-poo-storm"></i>',
        label: 'Storm',
        callback: () => storm(target, 'Crimson Rite: Rite of the Storm')
      },
      close: {
        icon: '<i class="fas fa-check"></i>',
        label: 'Close'
      },
    },
    default: "close",
    close: () => {}
  }).render(true);

// Crimson Rite: Rite of the Dawn
function dawn (target, effectDataLabel){
  let riteDawn = async function() {
  {
    const effectData = {
      changes: [
        {key: "ATL.preset", mode: 0, value: "RiteOfTheDawn", priority: "20" },
        {key: "flags.midi-qol.DR.necrotic", mode: 0, value: "1", priority: "18" }
      ],
      disabled: false,
      duration: { startTime: game.time.worldTime },
      icon: "icons/magic/light/explosion-beam-impact-silhouette.webp",
      label: effectDataLabel,
      origin: args[0].uuid,
      transfer: false,
      flags: {
        dae: { specialDuration: [], transfer: false },
        "dnd5e-helpers": { "rest-effect": "Short Rest" }
      }
    }
    await target.actor.createEmbeddedEntity("ActiveEffect", effectData);
    }
  };
  riteDawn();
}

// Crimson Rite: Rite of the Storm
function storm (target, effectDataLabel){
  let riteStorm = async function() {
  {
    const effectData = {
/*
      changes: [
        {key: "ATL.preset", mode: 0, value: "RiteOfTheDawn", priority: "20" },
        {key: "flags.midi-qol.DR.necrotic", mode: 0, value: "1", priority: "18" }
      ],
*/
      disabled: false,
      duration: { startTime: game.time.worldTime },
      icon: "icons/magic/lightning/bolt-strike-cloud-gray.webp",
      label: effectDataLabel,
      origin: args[0].uuid,
      transfer: false,
      flags: {
        dae: { specialDuration: [], transfer: false },
        "dnd5e-helpers": { "rest-effect": "Short Rest" }
      }
    }
    await target.actor.createEmbeddedEntity("ActiveEffect", effectData);
    }
  };
  riteStorm();
}
