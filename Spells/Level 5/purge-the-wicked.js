/* Call as OnUse ItemMacro from Purge the Wicked spell.  If kills the target, animate under caster's control.*/
console.log("Purge the Wicked args",args);
const lastArg = args[args.length - 1];

if (lastArg.tag === "OnUse") {
    if (lastArg.hitTargets.length === 0 || lastArg.hitTargets === undefined) return {} // ensure this hit 

    // validate target is humanoid

    const newHP = lastArg.damageList[0].newHP;
    console.log("Purge the Wicked targetD: ",newHP);
    if (newHP > 0) return {} // not dead

    const casterD = canvas.tokens.get(lastArg.tokenId).actor; // the caster of the spell
    console.log("Purge the Wicked casterD: ",casterD);
    const targetD = canvas.tokens.get(lastArg.targets[0].id); // the targeted token of the spell
    console.log("Purge the Wicked targetD: ",casterD);

    // notify the results
    const content = `<p><em>Upon perishing from the result of the necromatic entergy in the spell, ${targetD.name} arises as an undead zombie servant.</em></p></p>${targetD.name} is permanently under the command of ${casterD.name} and must follow their verbal orders to the best of its ability.</p>`;
    const spellMsg = game.messages.get(lastArg.itemCardId);
    const speaker = spellMsg.data.speaker;
    await ChatMessage.create({
        "flavor": "Animate Undead",
        "content": content,
        "speaker": speaker
    });

    const padding = (canvas.grid.size/2);
    const location = {"x": (targetD.data.x + padding) ,"y": (targetD.data.y + padding)};
    const summonName = "Animated Zombie";
    const updates = {token: {"name": targetD.name}};
    const options = {controllingActor: actor};
    /* Spawn the zombie at the location of the target killed by the spell */
    await warpgate.spawnAt(location, summonName, updates, {}, options);
}
