const version = "10.0.13";
console.log('Args Actor:',args[0].actor);
try {
  const origin = args[0].itemUuid;
  if (origin) {
      const removeList = actor.effects.filter(ae => ae.origin === origin && getProperty(ae, "flags.dae.transfer") !== 3).map(ae=>ae.id);
      await actor.deleteEmbeddedDocuments("ActiveEffect", removeList)
  }

  let actorSpellcastingBonus = Number(args[0].actor.system.abilities[args[0].actor.system.attributes.spellcasting]?.mod);
  let actorProfBonus = Number(args[0].actor.system.attributes.prof);
  let actorMsakBonus = Number(args[0].actor.system.bonuses.msak.attack.split("+").filter(Number).reduce(function(total,num){return parseFloat(total) + parseFloat(num)}));
  let actorAttackBonus = Number(actorSpellcastingBonus+actorProfBonus+actorMsakBonus);
  console.log('actorSpellcastingBonus: ',actorSpellcastingBonus);
  console.log('actorProfBonus: ',actorProfBonus);
  console.log('actorMsakBonus: ',actorMsakBonus);
  console.log('actorAttackBonus: ',actorAttackBonus);

  const updates = {
      Item: {
      "Spiritual Weapon Attack": {
        "type": "weapon",
        "img": args[0].itemData.img, 
        "system.actionType" : "msak",
        "system.properties.mgc": true,
        "sytem.attackBonus": actorAttackBonus,
        //"system.attackBonus": `${Number(args[0].actor.system.abilities[args[0].actor.system.attributes.spellcasting]?.mod) + Number(args[0].actor.system.attributes.prof) + Number(args[0].actor.system.bonuses.msak.attack)}`,
        "system.proficient": false,
        "system.damage.parts":[[`${1 + Math.floor((args[0].spellLevel-2)/2)}d8[force] + ${args[0].actor.system.abilities[args[0].actor.system.attributes.spellcasting]?.mod || ""}`,"force"]]
      }
    }
  }
  const result = await warpgate.spawn("Rose",  {embedded: updates}, {}, {});
  if (result.length !== 1) return;
  const createdToken = game.canvas.tokens.get(result[0]);
  await createdToken.actor.items.getName("Spiritual Weapon Attack").update({"data.proficient": false});
  const targetUuid = createdToken.document.uuid;

  await actor.createEmbeddedDocuments("ActiveEffect", [{
      label: "Summon Rose", 
      icon: args[0].item.img, 
      origin,
      duration: {seconds: 60, rounds:10},
      "flags.dae.stackable": false,
      changes: [{key: "flags.dae.deleteUuid", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: [targetUuid]}]
  }]);
} catch (err) {
    console.error(`${args[0].itemData.name} - Spiritual Weapon ${version}`, err);
}