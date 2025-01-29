//MidiQOL OnUse
const lastArg = args[args.length - 1];

if (lastArg.tag === 'OnUse') {
    if (lastArg.hitTargets.length === 0) return {}; //Nobody hit
    if (lastArg.failedSaves.length === 0) return {}; //No failed saves
    const target = canvas.tokens.get(lastArg.hitTargets[0].id); //the victim
    const [curHpMax, curHp] = [target.actor.getRollData().attributes.hp.max, target.actor.getRollData().attributes.hp.value]; //the victim's current hp and max
    const dmgRoll = await new Roll(`${lastArg.damageList[0].appliedDamage}`).evaluate({ async: true })
    const dmgAmount = dmgRoll.total; //the applied damage of the attack to reduce hp
    const newHpMax = curHpMax - dmgAmount; //the current max health less damage of this attack after a failed save

    let getLifeDrain = await target.actor.effects.find(e => e.data.label === 'Life Drain'); //the DAE effect
    if (!getLifeDrain) {
        // the DAE effect does not exist so create it and save the maxHp for later usage
        let newDrainedHp = 0 - dmgAmount;
        let effectData = {
            label: 'Life Drain',
            icon: 'icons/magic/unholy/strike-body-life-soul-green.webp',
            origin: lastArg.uuid,
            disabled: false,
            duration: { startTime: game.time.worldTime },
            flags: {'dae': {selfTarget: false,stackable: 'none',durationExpression: '',macroRepeat: 'none',specialDuration: ['longRest'],transfer: false}},
            changes: [
                {key: 'data.attributes.hp.max',mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,value: `${newDrainedHp}`,priority: '20'},
                {key: 'macro.itemMacro',mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,value: `${lastArg.hitTargets[0].id} ${curHpMax}`,priority: '30'}
            ],
        };
        await MidiQOL.socket().executeAsGM('createEffects', { actorUuid: target.actor.uuid, effects: [effectData] });
    } else if (getLifeDrain) {
        // update the existing effect with the new health reduction (this drops the itemMacro call because we saved the flag before)
        let oldDrainHp = Number(getLifeDrain.data.changes[0].value);
        let newDrainedHp = oldDrainHp - dmgAmount;
        let effectData = {
            _id: getLifeDrain.data._id,
            changes: [
                {key: 'data.attributes.hp.max',mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,value: `${newDrainedHp}`,priority: '20'},
                {key: 'macro.itemMacro',mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,value: `${lastArg.hitTargets[0].id}`,priority: '30'}
            ],
        };
        await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: target.actor.uuid, updates: [effectData] });
    }

    //Reduce the target's max hp. If the current hp is greater than the new max hp, lower current to match.
    await target.actor.update({ "data.attributes.hp.max": newHpMax });
    if (curHp > newHpMax) {await target.actor.update({ "data.attributes.hp.value": newHpMax });};

    //Broadcast to chat
    let hitContent = `<div class="midi-qol-nobox"><div class="midi-qol-flex-container"><div>This attack reduces ${target.name}'s Maximum Hit Points by ${dmgAmount}.</div><div class="midi-qol-target-npc-GM"><em>The maximum hit points for ${target.name} have been reduced from ${curHpMax} to ${newHpMax} in this attack.</em></div><div class="midi-qol-target-npc-GM"><em>The reduction lasts until ${target.name} finishes a long rest.</em></div><div class="midi-qol-target-npc-GM"><em>${target.name} dies if this effect reduces its hit point maximum to 0.</em></div></div></div>`;
    let chatMessage = game.messages.get(lastArg.itemCardId);
    let content = duplicate(chatMessage.data.content);
    let searchString = /<div class="end-midi-qol-saves-display">/g;
    let replaceString = `<div class="end-midi-qol-saves-display">${hitContent}`;
    content = content.replace(searchString, replaceString);
    chatMessage.update({ content: content });
}

if (args[0] === 'on') {
    //Save the original max hp for when the effect expires
    let target = canvas.tokens.get(args[1]);
    await DAE.setFlag(target.actor, "daeLifeDrain", {"tokenId": args[1],"hpMax": args[2]});
    console.log('DAE Flag set for LIFE_DRAIN');
}
if (args[0] === 'off') {
    //Restore the original max hp when effect expires
    let actorD = canvas.tokens.get(args[1]).actor;
    let flag = DAE.getFlag(actorD, "daeLifeDrain")
    await actorD.update({ "data.attributes.hp.max": flag.hpMax });
    await DAE.unsetFlag(actorD, "daeLifeDrain")
    console.log('DAE Flag unset for LIFE_DRAIN');
}

