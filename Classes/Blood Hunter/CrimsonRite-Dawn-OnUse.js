/* Inspired by crymic divine smite */
// Downloaded from https://www.patreon.com/crymic
// more macros at https://gitlab.com/crymic/foundry-vtt-macros/
(async () => {
  let target = canvas.tokens.get(args[0].hitTargets[0]._id);
  let actorD = game.actors.get(args[0].actor._id);
  let itemD = args[0].item;

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

  let msgHistory = await game.messages.entities.map(i => ({
    _id: i.data._id,
    user: i.data.user,
    flavor: i.data.flavor,
    actorId: i.data.flags["midi-qol"]?.actor,
    itemId: i.data.flags["midi-qol"]?.itemId
  })).filter(i => i.actorId === actorD._id && i.flavor != itemD.name);
  if (msgHistory.length === 0) return ui.notifications.warn(`You need to successfully attack first.`);
  let lastAttack = msgHistory[msgHistory.length];
  let attackHistory = MidiQOL.Workflow.getWorkflow(lastAttack.itemId);

  let numDice = 1;
  let undead = ["undead", "fiend"].some(type => (target.actor.data.data.details.type || "").toLowerCase().includes(type));
  if (undead) numDice += 1;
  let damageRoll = attackHistory.isCritical ? new Roll(`${numDice *2}d${hemoDie}`).roll() : new Roll(`${numDice}d${hemoDie}`).roll();
  game.dice3d?.showForRoll(damageRoll);
  new MidiQOL.DamageOnlyWorkflow(actorD, target, damageRoll.total, riteDmgType, [target], damageRoll, {
    flavor: "(Crimson Rite: Rite of the Dawn)",
    itemCardId: args[0].itemCardId
  });
})();
