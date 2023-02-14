// World Script Module Required to run this.
Hooks.on("midi-qol.preDamageRoll", async function (workflow) {
    if(!workflow.isCritical) return {};
    let piercer = workflow.actor.itemTypes.feat.find(i=> i.name.toLowerCase() === "piercer");
    if(!piercer) return {};
    let itemD = workflow.item;
    if(itemD.data.data.damage.parts[0][1] != "piercing") return {};
    let gameRound = game.combat ? game.combat.round : 0;    
    let effectData = [{
        changes: [            
            { key: "flags.dnd5e.meleeCriticalDamageDice", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1, priority: 20 }
        ],
        origin: "",
        disabled: false,
        duration: { rounds: 1, startRound: gameRound, startTime: game.time.worldTime },
        flags: { dae: { specialDuration: ["DamageDealt"] } },
        icon: workflow.item.img,
        label: workflow.item.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: workflow.actor.uuid, effects: effectData });
});