/* Mirror Image | by Element_Re
* Configure the Mirror Image spell to have 3 active effects.
* Temporarily untargets the target if the roll indicates the attack targets a mirror image, and checks the attack roll to see if it hits the double's AC (10 + original's dex mod). If it hits this AC, it removes one of the Mirror Image stacks. At the end of the workflow it retargets the targets that were removed to interrupt processing.
*/
Hooks.on("midi-qol.preCheckHits", async (workflow) => {
  if (!workflow.attackRoll) return;
  const mirrorImageTargetedIds = [];

  for (let token of workflow.targets) {
    token = token.document ?? token;
    const actor = token.actor.document ?? token.actor;
    const mirrorImages = [...actor.effects.values()].filter(effect => {
      return effect.data.label.toUpperCase() === "MIRROR IMAGE"
    })
    if (mirrorImages.length < 1) continue;
    let imageTargetCheck;
    switch (mirrorImages.length) {
      case (1): {
        imageTargetCheck = 11;
        break;
      }
      case (2): {
        imageTargetCheck = 8;
        break;
      }
      default: {
        imageTargetCheck = 6;
        break;
      }
    }
    const mirrorImageRoll = await Roll.create('1d20').evaluate();
    const messageData = {
      flavor: `Mirror Image Check (DC ${imageTargetCheck})`,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      roll: mirrorImageRoll,
      content: await mirrorImageRoll.render(),
      // Uncomment this to make the generated message always public
      // Otherwise, it will use roll mode of the user who rolls the attack
      //rollMode: CONST.DICE_ROLL_MODES.PUBLIC
    };

    if (mirrorImageRoll.total >= imageTargetCheck) {
      mirrorImageTargetedIds.push(token.id);
      messageData.content += `<p>${workflow.token.name} attacks one of ${token.name}'s mirror images!</p>`;
      if (workflow.attackRoll.total >= (10 + actor.data.data.abilities.dex.mod)) {
        messageData.content += '<p>The mirror image is hit and destroyed!</p>';
        actor.deleteEmbeddedDocuments('ActiveEffect', [mirrorImages[0].id]);
      } else {
        messageData.content += '<p>The attack misses!</p>';
      }
    } else {
      messageData.content += `<p>${workflow.token.name} attacks ${token.name} directly!</p>`;
    }
    const message = await ChatMessage.create(messageData, {});
  }

  if (mirrorImageTargetedIds.length) {
    const originalTargetIds = [...game.user.targets].map(target => target.id);
    const filteredIds = originalTargetIds.filter((targetId) => !mirrorImageTargetedIds.includes(targetId));
    game.user.setFlag('midi-qol', 'mirrorImageWorkflowTargetedIds', mirrorImageTargetedIds);
    // Unset targets so they are ignored by the rest of the workflow
    game.user.updateTokenTargets(filteredIds);
  }

});

Hooks.on("midi-qol.RollComplete", () => {
  const mirrorImageTargetedIds = game.user.getFlag('midi-qol', 'mirrorImageWorkflowTargetedIds');
  // Restore targets that were removed earlier to skip the rest of the workflow.
  if (mirrorImageTargetedIds) {
    const restoredTargetIds = [...[...game.user.targets].map(target => target.id), ...mirrorImageTargetedIds];
    console.log(restoredTargetIds);
    game.user.updateTokenTargets(restoredTargetIds);
  }
  game.user.unsetFlag('midi-qol', 'mirrorImageWorkflowTargetedIds');
});