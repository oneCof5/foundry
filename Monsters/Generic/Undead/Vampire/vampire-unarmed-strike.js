async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
if (lastArg.hitTargets.length === 0) return {};
const actorD = game.actors.get(lastArg.actor._id);
const tokenD = canvas.tokens.get(lastArg.tokenId);
const target = canvas.tokens.get(lastArg.hitTargets[0].id);
const itemD = lastArg.item;
const damageType = "bludgeoning";
const baseNum = lastArg.isCritical ? 2 : 1;
const damageRoll = new Roll(`${baseNum}d8 + @abilities.str.mod`, tokenD.actor.getRollData()).evaluate({ async: false });
const effect = target.actor.effects.find(i => i.data.label === game.i18n.localize("Grappled"));
if (!effect) {
    new Dialog({
        title: itemD.name,
        content: `Pick an attack`,
        buttons: {
            attack: {
                label: "Attack", callback: async () => {
                    game.dice3d?.showForRoll(damageRoll);
                    await new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damageType, [target], damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemCardId: lastArg.itemCardId, useOther: false });
                }
            },
            grapple: {
                label: "Grappled", callback: async () => {
                    let saveType = "dex";
                    let DC = 18;
                    let save = await MidiQOL.socket().executeAsGM("rollAbility", { request: "save", targetUuid: target.actor.uuid, ability: saveType, options: { chatMessage: false, fastForward: true } });
                    let success = "saves";
                    if (save.total < DC) {
                        success = "fails";
                        let gameRound = game.combat ? game.combat.round : 0;
                        let effectData = {
                            label: "Grappled",
                            icon: "modules/combat-utility-belt/icons/grappled.svg",
                            origin: lastArg.uuid,
                            disabled: false,
                            duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
                            changes: [{ key: `data.attributes.movement.all`, mode: 5, value: 0, priority: 20 }]
                        };
                        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: [effectData] });
                    }
                    await wait(300);
                    let grapple_msg = `<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} ${success} with ${save.total}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div></div>`;
                    let grapple_result = `<div class="midi-qol-nobox midi-qol-bigger-text">${CONFIG.DND5E.abilities[saveType]} Saving Throw: DC ${DC}</div><div><div class="midi-qol-nobox">${grapple_msg}</div></div>`;
                    let chatMessage = await game.messages.get(lastArg.itemCardId);
                    let content = await duplicate(chatMessage.data.content);
                    let searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
                    let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${grapple_result}`;
                    content = await content.replace(searchString, replaceString);
                    await chatMessage.update({ content: content });
                    await ui.chat.scrollBottom();
                }
            }
        },
        default: "attack"
    }).render(true);
} else {
    game.dice3d?.showForRoll(damageRoll);
    await new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damageType, [target], damageRoll, { flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`, itemCardId: lastArg.itemCardId, useOther: false });
}