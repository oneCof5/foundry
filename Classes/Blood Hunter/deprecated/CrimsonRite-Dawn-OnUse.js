/* Inspired by crymic divine smite */
// Downloaded from https://www.patreon.com/crymic
// more macros at https://gitlab.com/crymic/foundry-vtt-macros/
(async () => {
  let target = canvas.tokens.get(args[0].hitTargets[0]._id);
  let actorD = game.actors.get(args[0].actor._id);
  let itemD = args[0].item;
  let isCrit = args[0].isCritical;

  // Establish damage and type
  let hemoDie;
  let char_level = actorD.data.data.details.level;
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

  let numDice = 1;
  let undead = ["undead", "fiend"].some(type => (target.actor.data.data.details.type || "").toLowerCase().includes(type));
  if (undead) numDice += 1;
  if (isCrit) { numDice = numDice * 2}
  let damageRoll = new Roll(`${numDice}d${hemoDie}[${riteDmgType}]`).roll();
  //  game.dice3d?.showForRoll(damageRoll);
/*
  new MidiQOL.DamageOnlyWorkflow(actorD, target, damageRoll.total, riteDmgType, [target], damageRoll, {
    flavor: "(Crimson Rite: Rite of the Dawn)",
    itemCardId: args[0].itemCardId
  });
*/
  new MidiQOL.DamageOnlyWorkflow(actorD, target, damageRoll.total, riteDmgType, [target], damageRoll, {flavor: "Crimson Rite: Rite of the Dawn", });
})();
