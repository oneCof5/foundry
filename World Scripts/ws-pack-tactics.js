// World Script Module Required to run this.
Hooks.on("midi-qol.preambleComplete", function (workflow) {
    let packTactics = workflow.actor.items.find(i=> i.name.toLowerCase() === "pack tactics");
    if(!packTactics) return {};
    let getId = workflow.targets.values().next().value.id;
    let attackTarget = canvas.tokens.get(getId);
    let findFriend = MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.HOSTILE, attackTarget, 5, null).filter(i => i.id != workflow.tokenId).length > 0;
    if(!findFriend) return {};
    workflow.advantage = true;    
});