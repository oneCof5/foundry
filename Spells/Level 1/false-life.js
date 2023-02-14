/// Midi QOL OnUse
const lastArg = args[args.length - 1];
const tokenD = canvas.tokens.get(lastArg.tokenId);
const tactor = tokenD.actor;

const curTempHP = tactor.data.data.attributes.hp.temp;
console.log(`${tactor.data.name} currently has ${curTempHP}`);

let upcast = (parseInt(args[1]-1)) * 5;
if (upcast>0) console.log(`${tactor.data.name} cast this spell with a ${args[1]} spellslot, increasing the temphp by ${upcast}`);

if (args[0] === "on") {
    const damage_type = "temphp";
    let plusTempHp = 4 + upcast;
    let damageRoll = new Roll(`${numDice}d4+${plusTempHp}`).evaluate({async:false});
    game.dice3d?.showForRoll(damageRoll);
    new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damage_type, [targetD], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damage_type]})`, itemCardId: lastArg.itemCardId, damageList: lastArg.damageList});
}

if (args[0] === "off") {
    ChatMessage.create({content: tactor.data.name + " loses the temporary hit points from False Life."});
    tactor.update({"data.attributes.hp.temp" : 0});
}