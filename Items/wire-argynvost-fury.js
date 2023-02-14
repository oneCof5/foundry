this.registerFlowStep("argys-fury", true, async (activation) => {
  // console.log("### ARGYNVOST'S FURY  - activation - ", activation);
  let theTs = game.user?.targets.filter(function (token) {
    let undead = ['undead', 'fiend', 'reborn'].some(i => (token.actor.type === 'character' ? token.actor.system.details.race : token.actor.system.details.type.value).toLowerCase().includes(i));
    if (undead) return token;
  });
  console.log("### ARGYNVOST'S FURY  - theTs - ", theTs);
  const newTs = theTs.map((token) => token.document.id);
  console.log("### ARGYNVOST'S FURY  - newTs - ", newTs);
  game.user?.updateTokenTargets(newTs);
  game.user?.broadcastActivity({ newTs });

});

return this.sequence(
  this.performCustomStep("argys-fury"),  // validate that only undead are targeted
  this.applySelectedTargets( // confirmTargets
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