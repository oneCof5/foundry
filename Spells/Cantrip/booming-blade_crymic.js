// version 1.04 for 9.X// get more macros at https://www.patreon.com/crymic
async function wait(ms) { return new Promise(resolve => {setTimeout(resolve, ms);}); }
const lastArg = args[args.length - 1];
const gameRound = game.combat ? game.combat.round : 0;

if (args[0].tag === "OnUse") {
    let tokenD = canvas.tokens.get(lastArg.tokenId);
    let itemD = lastArg.item;
    let effectData = [{
        changes: [
            { key: "flags.midi-qol.BoomingBlade.uuid", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: lastArg.uuid, priority: 20 },
            { key: "flags.dnd5e.DamageBonusMacro", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: `ItemMacro.${lastArg.item.name}`, priority: 20 }
        ],
        origin: lastArg.uuid,
        disabled: false,
        duration: { rounds: 1, startRound: gameRound, startTime: game.time.worldTime },
        flags: { dae: { itemData: itemD, specialDuration: ["1Attack", "zeroHP", "turnStartSource"] } },
        icon: lastArg.item.img,
        label: game.i18n.localize(lastArg.item.name)
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tokenD.actor.uuid, effects: effectData });
}

if (args[0].tag === "DamageBonus") {
    if (lastArg.hitTargets.length === 0) return {};
    if (!["mwak", "msak"].includes(lastArg.item.data.actionType)) return {};
    let target = canvas.tokens.get(lastArg.hitTargets[0].id);
    let tokenD = canvas.tokens.get(lastArg.tokenId);
    let itemD = await fromUuid(getProperty(tokenD.actor.data.flags, "midi-qol.BoomingBlade.uuid"));    
    let spellLevel = tokenD.actor.data.data.details.level ?? tokenD.actor.data.data.details.cr;
    let damageNum = 1 + (Math.floor((spellLevel + 1) / 6));
    let effectData = [{
        changes: [
            { key: "macro.itemMacro", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: `ItemMacro.${itemD.name}`, priority: 20 }
        ],
        origin: lastArg.uuid,
        flags: { dae: { itemData: itemD.data, specialDuration: ["isMoved", "turnStartSource"] } },
        disabled: false,
        duration: { rounds: 1, startRound: gameRound, startTime: game.time.worldTime },
        icon: "icons/magic/movement/trail-streak-impact-blue.webp",
        label: game.i18n.localize(`${itemD.name} Move`)
    }];
    let effect = target.actor.effects.find(i => i.data.label === itemD.name);
    if (effect) return {};
    if (((game.modules.get("jb2a_patreon")?.active) && ((game.modules.get("sequencer")?.active)))) {
        new Sequence()
            .effect()
            .file("jb2a.token_border.circle.static.blue.011")
            .atLocation(target)
            .scaleToObject(1.2)
            .persist()
            .name(`BBlade-${target.id}`)
            .thenDo(async function () {
                await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: effectData })
            })
            .play()
    } else {
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: effectData });
    }
    if (spellLevel >= 5) {
        let damageType = "thunder";
        let damageRoll = await new Roll(`${damageNum - 1}d8[${damageType}]`).evaluate({ async: true });
        game.dice3d?.showForRoll(damageRoll);
        await new MidiQOL.DamageOnlyWorkflow(tokenD.actor, tokenD, damageRoll.total, damageType, [target], damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemData: itemD.data, itemCardId: "new" });
        if ((!(game.modules.get("jb2a_patreon")?.active)) && (!(game.modules.get("sequencer")?.active))) return {};
        new Sequence()
            .effect()
            .file("jb2a.static_electricity.01.blue")
            .atLocation(target)
            .scaleToObject(1.5)
            .play()
    }
    await wait(800);
    let targetEffect = target.actor.effects.find(i => i.data.label === game.i18n.localize(`${itemD.name} Move`));
    let secondEffect = [{
        changes: [
            { key: `flags.midi-qol.BoomingBlade.tokenId`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: lastArg.tokenId, priority: 20 },
            { key: `flags.midi-qol.BoomingBlade.uuid`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: getProperty(tokenD.actor.data.flags, "midi-qol.BoomingBlade.uuid"), priority: 20 },
            { key: `flags.midi-qol.BoomingBlade.damage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: damageNum, priority: 20 },
            { key: "macro.itemMacro", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: `ItemMacro.${itemD.name}`, priority: 20 },
            { key: "flags.dae.deleteUuid", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: targetEffect.uuid, priority: 20 }
        ],
        origin: lastArg.uuid,
        flags: { dae: { itemData: itemD.data } },
        disabled: false,
        duration: { rounds: 1, startRound: gameRound, startTime: game.time.worldTime },
        icon: itemD.img,
        label: game.i18n.localize(itemD.name)
    }];
    if (targetEffect) await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: secondEffect });    
    let selfEffect = tokenD.actor.effects.find(i => i.data.label === itemD.name);
    if (selfEffect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tokenD.actor.uuid, effects: [selfEffect.id] });
}

if (lastArg["expiry-reason"] === "midi-qol:isMoved") {
    let target = canvas.tokens.get(lastArg.tokenId);
    let itemD = await fromUuid(getProperty(target.actor.data.flags, "midi-qol.BoomingBlade.uuid"));
    let damageDice = parseInt(getProperty(target.actor.data.flags, "midi-qol.BoomingBlade.damage"));
    let tokenD = canvas.tokens.get(getProperty(target.actor.data.flags, "midi-qol.BoomingBlade.tokenId"));
    let damageType = "thunder";
    let damageRoll = await new Roll(`${damageDice}d8[${damageType}]`).evaluate({ async: true });
    game.dice3d?.showForRoll(damageRoll);
    await new MidiQOL.DamageOnlyWorkflow(tokenD.actor, tokenD, damageRoll.total, damageType, [target], damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemData: itemD.data, itemCardId: "new" });
    let effect = target.actor.effects.find(i => i.data.label === itemD.name);
    if (effect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: target.actor.uuid, effects: [effect.id] });
    if ((!(game.modules.get("jb2a_patreon")?.active) && (!(game.modules.get("sequencer")?.active)))) return {};
    new Sequence()
        .effect()
        .file("jb2a.impact.012.blue")
        .async()
        .atLocation(target)
        .scaleToObject(1.8)
        .play()
}

if (args[0] === "off") {
    if (Sequencer.EffectManager.getEffects({ name: `BBlade-${lastArg.tokenId}` })) {
        Sequencer.EffectManager.endEffects({ name: `BBlade-${lastArg.tokenId}` });
    }
}