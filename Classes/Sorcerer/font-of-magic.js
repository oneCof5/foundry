const selectedToken = canvas.tokens.controlled[0];
if (!selectedToken)  {
    ui.notifications.warn(`Please select a token.`);
    return;
}
const tActor = selectedToken.actor;
console.log(`tActor=${tActor}`);
if (tActor.type !== "character") {
    ui.notifications.warn(`Please select a player character.`);
    return;
}
const fontOfMagic = actor.items?.find(f => f.name === "Font of Magic");
console.log(`fontOfMagic=${fontOfMagic}`);
if (!fontOfMagic) {
    ui.notifications.warn(`The selected player character does not seem to have Sorcery Points.`);
    return;
};
const SP = Math.max((fontOfMagic?.system.uses.value ?? 0));
console.log(`SP=${SP}`);
const SPmax = Math.max((fontOfMagic?.system.uses.max ?? 0));
console.log(`SPmax=${SPmax}`);

const conversionMap = {1: 2, 2: 3, 3: 5, 4: 6, 5: 7};
console.log(`conversionMap=${conversionMap}`);
const spellPoints = SP; // item.system.uses;
console.log(`spellPoints=${spellPoints}`);
const spellSlots = {...tActor.system.spells};
console.log(`spellSlots=${spellSlots}`);

// array of spell levels for converting points to slots.
const validLevelsWithSpentSpellSlots = Object.entries(spellSlots).filter(([key, entry]) => {
  const k = key === "pact" ? entry.level : key.at(-1);
  const cost = conversionMap[k];
  if (!cost || (cost > spellPoints.value)) return false;
  return (entry.max > 0 && entry.value < entry.max);
});
console.log(`validLevelsWithSpentSpellSlots=${validLevelsWithSpentSpellSlots}`);

// array of spell levels for converting slots to points.
const spellLevelsWithAvailableSlots = Object.entries(spellSlots).filter(([key, entry]) => {
  return (entry.value > 0) && (entry.max > 0);
});
console.log(spellLevelsWithAvailableSlots);

const isMissingPoints = spellPoints.value < spellPoints.max;
console.log(`isMissingPoints=${isMissingPoints}`);
const isMissingSlots = validLevelsWithSpentSpellSlots.length > 0;
console.log(`isMissingSlots=${isMissingSlots}`);
// has unspent spell slots.
const hasAvailableSpellSlots = spellLevelsWithAvailableSlots.length > 0;
console.log(`hasAvailableSpellSlots=${hasAvailableSpellSlots}`);
// has sp equal to or higher than the minimum required.
const hasAvailableSorceryPoints = spellPoints.value >= Math.min(...Object.values(conversionMap));
console.log(`hasAvailableSorceryPoints=${hasAvailableSorceryPoints}`);

const canConvertSlotToPoints = hasAvailableSpellSlots && isMissingPoints;
console.log(`canConvertSlotToPoints=${canConvertSlotToPoints}`);
const canConvertPointsToSlot = hasAvailableSorceryPoints && isMissingSlots;
console.log(`canConvertPointsToSlot=${canConvertPointsToSlot}`);

// Dialog example

/* new Dialog({
    title:'Example Dialog',
    content:`
        <form>
        <div class="form-group">
            <label>Input text</label>
            <input type='text' name='inputField'></input>
        </div>
        </form>`,
    buttons:{
        yes: {
        icon: "<i class='fas fa-check'></i>",
        label: `Apply Changes`,
        }},
    default:'yes',
    close: html => {
            let result = html.find('input[name=\'inputField\']');
            if (result.val()!== '') {
                console.log("Ended diag");
                let tactor = game.actors.getName(result.val());
                doStuff(tactor)
            }
    }
}).render(true);

function doStuff(tactor) {
    console.log("Went Beyond diag");
    if(tactor != null) {
        console.log(tactor);
    }
} */

// another example

/* 
const {NumberField} = foundry.data.fields;
const {DialogV2} = foundry.applications.api;

const choices = [48,36,24].reduce((acc,e)=>{
  acc[e] = `${e} km per day`;
  return acc;
},{})

const distanceField = new NumberField({
  label: "Distance",
  hint: "Distance in kilometers."
}).toFormGroup({},{name: "distance", value: 0}).outerHTML;
const paceField = HandlebarsHelpers.radioBoxes("pace", choices,{hash:{}});

const content = distanceField + `<div class="form-group">${paceField}</div>`;

const data = await DialogV2.prompt({
  window: {title:"Travel time"},
  content,
  ok: {
    callback: (event,button)=> new FormDataExtended(button.form).object
  }
});
// used 24 hours for the day, might be 8 or 10 or so depending how much can be walked in a day in your system. of course you can always break it down in days/hours/minutes too if you are so inclined :D
const time = data.distance > data.pace ? `${(data.distance / data.pace).toFixed(2)} days` : `${(24 * data.distance / data.pace).toFixed(2)} hours`;
const msg = `Estimated travel time is ${time} at ${choices[data.pace]}`;
await ChatMessage.create({content: msg});

// yet another option
if(!token) return;

const torchAnimation = {"type": "torch", "speed": 2, "intensity": 2, "reverse": false};
const blankAnimation = {"type": "", "speed": 5, "intensity": 5, "reverse": false};
const options = {
  'Torch': {"dim": 40, "bright": 20, "angle": 360, "alpha": 0.05, "animation": torchAnimation, "color": '#c26824'},
  'Hooden Lantern (Open)': {"dim": 60, "bright": 30, "angle": 360, "alpha": 0.05, "animation": torchAnimation, "color": '#c26824'},
  'Hooded Lantern (Closed)': {"dim": 5, "bright": 0, "angle": 360, "alpha": 0.05, "animation": torchAnimation, "color": '#c26824'},
  'Bullseye Lantern': {"dim": 120, "bright": 60, "angle": 60, "alpha": 0.05, "animation": torchAnimation, "color": '#c26824'},
  'Light': {"dim": 40, "bright": 20, "angle": 360, "alpha": 0.05, "animation": blankAnimation, "color": '#dbdbdb'},
  'Daylight': {"dim": 120, "bright": 60, "angle": 360, "alpha": 0.05, "animation": blankAnimation, "color": '#dbdbdb'},
  'Candle': {"dim": 10, "bright": 5, "angle": 360, "alpha": 0.05, "animation": torchAnimation, "color": '#c26824'},
  'Dusk Lantern': {"dim": 120, "bright": 60, "angle": 60, "alpha": 0.05, "animation": torchAnimation, "color": '#cf2a35'},
  'Clear': {"dim": 0, "bright": 0, "angle": 360, "alpha": 0.5, 'color': "", "animation": blankAnimation} 
}
const buttons = Object.keys(options).reduce((acc,e)=>{
  acc[e.slugify()] = {label: e, callback: ()=>{return e}};
  return acc;
},{});
const choice  = await Dialog.wait({
  title: "Light options",
  buttons
});

await token.document.update({light:options[choice]});
 */


// SORC POINTS
/*
const sorceryPoints = actor.items.getName("Font of Magic");

let sorceryPointsToRestore = 4;

const dialog = new Dialog({
  title: "Sorcerous Restoration",
  content: `
    <p>Have you completed a short rest and wish to recover 4 Sorcery Points?</p>
  `,
  buttons: {
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: "Yes",
      callback: async () => {

// Restore the Sorcery Points to the Font of Magic feature
await sorceryPoints.update({ [`system.uses.value`]: sorceryPoints.system.uses.value + sorceryPointsToRestore });

        ChatMessage.create({
          speaker: ChatMessage.getSpeaker({actor: game.user.character}),
          content: `<div class="dnd5e chat-card">
 <header class="card-header flexrow">
  <img src="https://assets.forge-vtt.com/bazaar/core/icons/magic/water/orb-water-ice-pink.webp" title="${item.name}" width="36" height="36" />
  <h3 class="item-name">Sorcerous Restoration</h3>
 </header></div>
 <p>You have used your Sorcerous Restoration feature on a short rest and restored <b>4 Sorcery Points</b>.</p>
 </div>`,
        });

      }
    },
    no: {
      icon: "<i class='fas fa-times'></i>",
      label: "No",
      callback: () => {

      }
    }
  }
});

dialog.render(true);
*/