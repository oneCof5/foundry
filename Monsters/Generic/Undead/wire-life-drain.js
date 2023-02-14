this.registerFlowStep("lifeDrain", true, async (activation) => {
  console.log("LIFE DRAIN - activation:", activation);
});

return this.applySelectedTargets(
  this.performAttackRoll(
      this.performAttackDamageRoll(
          this.applyDamage(
              this.applyEffects(
                this.performCustomStep("lifeDrain"),
                this.attackCompleted()
              )
          )
      )
  )
);