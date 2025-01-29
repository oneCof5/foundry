(async () => {
    const selectedTokens = canvas.tokens.controlled;
    if (selectedTokens.length === 0) {
        ui.notifications.error("No token(s) selected.");
        return;
    }
    for (const selectedToken of selectedTokens) {
        const tActor = selectedToken.actor;
        const steRoll = await tActor.rollSkill({ skill: "ste" });
        if (steRoll[0].total >= 15) { 
            const effect = [{
                "disabled": false,
                "duration": {"seconds": 86400},
                "name": "Hiding",
                "img": "icons/magic/perception/silhouette-stealth-shadow.webp",
                "type": "base",
                "origin": `${selectedToken.document.uuid}`,
                "transfer": false,
                "statuses": ["invisible"],
                "description": `<p>You are hiding and have the &amp;Reference[invisible] condition. Enemies trying to find you must pass a DC <strong>${steRoll[0].total}</strong> Wisdom (Perception) check.</p>`
            }];
            await tActor.createEmbeddedDocuments("ActiveEffect", effect);
        }    
    }
})();
