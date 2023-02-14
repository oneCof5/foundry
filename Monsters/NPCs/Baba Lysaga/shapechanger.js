const lastArg = args[args.length - 1];
let targetToken = canvas.tokens.get(lastArg.tokenId);
let targetActor = targetToken.actor;

// Polymorph into Swarm of Insects
if (args[0] === "on") {
    const updates = {
        token : {
            name: `${targetActor.data.name} (Shapeshifted)`,
            img: "https://assets.forge-vtt.com/61c6079e99b8eb56f3ca7ede/actor/npc/swarm_of_insects_wasps_.Token.webp"
        },
        actor: {
            name: `${targetActor.data.name} (Shapeshifted)`,
            img: "https://assets.forge-vtt.com/61c6079e99b8eb56f3ca7ede/actor/npc/swarm_of_insects_wasps_.Avatar.webp",
            data: {
                abilities: {
                    "str": { "value": 3 },
                    "dex": { "value": 13 },
                    "con": { "value": 10 },
                    "int": { "value": 1 },
                    "wis": { "value": 7 },
                    "cha": { "value": 1 }
                },
                attributes: {
                    ac: { armor: 10, base: 12, calc: "natural", label: "natural armor", flat: 12, value: 12},
                    hp: { value: 22, max: 22},
                    movement: { fly: 30, hover: "false", units: "ft", walk: 5 },
                    senses: { blindsight: 10, darkvision: 0, units: "ft" }
                },
                traits: {
                    "dr": { "value": ["bludgeoning","piercing","slashing"] },
                    "ci": { "value": ["charmed","frightened","grappled","paralyzed","petrified","prone","restrained","stunned"] }
                }
            }
        }
    };

    // Mutate the token
    await warpgate.mutate(targetToken.document, updates);
    // Grab the last mutation name for future reversal
    const mutation = targetActor.data.flags.warpgate.mutate[targetActor.data.flags.warpgate.mutate.length -1].name;
    // Save the mutation with a DAE flag
    await DAE.setFlag(targetActor, "BabaShapechanger", {"mutation": mutation});
}

if (args[0] === "off") {
    // Revert the selected target 
    let mutation = DAE.getFlag(targetActor, "BabaShapechanger").mutation;
    await warpgate.revert(targetToken.document, mutationName = mutation);
    await DAE.unsetFlag(targetActor, "BabaShapechanger")
}