# Soothing Twilight
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const actorD = game.actors.get(args[0].actor._id);
const tokenD = canvas.tokens.get(args[0].tokenId);
const itemD = args[0].item;
const target = canvas.tokens.get(args[0].targets[0].id);
const cancel = false;
let aButtons = { cancel: { label: "Cancel", callback: async () => cancel } };
let heal = "heal";
let cure = "cure";
let targetTempHp = target.actor.data.data.attributes.hp.temp;
let maxPosTemp = await new Roll('1d6 + @classes.cleric.levels', actorD.getRollData()).evaluate({ maximize: true, async: true }).total;
let damageRoll = await new Roll('1d6 + @classes.cleric.levels', actorD.getRollData()).evaluate({ async: true });
console.log(`[${itemD.name}] Maximum Temp Heal: ${damageRoll.formula} = ${maxPosTemp}`);
console.log(`Target: ${target.name}, Current TempHP: ${targetTempHp != null ? targetTempHp : 0}, Rolled TempHp: ${damageRoll.total} => ${damageRoll.total > targetTempHp ? "Continue" : "Terminated"}`);
let target_conditions = ["Charmed", "Frightened"];
let targetInflicted = target.actor.effects.filter(i => target_conditions.includes(i.data.label)).reduce((list, item) => {
    console.log(`Condition Found: ${item.data.label}`);
    list.push(`<img class="condition" src="${item.data.icon}" width="30" height="30" title="${item.data.label}"}>`);
    return list;
}, []);

if ((targetTempHp === maxPosTemp) && (targetInflicted.length === 0)) return await game.user.updateTokenTargets([]);

if ((targetTempHp != maxPosTemp) && (damageRoll.total > targetTempHp)) {
    aButtons[heal] = {
        label: "Heal", callback: async (html) => {
            let damageType = "temphp";
            game.dice3d?.showForRoll(damageRoll);
            await new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damageType, [target], damageRoll, { flavor: `(${CONFIG.DND5E.healingTypes[damageType]})`, itemCardId: args[0].itemCardId, useOther: false });
            await ui.chat.scrollBottom();            
            await game.user.updateTokenTargets([]);
        }
    }
}

if (targetInflicted.length > 0) {
    aButtons[cure] = {
        label: "Cure", callback: async () => {
            let condition_list = ["Charmed", "Frightened"];
            let effect = target.actor.effects.filter(i => condition_list.includes(i.data.label));
            let selectOptions = "";
            for (let i = 0; i < effect.length; i++) {
                let condition = effect[i].data.label;
                selectOptions += `<option value="${condition}">${condition}</option>`;
            }
            if (selectOptions === "") {
                return ui.notifications.warn(`There's nothing to Cure on ${target.name}.`);
            } else {
                let content_cure = `<p>Choose a Condition Cure</p><form class="flexcol"><div class="form-group"><select id="element">${selectOptions}</select></div></form>`;
                new Dialog({
                    title: itemD.name,
                    content: content_cure,
                    buttons: {
                        cure: {
                            icon: '<i class="fas fa-check"></i>',
                            label: 'Cure!',
                            callback: async (html) => {
                                let element = html.find('#element').val();
                                let effect = target.actor.effects.find(i => i.data.label === element);
                                if (effect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: target.actor.uuid, effects: [effect.id] });
                                let chatContent = `<div class="midi-qol-nobox"><div class="midi-qol-flex-container"><div>Cures ${element}:</div><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}"> ${target.name}</div><div><img src="${target.data.img}" width="30" height="30" style="border:0px"></img></div></div></div>`;
                                await wait(500);
                                const chatMessage = game.messages.get(args[0].itemCardId);
                                let content = duplicate(chatMessage.data.content);
                                const searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
                                const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${chatContent}`;
                                content = content.replace(searchString, replaceString);
                                chatMessage.update({ content: content });
                                await ui.chat.scrollBottom();                                
                                await game.user.updateTokenTargets([]);
                            }
                        }
                    },
                    default: "cure",
                }).render(true);
            }
        }
    }
}
let finalButtons = Object.values(aButtons);
if (finalButtons.length === 1) return await game.user.updateTokenTargets([]);
new Dialog({
    title: `${itemD.name} : Choose an Effect`,
    content: `<style>#twilightInfo img{border:none}#twilightInfo{padding:10px}#twilightInfo .target{margin-right:10px}#twilightInfo .condition{border:1px solid red!important;margin:2px 5px}#twilightInfo ul{list-style:none}#twilightInfo ul li{float:left;margin-right:5px}</style><div id="twilightInfo" class="form-group"><ul><li><img class="target" src="${target.data.img}" height="40" width="40" title="${target.name}"></li><li><div><b>Target:</b> ${target.name}</div><div><b>Temp HP:</b> ${targetTempHp != null ? targetTempHp : 0} / ${maxPosTemp}</div></li><li><div>${targetInflicted.join('')}</div></li></ul></div>`,
    buttons: aButtons,
    default: cancel
}).render(true);