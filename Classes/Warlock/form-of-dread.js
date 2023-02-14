// DAE effect running the itemMacro
const lastArg = args[args.length - 1];
const tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
const dreadFearItem = {
    "name": "Dreadful Fear",
    "type": "feat",
    "img": "icons/magic/unholy/silhouette-light-fire-blue.webp",
    "data": {
        "description": {
            "value": "<p>While Form of Dread is active:</p>\n<p>Once during each of your turns, when you hit a creature with an attack roll, you can force it to make a Wisdom saving throw, and if the saving throw fails, the target is frightened of you until the end of your next turn.</p>",
            "chat": "",
            "unidentified": ""
        },
        "source": "",
        "activation": {
            "type": "special",
            "cost": 0,
            "condition": ""
        },
        "duration": {
            "value": null,
            "units": ""
        },
        "target": {
            "value": null,
            "width": null,
            "units": "",
            "type": "creature"
        },
        "range": {
            "value": null,
            "long": null,
            "units": ""
        },
        "uses": {
            "value": null,
            "max": "",
            "per": ""
        },
        "consume": {
            "type": "",
            "target": "",
            "amount": null
        },
        "ability": "",
        "actionType": "util",
        "attackBonus": 0,
        "chatFlavor": "",
        "critical": {
            "threshold": null,
            "damage": ""
        },
        "damage": {
            "parts": [],
            "versatile": ""
        },
        "formula": "",
        "save": {
            "ability": "wis",
            "dc": null,
            "scaling": "spell"
        },
        "requirements": "",
        "recharge": {
            "value": null,
            "charged": false
        }
    },
    "effects": [
        {
            "changes": [
                {
                    "key": "flags.midi-qol.disadvantage.attack.all",
                    "mode": 0,
                    "value": "1",
                    "priority": "1"
                }, {
                    "key": "flags.midi-qol.disadvantage.ability.check.all",
                    "mode": 0,
                    "value": "1",
                    "priority": "1"
                }
            ],
            "icon": "icons/magic/unholy/silhouette-light-fire-blue.webp",
            "label": "Dreadful Fear",
            "transfer": false,
            "flags": {
                "dae": {
                    "stackable": "none",
                    "durationExpression": "",
                    "macroRepeat": "none",
                    "specialDuration": ["turnEndSource"],
                    "transfer": false
                }
            },
            "tint": null,
            "selectedKey": [
                "flags.midi-qol.disadvantage.attack.all", "flags.midi-qol.disadvantage.ability.check.all"
            ],
            "disabled": false,
            "duration": {
                "startTime": null
            }
        }
    ],
    "flags": {
        "midi-qol": {
            "effectActivation": false
        }
    }
};
// console.log("dreadFearItem", dreadFearItem);

if (args[0] === "on") {
    let featItem = await tactor.createEmbeddedDocuments("Item", [dreadFearItem]);
    ui.notifications.notify("Dreadful Fear ability created in your character sheet.");

}

if (args[0] === "off") {
    let itemID = tactor.data.items.filter(i => i.data.name === `Dreadful Fear`)[0].data._id
    await tactor.deleteEmbeddedDocuments("Item", [itemID]);
    ui.notifications.notify("Dreadful Fear ability removed from your character sheet.");
}
