async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
const startTime = game.time.worldTime;
const startRound = game.combat ? game.combat.round : 0;
let tactor;
if (args[0].tokenUuid) {
    tactor = (await fromUuid(args[0].tokenUuid)).actor;
} else {
    tactor = game.actors.get(args[0].actorId);
}

console.log('ABSORB-ELEMENTS lastArg', lastArg);
console.log('ABSORB-ELEMENTS startTime', startTime);
console.log('ABSORB-ELEMENTS startRound', startRound);
console.log('ABSORB-ELEMENTS lastArg', tactor);

Hooks.once('midi-qol.preDamageRollComplete', async function (wfAttack) {
    // was there damage?
    if (!wfAttack.damageDetail) return {};
    // was that damage of the right element type?
    const damageE = wfAttack.damageDetail.filter(t => t.type === 'acid' || t.type === 'cold' || t.type === 'fire' || t.type === 'lightning' || t.type === 'thunder');
    if (damageE.length === 0) {
        ui.notifications.warn("Incoming attack did not have acid, cold, fire, lightning or thunder damage.");
        // message to restore spell slot on failure
        let messageText = `The Absorb Elements spell failed on ${tactor.name}. Please restore the <b>level ${args[0].spellLevel}</b> spell slot`;
        const { OWNER } = CONST.DOCUMENT_PERMISSION_LEVELS;
        let ids = game.users.filter(u => tactor.testUserPermission(u, OWNER));
        console.log(ids);
        ids = ids.map(i => i.id);
        console.log(ids);
        ChatMessage.create({
            content: messageText,
            whisper: [ids]
        });
    } else {
        // pick the highest damaging element type
        console.log('ABSORB-ELEMENTS had elemental damage');
        damageE.sort(function (a, b) { return b.damage - a.damage });
        const element = damageE[0].type;
        console.log('ABSORB-ELEMENTS element', element);
        let effectData = {
            "flags": {
                "dae": {
                    "stackable": "none",
                    "macroRepeat": "none",
                    "transfer": false,
                    "specialDuration": ["1Hit:mwak", "1Hit:msak", "turnEndSource"],
                    "selfTarget": false,
                    "durationExpression": ""
                }
            },
            "changes": [
                { "key": "data.bonuses.mwak.damage", "mode": 0, "value": `${lastArg.spellLevel}d6[${element}]`, "priority": "20" },
                { "key": "data.bonuses.msak.damage", "mode": 0, "value": `${lastArg.spellLevel}d6[${element}]`, "priority": "20" }
            ],
            "disabled": false,
            "duration": { "startTime": startTime, "startRound": startRound },
            "icon": lastArg.item.img,
            "label": `${lastArg.item.name}: Bonus ${element} Damage`,
            "transfer": false,
            "selectedKey": ["data.bonses.mwak.damage", "data.bonuses.msak.damage"]
        };
        console.log('ABSORB-ELEMENTS effectData', effectData);

        await MidiQOL.socket().executeAsGM("createEffects", {
            actorUuid: tactor.uuid,
            effects: [effectData]
        });
        effectData
            .changes = [
                { "key": "data.traits.dr.value", "mode": 2, "value": element, "priority": "20" }
            ]
                .label = `${lastArg.item.name}: ${element} Resistance`;
        console.log('ABSORB-ELEMENTS effectData', effectData);

        await MidiQOL.socket().executeAsGM("createEffects", {
            actorUuid: tactor.uuid,
            effects: [effectData]
        });
    }
});