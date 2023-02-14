//DAE Macro Execute, Effect Value = "Macro Name" @target @damage
//or DAE macro.ItemMacro CUSTOM @target @damage

const target = canvas.tokens.get(args[1]);
const roll = await new Roll(`${args[2]}`).evaluate({async:true})
const amount = roll.total;
const checkifalreadydrained = target.actor.getFlag('world', 'HPDRAIN');

if (args[0] === "on") {
    const hpMax = target.actor.getRollData().attributes.hp.max;
    const hp = target.actor.getRollData().attributes.hp.value;
    const newHpMax = hpMax - amount;
        
    await target.actor.update({"data.attributes.hp.max": newHpMax });
    if (target.actor.getRollData().attributes.hp.value > newHpMax ) {
       await target.actor.update({"data.attributes.hp.value": newHpMax });
    };
    await ChatMessage.create({content: `${target.name} Max HP lowered by ${amount}`});
    if (checkifalreadydrained) return; //check so as not to rewrite the flag and lose original hpMax;
    
    await target.actor.setFlag('world', 'HPDRAIN', hpMax);
};

if (args[0] === "off") {
        const oldhpMax = target.actor.getFlag('world', 'HPDRAIN');
        await target.actor.update({"data.attributes.hp.max": oldhpMax });
        await ChatMessage.create({content: `${target.name} Max HP returns to normal`});
        await target.actor.unsetFlag('world', 'HPDRAIN');
}