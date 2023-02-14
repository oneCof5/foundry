// World Script Module Required to run this.
Hooks.on("midi-qol.preambleComplete", function (workflow) {
    let bloodFrenzy = workflow.actor.items.find(i=> i.name.toLowerCase() === "blood frenzy");
    if(!bloodFrenzy) return {};
    let getId = workflow.targets.values().next().value.id;
    let attackTarget = canvas.tokens.get(getId);
    if(attackTarget.actor.data.data.attributes.hp.value >= attackTarget.actor.data.data.attributes.hp.max) return {};
    workflow.advantage = true;
});