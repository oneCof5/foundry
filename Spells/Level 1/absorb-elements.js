Hooks.once('midi-qol.preDamageRollComplete', async function (workflow) {
    const itemname = "Absorb Elements"
    let damage = workflow.damageDetail;
    if (!damage) return {};
    console.log(args[0]);
    let tactor;
    if (args[0].tokenUuid) {
        tactor = (await fromUuid(args[0].tokenUuid)).actor;
    } else {
        tactor = game.actors.get(args[0].actorId);
    }
    let damageE = damage.filter(t => t.type === 'acid' || t.type === 'cold' || t.type === 'fire' || t.type === 'lightning' || t.type === 'thunder');
    if (damageE.length === 0) {
        ui.notifications.warn("Incoming attack did not have acid, cold, fire, lightning or thunder damage.");
        // message to restore spell slot on failure
        let messageText = `The Absorb Elements spell failed on ${tactor.name}. Please restore the <b>level ${args[0].spellLevel}</b> spell slot`;
        const myActor = args[0].actor;
        const ids = await getUser(myActor).map(i => i.id);
        function getUser(actor) {
            const { OWNER } = CONST.DOCUMENT_PERMISSION_LEVELS;
            return game.users.filter(i => {
                const b = i.active;
                const c = actor.testUserPermission(i, OWNER);
                return b && c;
            });
        }
        console.log(ids);
        ChatMessage.create({
            content: 'WTF',
            whisper: [ids]
        });

        damageE.sort(function (a, b) { return b.damage - a.damage });
        let element = damageE[0].type;  // what element type
        let effect = tactor.effects.find(i => i.data.label === `${itemname} (Melee Damage)`);
        let changes = duplicate(effect.data.changes);
        changes[0].value = `${args[0].spellLevel}d6[${element}]`;
        changes[1].value = `${args[0].spellLevel}d6[${element}]`;
        await effect.update({ changes });
        effect = tactor.effects.find(i => i.data.label === `${itemname} (Resistance)`);
        changes = duplicate(effect.data.changes);
        changes[0].value = element;
        await effect.update({ changes });
    }

});