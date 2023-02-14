// World Script Module Required to run this.
Hooks.on("midi-qol.preDamageRoll", async function (workflow) {
    // Confirm the source actor has the assassinate feature
    let assassinate = workflow.actor.itemTypes.feat.find(i=> i.name.toLowerCase() === "assassinate");
    if (!assassinate) return {};
    // Check whether the target is Surprised (custom CE)
    let target = canvas.tokens.get(workflow.targets[0].id).actor;
    let surprised = target.effects.find(e => e.data.label.toLowerCase() === 'surprised');
    if (!surprised) return {};
    workflow.isCritical = true;
  });