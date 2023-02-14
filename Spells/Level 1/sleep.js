// Midi QOL OnUse
const lastArg = args[args.length - 1];
const tokenD = canvas.tokens.get(lastArg.tokenId);
const tactor = tokenD.actor;
const targets = lastArg.hitTargets;
let remainHp = lastArg.damageDetail[0].damage;
let lastHp;
let targs = [];
/* loop over targets, ignoring those the spell does not impact:
  1. already unconscious
  2. undead
  3. immune to charm
  4. immune to magical sleep ( elves / fey ancestry || warforged / constructed resilience  || reborn / deathless nature)
*/
for(let targ of targets) { 
    const thisTarg = targ._actor.data;
    if (thisTarg.type === "character" || (thisTarg.type === 'npc' && !(thisTarg.data.details.type.value === "undead"))) {
        let asleep = thisTarg.effects.filter(i => i.data.label === "Unconscious").key;
        let elvish = thisTarg.effects.filter(i => i.data.name === "Fey Ancestry").key;
        let warforged = thisTarg.effects.filter(i => i.data.name === "Constructed Resilience").key;
        let reborn = thisTarg.effects.filter(i => i.data.name === "Deathless Nature").key;
        if (!(asleep) || !(elvish) || !(warforged) || !(reborn)) {
            targs.push(targ);
        }    
    }
}
// sort the new array by hp
targs.sort((a,b) => {
    return a._actor.data.data.attributes.hp.value - b._actor.data.data.attributes.hp.value
});
console.log("targs: ",targs);

for(let targ of targs) { 
    let newHp = targ._actor.data.data.attributes.hp.value;
    lastHp = newHp; // save off this actor's check
    if (newHp > remainHp) return; // break if this actor's HP is greater than the remaining Sleep HP
    if (newHp <= remainHp) {
        let content = `${targ._actor.data.name} falls asleep!`;
        let chatOptions = {
           user: game.user._id,
           speaker: ChatMessage.getSpeaker(),
           type: CONST.CHAT_MESSAGE_TYPES.OTHER,
           content: content
        };
        ChatMessage.create(chatOptions);        
        await MidiMacros.addDfred("Unconscious", targ.actor);
        await MidiMacros.addDfred("Prone", targ.actor);
        remainHp = remainHp - newHp;
    }
    console.log(remainHp," hit points left to apply for Sleep.")
    if (remainHp <= 0) return; // break if remaining is less then zero  
}
