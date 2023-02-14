console.log(args);
async function wait(ms) { return new Promise(resolve => {setTimeout(resolve, ms);}); }
const lastArg = args[args.length - 1];
const tokenD = canvas.tokens.get(lastArg.tokenId);
const actorD = tokenD.actor;
const targetD = canvas.tokens.get(lastArg.hitTargets[0].id);
const startTime = game.time.worldTime;
const gameRound = game.combat ? game.combat.round : 0;
const biDie = `1d${actorD.data.flags.dae.BardicInspirationDice}`;

if (lastArg.tag === "OnUse") {}
    const effectData = {
        "changes": 
        [
            {"key": "flags.midi-qol.optional.bardicInspiration.attack.all","mode": 5,"value": biDie,"priority": "20"}, // apply to attacks
            {"key": "flags.midi-qol.optional.bardicInspiration.save.all","mode": 5,"value": biDie,"priority": "20"}, // apply to saves
            {"key": "flags.midi-qol.optional.bardicInspiration.check.all","mode": 5,"value": biDie,"priority": "20"}, // apply to raw ability check
            {"key": "flags.midi-qol.optional.bardicInspiration.skill.all","mode": 5,"value": biDie,"priority": "20"}, // apply to ability skills
            {"key": "flags.midi-qol.optional.bardicInspiration.label","mode": 5,"value": "Bardic Inspiration","priority": "20"}
        ],
        "disabled": false,
        "duration": {"startTime": `${startTime}`,"seconds": 600},
        "icon": "systems/dnd5e/icons/skills/yellow_08.jpg",
        "label": "Inspired",
        "origin": lastArg.itemUuid,
        "flags": {
            "dae": {
                "stackable": "none",
                "macroRepeat": "none",
                "specialDuration": [],
                "transfer": false,
                "durationExpression": "",
                "itemData": lastArg.itemData,
                "token": lastArg.targetUuids[0]
            }
        }
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetD.actor.uuid, effects: [effectData] });


