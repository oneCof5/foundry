// https://discord.com/channels/170995199584108546/699750150674972743/1007370984090775592
//requires MidiQOL, Item Macro, Combat Utility Belt, Advanced Macro, DAE. Maybe more which I don't realise. 
//Thanks to Crymic, theripper93, tposney, thatlonelybugbear, Freeze, Flix, Zhell, and errational for thier help in the Foundry discord and their own discords. 
//Create action, 1 action, Target: 1 creature, Range: Touch, Action type: Utility, On Use Macro: ItemMacro.
async function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
new Dialog({
    title: "Shove Action",
    content: "Which Shove Action?",
    buttons: {
        A: { label: "Shove (Prone)", callback: () => { return ShoveProne(); } },
        B: { label: "Shove (Knockback)", callback: () => { return ShoveKnockback(); } },
    }
}).render(true);

async function ShoveProne() {
    let shover = canvas.tokens.get(args[0].tokenId);
    let defender = Array.from(game.user.targets)[0];
    ChatMessage.create({ 'content': `${shover.name} tries to shove ${defender.name} to the ground!` })
    let tactorRoll = await shover.actor.rollSkill("ath");
    let skill = defender.actor.data.data.skills.ath.total < defender.actor.data.data.skills.acr.total ? "acr" : "ath";
    let tokenRoll = await defender.actor.rollSkill(skill);
//    await wait(3000);
    if (tactorRoll.total >= tokenRoll.total) {
        const effectData = {
            "label": "Prone",
            "icon": "modules/dfreds-convenient-effects/images/prone.svg",
            "changes": [
                { "key": "macro.CE", "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM, "value": "Prone", "priority": "20" }
            ]
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: defender.actor.uuid, effects: [effectData] });
        ChatMessage.create({ 'content': `${shover.name} succeeds! ${defender.name} is now prone.` })
    }
    else {
        ChatMessage.create({ 'content': `${defender.name} resists the attempt from ${shover.name}.` })
    }
}

async function ShoveKnockback() {
    let pusher = canvas.tokens.get(args[0].tokenId);
    let target = Array.from(game.user.targets)[0];
    ChatMessage.create({ 'content': `${pusher.name} tries to shove ${target.name} back 5 feet!` })
    let tactorRoll = await pusher.actor.rollSkill("ath");
    let skill = target.actor.data.data.skills.ath.total < target.actor.data.data.skills.acr.total ? "acr" : "ath";
    let tokenRoll = await target.actor.rollSkill(skill);
    // await wait(3000);
    if (tactorRoll.total >= tokenRoll.total) {
        ChatMessage.create({ 'content': `${pusher.name} succeeds! ${target.name} involuntarily moves 5 ft.!` })
    }
    else ChatMessage.create({ 'content': `${pusher.name} fails. ${target.name} remains unmoved.` })

}