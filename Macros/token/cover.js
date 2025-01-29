(async () => {
    const selectedTokens = canvas.tokens.controlled;
    if (selectedTokens.length === 0) {
        ui.notifications.error("No token(s) selected.");
        return;
    }

    const options = CONFIG.statusEffects.filter(e => e.id.match(/cover/i));
    const buttons = options.reduce((acc, option) => {
        const { id, name: label } = option;
        acc[id] = { label, callback: () => { return option }};
        return acc;
    }, {});

    const choice = await Dialog.wait({
        title: "Choose a Cover type",
        buttons
    });
    const coverEffect = options.find(e => e.id === choice.id);
    const effect = [{
        "disabled": false,
        "duration": {"seconds": 86400},
        "name": `${coverEffect.name}`,
        "img": `${coverEffect.img}`,
        "changes": [
            {
                "key": "system.attributes.ac.bonus",
                "mode": `${CONST.ACTIVE_EFFECT_MODES.ADD}`,
                "value": coverEffect.coverBonus,
                "priority": null
            },
            {
                "key": "system.abilities.dex.bonuses.save",
                "mode": `${CONST.ACTIVE_EFFECT_MODES.ADD}`,
                "value": coverEffect.coverBonus,
                "priority": null
            }
        ],
        "description": `<p>You have &amp;Reference[${coverEffect.name.toLowerCase()}]</p>`,
    }];

    for (const selectedToken of selectedTokens) {
        await selectedToken.actor.createEmbeddedDocuments("ActiveEffect", effect);
    }
})();