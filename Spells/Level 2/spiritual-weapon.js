const lastArg = args.at(-1);

// DAE itemMacro with spawned tokenId as argument
if (args[0] == "off") {
  console.log("SPIRITUAL WEAPON DAE OFF");
  console.log("SPIRITUAL WEAPON - lastArg ", lastArg);
  warpgate.dismiss(args[1]); // kill the token
  return;
}

if (args[0] == "on") {
  console.log("SPIRITUAL WEAPON DAE ON");
  console.log("SPIRITUAL WEAPON - lastArg ", lastArg);
}

// itemMacro
if (lastArg.macroPass === "postActiveEffects") {
  console.log("SPIRITUAL WEAPON - lastArg ", lastArg);
  const caster = await fromUuid(lastArg.actorUuid);
  const spellSlot = lastArg.castData.castLevel;
  const attackDamage = 1 + Math.floor((spellSlot - 2) / 2);
  const casterMsakBonus = Number(caster.system.bonuses.msak.attack.split("+").filter(Number).reduce(function (total, num) { return parseFloat(total) + parseFloat(num) }));
  const casterMsakMod = Number(caster.system.abilities[caster.system.attributes.spellcasting].mod) + casterMsakBonus;
  const casterMsakAttack = caster.system.attributes.prof + casterMsakMod
 
  // update the attack scaled to caster and spell level
  const updates = {
    embedded: {
      Item: {
        "Spiritual Weapon Attack": {
          "system": {
            "actionType": "msak",
            "attackBonus": `${casterMsakAttack - 2}`,
            "damage.parts": [[`${attackDamage}d8[force] + ${casterMsakMod}`, "force"]],
            "description.value": `As a bonus action on your turn, you can make a melee spell attack against a creature within 5 feet of the weapon. On a hit, the target takes force damage equal to ${attackDamage}d8 + ${casterMsakMod}.`
          }
        }
      }
    }
  };

  // define options
  const options = { controllingActor: caster };

  // Summon the token
  const spiritualWeaponTokenId = (await warpgate.spawn("Rose", updates, {}, options))[0];
  console.log("#### Warpgate spawned tokenid is ", spiritualWeaponTokenId);

  // Update the DAE flag with the spawned token so it can be dismissed later
  let spiritualWeaponEffect = caster.effects.find(e => e.label === "Spiritual Weapon");
  console.log("#### spiritualWeaponEffect: ", spiritualWeaponEffect);
  spiritualWeaponEffect.update({
    "changes": [{
      "key": "macro.itemMacro",
      "value": `${spiritualWeaponTokenId}`,
      "mode": 0,
      "priority": 10
    }]
  })

};