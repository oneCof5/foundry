// Spell Item: ItemMacro
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];

if (args[0].tag === "OnUse") {
    const target = canvas.tokens.get(lastArg.targets[0].id);
    const tokenD = canvas.tokens.get(lastArg.tokenId);
    const itemD = lastArg.item;
    const level = lastArg.spellLevel;
    const uuid = lastArg.uuid;
    const hours = level === 3 ? 480 : level === 4 ? 480 : level >= 5 ? 1440 : 60;
    const seconds = level === 3 ? 28800 : level === 4 ? 28800 : level >= 5 ? 86400 : 3600;
    const ability_fname = Object.values(CONFIG.DND5E.abilities);
    const ability_sname = Object.keys(CONFIG.DND5E.abilities);
    const gameRound = game.combat ? game.combat.round : 0;
    let ability_list = "";
    for (let i = 0; i < ability_fname.length; i++) {
        let full_name = ability_fname[i];
        let short_name = ability_sname[i];
        ability_list += `<option value="${short_name}">${full_name}</option>`;
    }
    let the_content = `<form><div class="form-group"><label for="ability">Ability:</label><select id="ability">${ability_list}</select></div></form>`;
    new Dialog({
        title: itemD.name,
        content: the_content,
        buttons: {
            hex: {
                label: "Hex",
                callback: async (html) => {
                    let ability = html.find('#ability')[0].value;
                    return new Promise(async (resolve) => {
                        await bonusDamage(target, itemD, uuid, tokenD, hours, seconds, gameRound);
                        await applyDis(target, ability, itemD, uuid, level, tokenD, hours, seconds, gameRound);
                        resolve();
                        if ((!(game.modules.get("JB2A_DnD5e")?.active)) && (!(game.modules.get("sequencer")?.active))) return {};
                        new Sequence()
                            .effect()
                            .file("jb2a.markers.skull.purple.03")
                            .atLocation(target)
                            .play()                        
                    });
                }
            }
        },
        default: "Hex"
    }).render(true);
}

async function bonusDamage(target, itemD, uuid, tokenD, hours, seconds, gameRound) {
    let getConc = await tokenD.actor.effects.find(i => i.data.label === "Concentrating");
    if (!getConc) return ui.notifications.error(`Concentrating is missing`);
    let effectData = {
        label: "Hexxed", // itemD.name,
        icon: "systems/dnd5e/icons/skills/violet_24.jpg",
        origin: uuid,
        disabled: false,
        duration: { rounds: hours, seconds: seconds, startRound: gameRound, startTime: game.time.worldTime },
        flags: {
            "dae": { itemData: itemD }
        },
        changes: [
            { key: "flags.midi-qol.hexMark", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: target.id, priority: 20 },
            { key: "flags.dnd5e.DamageBonusMacro", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: `ItemMacro.${itemD.name}`, priority: 20 },
            { key: `flags.dae.deleteUuid`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: getConc.uuid, priority: 20 }
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tokenD.actor.uuid, effects: [effectData] });
    await wait(2000);
    let effect = await tokenD.actor.effects.find(i => i.data.label === "Hex");
    let concUpdate = {
        _id: getConc.data._id,
        changes: [{ key: `flags.dae.deleteUuid`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: effect.uuid, priority: 20 }]
    };
    await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: tokenD.actor.uuid, updates: [concUpdate] });
}

async function applyDis(target, ability, itemD, uuid, level, tokenD, hours, seconds, gameRound) {
    await wait(1000);
    const hexEffect = await tokenD.actor.effects.find(i => i.data.label === "Hex");
    const concEffect = await tokenD.actor.effects.find(i => i.data.label === "Concentrating");
    let effectData = {
        label: itemD.name,
        icon: itemD.img,
        origin: uuid,
        disabled: false,
        duration: { rounds: hours, seconds: seconds, startRound: gameRound, startTime: game.time.worldTime },
        flags: {
            "dae": { itemData: itemD, spellLevel: level, tokenId: tokenD.id, hexId: hexEffect.id, concId: concEffect.id }
        },
        changes: [
            { key: `flags.midi-qol.disadvantage.ability.check.${ability}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 1, priority: 20 },
            { key: "macro.execute", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "HexLMonitor", priority: 20 },
            { key: `flags.dae.deleteUuid`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: hexEffect.uuid, priority: 20 }
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: [effectData] });
}

if (args[0].tag === "DamageBonus") {
    const target = canvas.tokens.get(args[0].targets[0].id);
    const tokenD = canvas.tokens.get(args[0].tokenId);
    const itemD = args[0].item;
    const damageType = "necrotic";
    if (target.id !== getProperty(tokenD.actor.data.flags, "midi-qol.hexMark")) return {};
    let attackTypes = ["msak","rsak","mwak","rwak"];
    let spells = tokenD.actor.itemTypes.spell.filter(i => i.hasDamage && attackTypes.includes(i.data.data.actionType)).map(i => i.name.toLowerCase());
    let weapons = tokenD.actor.itemTypes.weapon.filter(i => i.hasDamage && attackTypes.includes(i.data.data.actionType)).map(i => i.name.toLowerCase());
    let attackList = weapons.concat(spells);
    let legalAttack = attackList.some(i => (itemD.name).toLowerCase().includes(i));
    if (!legalAttack) return {};
    let damageDice = await new game.dnd5e.dice.DamageRoll(`1d6[${damageType}]`, tokenD.actor.getRollData(), { critical: args[0].isCritical }).evaluate({ async: true });
    return { damageRoll: `${damageDice.formula}`, flavor: `(Hex (${CONFIG.DND5E.damageTypes[damageType]}))`, damageList: args[0].damageList, itemCardId: args[0].itemCardId };
}