//DAE Macro Execute, Effect Value = "Macro Name" @target @item.level // @target @spellLevel
// this macro creates an attack in the PCs inventory.
const lastArg = args[args.length - 1];
let item = lastArg.efData.flags.dae.itemData;
let actorD;
if (lastArg.tokenId) actorD = canvas.tokens.get(lastArg.tokenId).actor;
else actorD = game.actors.get(lastArg.actorId);
let tokenD = canvas.tokens.get(lastArg.tokenId).actor;
const target = canvas.tokens.get(args[0]);

if (args[0] === "on") {
  // Create Spiritual Weapon item in inventory
  const numDice = Math.floor((parseInt(args[2]) / 2));
  const image = item.img;
  const spellAbility = actorD.data.data.attributes.spellcasting;

  // create inventory item
  const data = {
    name: `${item.name} (Summoned)`,
    type: "equipment",
    img: `${image}`,
    data: {
      equipped: true,
      identified: true,
      activation: { type: "bonus",},
      target: {
        value: 1,
        width: null,
        type: "creature"
      },
      range: {
        value: 5,
        units: "ft"
      },
      ability: `${spellAbility}`,
      actionType: "msak",
      attackBonus: "0",
      chatFlavor: "",
      critical: null,
      damage: { parts: [ [ `${numDice}d8+@mod[force]`, `force` ] ], },
      armor: { value: null, type: "trinket", dex: null },
      proficient: true
    },
    flags: { DAESRD: { SpiritualWeapon: `${actorD.id}` }, }
  };
  console.log("DATA",data);
  await actorD.createOwnedItem( data );
  ui.notifications.notify("Spiritual Weapon created in your inventory as a trinket");

}

if (args[0] === "off") {
  // Delete Spitirual Weapon
  let item = actorD.items.find(i => i.data.flags?.DAESRD?.SpiritualWeapon === actorD.id);
  await actorD.deleteOwnedItem(item.id);
  ui.notifications.notify("Spiritual Weapon removed from your inventory");

}
