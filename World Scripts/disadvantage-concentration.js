Hooks.on("midi-qol.preCheckSaves", async (workflow)=> {
    if(!workflow.item.data.name === "Concentration") return;
    const token5e = canvas.tokens.get(workflow.tokenId);
    const creatures = MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.HOSTILE,token5e,5);
    let validCreatures = arrayRemove(creatures, token5e);
    if (validCreatures.length === 0) return;
    const conditions = ['Dead','Incapacitated','Paralysed','Paralyzed','Petrified','Stunned','Unconscious'];
    for (let validCreature of validCreatures) {
        if (conditions.some(i=>validCreature.actor.effects.find(eff=>eff.data.label === i))) {
            validCreatures = arrayRemove(validCreatures, validCreature)
            if (validCreatures.length === 0) return;
            else continue;    
        }
        else continue;
    }

    const effectData = {
        "changes": [
            {
                "key": "flags.midi-qol.disadvantage.concentration",
                "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                "value": "1",
                "priority": "20"
            }
        ],
        "disabled": false,
        "duration": {
            "rounds": 1, 
            "startTime": game.time.worldTime
        },
        "flags": {
            "dae": {
                "specialDuration": ["isSave"],
            }, 
            "core": {
                "statusId": ''
            }
        },
        "origin": token5e.actor.uuid,
        "icon": "icons/creatures/tentacles/tentacles-thing-green.webp",
        "label": "Disadvantage concentration because of enemies in proximity",
        "tint": "",
        "transfer": false
    }
    await token5e.actor.createEmbeddedDocuments("ActiveEffect", [effectData])
    function arrayRemove(arr, value) {
        return arr.filter(function(ele){
            return ele != value;
        });
    };
})