//////////////////////////////////////////////alterable constants///////////////////////////////////////
const potions = [
  "potion of healing",                        // change these names to other versions 
  "potion of healing (greater)",              // of healing potions should you have them
  "potion of healing (superior)",             // NOTE: !!! make sure the name is in all lower case!!!
  "potion of healing (supreme)"
];
////////////////////////////////////////////////////////////////////////////////////////////////////////
// Get Selected
if(!token) return ui.notifications.info("No token selected")
const selectedActor = token.actor;

//find the different heal potions on the selected to determine the healing options available
const healPotions = selectedActor.items.filter(item =>  potions.includes(item.name.toLowerCase()));
if (healPotions.length == 0) return ui.notifications.error("You have no Potions of Healing");

// sort the potions by value.
const sortedHealPotions = healPotions.sort((a, b) => a.system.price.value - b.system.price.value);

let healOptions = sortedHealPotions.reduce((acc,item) => {
  // Log the item for debugging
  // console.log('Processing item: ', item);

  // Extract the activities
  const itemActivities =Array.from(item.system.activities.values());
  // console.log('itemActivities: ', [itemActivities]);

  // Find the activity of healing type
  const healingActivity = itemActivities.find(activity => activity.type='heal');
  // console.log('healingActivity: ', [healingActivity]);

  // debug output
  // console.log(`<option value=${item.id}>${item.name} [${item.system.quantity}] | Heals: ${healingActivity.healing.number}d${healingActivity.healing.denomination}+${healingActivity.healing.bonus}</option>`);

  // Add the current item as an <option>
  return acc + `<option value=${item.id}>${item.name} [${item.system.quantity}] | Heals: ${healingActivity.healing.number}d${healingActivity.healing.denomination}+${healingActivity.healing.bonus}</option>`;
}, "");

const dialogTemplate = `<style>
                          #heal-potion-dialog .window-content {
                              display: flex;
                              flex-direction: row;
                          }
                          #heal-potion-dialog .dialog-content {
                              padding-top: 12px;
                          }
                          #heal-potion-dialog .dialog-buttons {
                              display: inline;
                              padding-left: 15px;
                          }
                          #heal-potion-dialog .dialog-buttons .applyHealing {
                              border-style: none;
                              background-image: url(icons/consumables/potions/potion-tube-corked-red.webp);
                              background-repeat: no-repeat;
                              background-size: 50px 50px;
                              width: 50px;
                              height: 50px;
                          }
                          #heal-potion-dialog .dialog-buttons .close {
                              border-style: none;
                              background-image: url(icons/svg/cancel.svg);
                              background-repeat: no-repeat;
                              background-size: 50px 50px;
                              width: 50px;
                              height: 50px;
                          }
                          #heal-potion-dialog .dialog-buttons button:hover {
                              transform: scale(1.1);
                          }
                          
                   </style>
                   <form><div><select id="heal-potion-select" name="potion">${healOptions}</select></div></form>
                   `;
new Dialog({
  title: "Choose your potion:",
  content: dialogTemplate,
  buttons: {
      applyHealing: {
          callback: async (html) => {
              const potID = new FormDataExtended(html[0].querySelector("form")).object.potion;
              const pot = selectedActor.items.get(potID);
              await pot.use({legacy: false});
          }
      },
      close:{
      }
  },
  render: (html) => {
      const potId = new FormDataExtended(html[0].querySelector("form")).object.potion;
      const item = actor.items.get(potId);
      const itemImg = item.img;
      html[2].querySelector("button.applyHealing").style["background-image"] = `url(${itemImg})`;
      html[0].querySelector("#heal-potion-select").addEventListener("change", function () {
          const item = selectedActor.items.get(this.value);
          const itemImg = item.img;
          html[2].querySelector("button.applyHealing").style["background-image"] = `url(${itemImg})`;
      });
  }
},
{
  id: "heal-potion-dialog",
  width: 450
}).render(true);