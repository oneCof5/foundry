const tokens = canvas.tokens.controlled;
for (let token of tokens) {
//  const roll = await token.actor.rollNPCHitPoints({maximize: true, chatMessage: false});
  const tActor = token.actor;
  if (tActor.type !== "npc") continue;
  const hpFormula = tActor.system.attributes.hp.formula;
  if (!Roll.validate(hpFormula)) continue;
  const roll = await new Roll(hpFormula).evaluate({maximize: true});
//  console.log('roll:', roll.total);
  await tActor.update({"system.attributes.hp": {value: roll.total, max: roll.total}});
}