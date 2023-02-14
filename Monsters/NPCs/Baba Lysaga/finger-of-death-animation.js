/* Call as OnUse ItemMacro from Finger of Death spell.  If kills the target, animate under caster's control.*/
console.log("Lysaga's finger of death args",args);
const lastArg = args[args.length - 1];

if (lastArg.tag === "OnUse") {
    if (lastArg.hitTargets.length === 0 || lastArg.hitTargets === undefined) return {} // ensure this hit 

    const newHP = lastArg.damageList[0].newHP;
//    console.log("Finger of Death targetD: ",newHP);
    if (newHP > 0) return {} // not dead

    const casterD = canvas.tokens.get(lastArg.tokenId).actor; // the caster of the spell
//    console.log("Finger of Death casterD: ",casterD);
    const targetD = canvas.tokens.get(lastArg.targets[0].id); // the targeted token of the spell
//    console.log("Finger of Death targetD: ",casterD);

    // notify the results
    const content = `<p><em>Upon perishing from the result of the necromatic entergy in the spell, ${targetD.name} arises as an undead zombie servant.</em></p></p>${targetD.name} is permanently under the command of ${casterD.name} and must follow their verbal orders to the best of its ability.</p>`;
    const spellMsg = game.messages.get(lastArg.itemCardId);
    const speaker = spellMsg.data.speaker;
    await ChatMessage.create({
        "flavor": "Animate Undead",
        "content": content,
        "speaker": speaker
    });

    const newHealth = Math.floor(targetD.data.actorData.data.attributes.hp.max / 2);
    console.log("Finger of Death newHealth: ",newHealth);

    const updates = {
        token: {
            name: `Arisen ${
                targetD.name
            }`,
            img: "https://assets.forge-vtt.com/61c6079e99b8eb56f3ca7ede/actor/npc/zombie.Token.webp",
            disposition: -1 // Hostile
        },
        actor: {
            name: `Arisen ${
                targetD.name
            }`,
            img: "https://assets.forge-vtt.com/61c6079e99b8eb56f3ca7ede/actor/npc/zombie.Avatar.webp",
            data: {
                attributes: {
                    hp: {
                        value: newHealth,
                        max: newHealth
                    }
                }
            }
        }
    }

    /* Mutate the selected target */
    await warpgate.mutate(targetD.document, updates);
}
/*
        "speaker": {
            "scene": "l17wvVhA2SiZyXZs",
            "token": "xsgn2x1nf0rwnqsr",
            "actor": "z3U4r3fbtEDmSaGq",
            "alias": "Baba Lysaga"
        },
*/