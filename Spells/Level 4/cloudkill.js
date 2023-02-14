// MidiQOL OnUse ItemMacro  -- DFred's CE is essential
console.log(args);
if (!game.modules.get("dfreds-convenient-effects")?.active) { ui.notifications.error("Please enable the DFred's Convenient Effects module"); return; }
const lastArg = args[args.length - 1];
let actorD, tokenD;
if (lastArg.tokenId) {
  tokenD = canvas.tokens.get(lastArg.tokenId);
  actorD = tokenD.actor
}
else actorD = game.actors.get(lastArg.actorId);

if (args[0].tag === "OnUse") {
//    const casterToken = await fromUuid(args[0].tokenUuid);
//    const caster = casterToken.actor;
  let cloudActor = game.actors.getName("Cloudkill");
/*
    if (!cloudActor) {
        const jsonData = JSON.parse(`{}`)   //JSON inside that `{}` section
        await MidiQOL.socket().executeAsGM("createActor", {actorData: jsonData});
    }
*/
  if (!cloudActor) {
    ui.notifications.error("Could not locate the Cloudkill actor!");
    return;
  }
    const startTime = game.time.worldTime;
    const changeValue = `turn=start,saveDC=${caster.data.data.attributes.spelldc ?? 10},saveAbility=con,damageRoll=${args[0].spellLevel}d8,damageType=poison,saveDamage=halfdamage,saveRemove=false,label=Cloudkill`;
    let gcActorId = cloudActor.id;
    let gcItemId = cloudActor.data.items.filter(i => i.data.name === 'Gas Cloud')[0].id;
    let gcSource = `Actor.${gcActorId}.Item.${gcItemId}`;
    const updates = {
        Item: {
            "Gas Cloud": {
                "data.damage.parts": [[`${args[0].spellLevel}d8[poison]`, "poison"]], 
                "data.save.dc": caster.data.data.attributes.spelldc,
                "effects": [
                  {
                    "changes": [
                      {
                        "key": "flags.midi-qol.OverTime",
                        "mode": 5,
                        "value": changeValue,
                        "priority": "20"
                      },
                      {
                        "key": "macro.CE",
                        "mode": 0,
                        "value": "Blinded",
                        "priority": "10"
                      },
                      {
                        "key": "macro.CE",
                        "mode": 0,
                        "value": "Token Blinded",
                        "priority": "10"
                      }
                    ],
                    "disabled": false,
                    "duration": {
                      "startTime": startTime,
                      "seconds": 600
                    },
                    "icon": "icons/magic/air/weather-clouds.webp",
                    "label": "Gas Cloud",
                    "origin": gcSource, // "Actor.9FO46k2s03RcnKu2.Item.BBGUKBlZTtW9Uloo",
                    "transfer": false,
                    "flags": {
                      "dae": {
                        "stackable": "none",
                        "durationExpression": "",
                        "macroRepeat": "none",
                        "specialDuration": [],
                        "transfer": true
                      },
                      "ActiveAuras": {
                        "isAura": true,
                        "aura": "All",
                        "radius": 2.5,
                        "alignment": "",
                        "type": "",
                        "ignoreSelf": true,
                        "height": true,
                        "hidden": false,
                        "displayTemp": true,
                        "hostile": false,
                        "onlyOnce": false
                      }
                    }
                  },
                ],
              }
        },
    };
    const summoned = await warpgate.spawn("Cloudkill", {embedded: updates}, {}, {});
    if (summoned.length !== 1) return;
    const summonedUuid = `Scene.${canvas.scene.id}.Token.${summoned[0]}`;
    await caster.createEmbeddedDocuments("ActiveEffect", [{
        "changes":  [{"key":"flags.dae.deleteUuid","mode":5,"value": summonedUuid,"priority":"30"}],
        "label": "Cloudkill Summon",
        "duration": {seconds: 600},
        "origin": args[0].itemUuid,
        "icon": "icons/magic/air/fog-gas-smoke-swirling-green.webp",
    }]);
}