this.registerFlowStep("eyes-of-night", true, async (activation) => {
  console.log("### EYES OF NIGHT -this- ", this );
  console.log("### EYES OF NIGHT -activation- ", activation );
  const eyeTargets = activation.targetUuids;
  console.log("### EYES OF NIGHT -eyeTargets- ", eyeTargets );
  eyeTargets.forEach(updateVision);
});

return this.sequence(
    this.defaultFlow(),
    this.performCustomStep("eyes-of-night")      
)

async function updateVision(uuid) {
  console.log("### EYES OF NIGHT -updateVision uuid- ", uuid);
  const thisActor = await fromUuid(`${uuid}`);
  const thisToken = thisActor.getActiveTokens(false, true)[0];
  await thisToken.document.update({"sight.range": 300})
}