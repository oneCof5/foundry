this.registerFlowStep("arms-of-hadar", true, async (activation) => {
  // console.log("### Arms of Hadar ### - activation: ", activation);
  const caster = game.actors.get(this.item.parent._id);
  const casterActorId = caster.id;
  // console.log("### Arms of Hadar ### - casterActorId: ", casterActorId);
  // console.log("### Arms of Hadar ### - current targets: ", game.user?.targets);
  let theTs = game.user?.targets.filter(function (token) {
    console.log("### Arms of Hadar ### - token: ", token);
    if (token.actor.id !== casterActorId) return token;
  });
  // console.log("### Arms of Hadar ### - theTs: ", theTs);
  const newTs = theTs.map((token) => token.document.id);
  // console.log("### Arms of Hadar ### - newTs - ", newTs);
  game.user?.updateTokenTargets(newTs);
  game.user?.broadcastActivity({ newTs });
})

return this.sequence(
  this.performCustomStep("arms-of-hadar"),
  this.applySelectedTargets(
    this.performSavingThrow(
      this.performSaveDamageRoll(
        this.applyDamage(
          this.applyEffects(
            this.attackCompleted()
          )
        )
      )
    )
  )
)