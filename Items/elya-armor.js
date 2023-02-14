/* 
This set of +1 half plate mail gleams with polish.
While wearing it, the bearer gains the ability to cast  Shocking Bolt as an action.
Shocking Bolt. Ranged Spell Attack: +4 to hit (with advantage on the attack roll if the target is wearing armor made of metal), range 60 ft., one target. Hit: 10 (3d6) lightning damage.

SECRET: If worn, Elya’s suit of armor gives a PC who wears it the same benefits to Armor Class as does an ordinary suit of plate armor. However, it is in truth Strahd’s Animated Armor. If examined with Detect Magic when first found, it reveals an expected aura of Evocation magic. However, after 24 hours of discovery, it instead reveals an aura of Conjuration magic as Strahd’s Nystul’s Magic Aura spell expires. However, Strahd believes that the PCs will be too greedy to be suspicious. He has planted it here as a cruel joke and a means of testing the PCs’ trust in his alter ego.
Any PC that wears the armor and is proficient with it gains the ability to wield the Animated Armor’s Shocking Bolt attack (though without the Armor’s Multiattack feature). At any later point, Strahd or one of his servants can speak the command word: “Mordent.” Upon hearing this command word, the Animated Armor immediately moves to restrict and control its wearer’s movement. At the beginning of each of its wearer’s turns, the Armor and its wearer must make a contested Strength (Athletics) check. If the wearer wins, they can move at half speed and make attacks with disadvantage. If the Armor wins, it can force its wearer to move at half speed, and can force its wearer to make attacks (also with disadvantage). The Armor’s helmet also rotates 180 degrees to blind its wearer.
Three successful Strength (Athletics) checks are required to remove the Armor from its wearer completely - one each for the helmet, chestplate, and legs. If the helmet is removed, the wearer’s sight is restored. If the chestplate is removed, the wearer can no longer be prevented from making attacks, or forced to make attacks against its own volition. If the legs are removed, the wearer can no longer be prevented from moving or forced to move.
*/

// while DAE effect is active, grant the at-will spell 'shocking bolt'.

// DAE ItemMacro
const lastArg = args[args.length - 1];
const tokenD = canvas.tokens.get(lastArg.tokenId);
const tactor = tokenD.actor;
console.log(args);
const shockbolt = [{
    "name": "Shocking Bolt (Elya's Armor)",
    "type": "spell",
    "img": "icons/magic/lightning/bolt-forked-blue.webp",
    "data": {
      "description": { "value": "<p>Lightning springs from your armor, delivering a shock to a creature you try to touch. Make a melee spell attack against the target. You have advantage on the attack roll if the target is wearing armor made of metal. On a hit, the target takes 3d6 lightning damage.</p>"},
      "source": "Homebrew",
      "activation": {"type": "action","cost": 1},
      "duration": {"value": null,"units": "inst"},
      "target": {"value": 1,"type": "creature"},
      "range": {"value": 60,"long": "null","units": "ft"
      },
      "actionType": "msak",
      "attackBonus": "4",
      "damage": {"parts": [["3d6 [lightning]","lightning"]]},
      "level": 0,
      "school": "evo",
      "components": {
        "vocal": true,
        "somatic": false,
        "material": false,
        "ritual": false,
        "concentration": false
      },
      "preparation": {"mode": "innate","prepared": true},
    }
  }];

if (args[0] === "on") {
    await tactor.createEmbeddedDocuments("Item", shockbolt);
    let createdItem = tactor.items.find(i => i.name === "Shocking Bolt (Elya's Armor)")[0];
    await DAE.setFlag(actor, "daeElyaShock", {"createdItem": [createdItem]});
}

if (args[0] === "off") {
    let flag = DAE.getFlag(actor, "daeElyaShock")
    await tactor.deleteEmbeddedDocuments("Item", flag.createdItem);
}