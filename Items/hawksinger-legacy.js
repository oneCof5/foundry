const lastArg = args[args.length - 1];
console.log("Hawksinger Legacy - lastArg:", lastArg);
let tokenD = canvas.tokens.get(lastArg.tokenId);
console.log("Hawksinger Legacy - tokenD:", tokenD);
const actorD = tokenD.actor;
console.log("Hawksinger Legacy - actorD:", actorD);

// DAE: While equipped, create Harsh Critique
if (args[0] === "on") {
    const jsonData = JSON.parse(`{"name": "Harsh Critique","type": "feat","img": "icons/skills/toxins/cup-goblet-poisoned-spilled.webp","data": {"description": {"value": "<section class="secret"><p>Hawksinger's Legacy unleashes a string of insults laced with subtle enchantments at a creature within it's perception. If the target can hear (though it need not understand), it must succeed on a Wisdom saving throw (DC 16) or take 2d4 psychic damage and have disadvantage on the next attack roll it makes before the end of its next turn.</p></section>"},"source": "Homebrew","activation": {"type": "special"},"duration": {"units": "inst"},"target": {"type": "creature"},"actionType": "save","damage": {"parts": [["2d4[psychic]", "psychic"]]},"save": {"ability": "wis","dc": 16,"scaling": "flat"}},"effects": [{"changes": [{"key": "flags.midi-qol.disadvantage.attack.all","mode": 2,"value": "1","priority": "20"}],"disabled": false,"duration": {"startTime": null},"icon": "icons/skills/toxins/cup-goblet-poisoned-spilled.webp","label": "Harsh Critique","transfer": false,"flags": {"dae": {"stackable": "none","durationExpression": "","macroRepeat": "none","specialDuration": ["1Attack", "turnEnd"],"transfer": false}},"selectedKey": "flags.midi-qol.disadvantage.attack.all"}]}`);
    await actorD.createEmbeddedDocuments("Item", [jsonData]);
    let itemId = actorD.data.items.getName("Harsh Critique").id;
    await DAE.setFlag(actorD, "daeHawksinger", {"itemId": itemId});
}

// DAE: When not equipped, remove the Harsh Critique feature if it exists
if (args[0] === "off") {
    console.log("OFF");
    let flag = DAE.getFlag(actorD, "daeHawksinger")
    await actorD.deleteEmbeddedDocuments("Item", [flag.itemId]);
}

// MidiQOL OnUse - checks for crit hits/fails and calls Harsh Critique if needed.
if (lastArg.tag === "OnUse") {

    let targetD = lastArg.hitTargets.length > 0 ? canvas.tokens.get(lastArg.hitTargets[0].id) : tokenD;
    console.log("Hawksinger Legacy - targetD:", targetD);
    let critHit = false;
    if (lastArg.isCritical) {
        critHit = lastArg.isCritical;
    }
    console.log("Hawksinger Legacy - critHit:", critHit);
    let critFail = lastArg.isFumble;
    console.log("Hawksinger Legacy - critFail:", critFail);

    if (critHit || critFail) {
        let uuids = [];
        let mockery = "Rubbish! Pure rubbish! I've taken shits that fought better than that!";

        // CRIT
        if (critHit) {
            uuids.push(targetD.document.uuid);
        }
        // FUMBLE  (no hitTargets)
        if (critFail) {
            uuids.push(tokenD.document.uuid);
        }

        let tableName = "Mockeries";
        let table = game.tables.getName(tableName);
        console.log("Hawksinger Legacy - table:", table);
        if (table) {
            let roll = await table.roll();
            mockery = roll.results[0].data.text;
        }

        let content = `<p>Hawksinger's Legacy gleefully exclaims:<br/><em>${mockery}</em></p>`;
        ChatMessage.create({content});

        const options = {
            showFullCard: false,
            createWorkflow: true,
            versatile: false,
            configureDialog: false,
            targetUuids: uuids
        };
        const ownedItem = actorD.items.getName("Harsh Critique");
        await MidiQOL.completeItemRoll(ownedItem, options);
    }
}
