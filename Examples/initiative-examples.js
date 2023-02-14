if (canvas.tokens.controlled.length === 0) return ui.notifications.error("Choose tokens to roll for");
const tokens = canvas.tokens.controlled;

if (tokens.length > 0) {
    rollGroupInitiative();
} else {
    ui.notifications.warn("No Tokens were selected");
}

async function rollGroupInitiative() {
    const combatants = await canvas.tokens.toggleCombat();
    const groups = combatants.reduce((grps, { _id, actorId, actor }) => {
        if (!grps[actorId]) {
            grps[actorId] = [];
        }
        grps[actorId].push(_id);
        return grps;
    }, {});

    const ids = Object.keys(groups).map(key => groups[key][0]);
    const initiatives = await game.combat.rollInitiative(ids);
    const groupedInititive = initiatives.turns.reduce((initiativeGroups, { actorId, initiative }) => {
        if (!initiativeGroups[actorId])
            initiativeGroups[actorId] = [];
        if (initiative != undefined)
            initiativeGroups[actorId].push(initiative);
        return initiativeGroups;
    }, {});

    for (const [actorId, combatantIds] of Object.entries(groups)) {
        let relevantInitiative = groupedInititive[actorId];
        for (const combatantId of combatantIds) {
            await game.combat.setInitiative(combatantId, relevantInitiative);
        }
    }
}

// Confirm token settings are as preferred
game.macros.getName('preferred-token-settings').execute();

// 
(async () => {
    if (canvas.tokens.controlled.length === 0) return ui.notifications.error("Choose tokens to roll for");
    await canvas.tokens.toggleCombat();
    let chosenTokens = canvas.tokens.controlled;
    let tieBreakerCheck = game.settings.get("dnd5e", "initiativeDexTiebreaker") ? 1 : 0; //Checks if Dex tiebreaker is being used
    let initiatives = chosenTokens.map(t => {
        let chosenActor = t.actor;
        
        let init = chosenActor.data.data.attributes.init.total;
        let tieBreaker = chosenActor.data.data.abilities.dex.value/100;
        let roll = new Roll(`${1}d20 + ${init} + ${tieBreaker * tieBreakerCheck}`).roll({async: false});
        roll.toMessage({speaker: ChatMessage.getSpeaker({token: t.document})});
        let combatantId = t.combatant.id;
        return{
            _id: combatantId,
            initiative: roll.total,
        };
    });
    await game.combat.updateEmbeddedDocuments("Combatant", initiatives);
})();