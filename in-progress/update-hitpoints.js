for (const { actor } of canvas.tokens.placeables) {
  // console.log('actor: ', actor);
  // console.log('is NPC? ', (actor?.type == 'npc'));
  if (actor?.type == 'npc') {
    if (actor?.system.hp.value == actor?.system.hp.max) {
      const hpFormula = actor.system.attributes.hp.formula;
      // console.log('hpFormula: ',hpFormula);
      if (!Roll.validate(hpFormula)) {
        const roll = await new Roll(hpFormula).evaluate({ maximize: true });
        // console.log('roll (total): ',roll.total);
        await actor.update({ "system.attributes.hp": { value: roll.total, max: roll.total } });
      }
    }
  }
}