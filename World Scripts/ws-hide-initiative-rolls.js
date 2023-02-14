Hooks.on("preCreateChatMessage", (msg, roll, context) => {
    if(!game.user.isGM) return;
    if(msg.getFlag("core", "initiativeRoll")){
        context.temporary = true;
        if(game.actors.get(roll.speaker?.actor)?.hasPlayerOwner) game.dice3d?.showForRoll(msg.roll);
    }
});