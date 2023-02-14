if (!game.modules.get("dfreds-convenient-effects")?.active) { ui.notifications.error("Please enable the CE module"); return; }
const { actor, token, lArgs } = MidiMacros.targets(args)
// console.log("token: ",token);

if (args[0] === "on") {
    new Dialog({
        title: "Choose an Effect",
        buttons: {
            one: {
                label: "Blindness",
                callback: async () => {
                    await DAE.setFlag(actor, "DAEBlind", {
                        "condition": "blind",
                        "tokenId": token.id,
                        "dimSight": token.data.dimSight,
                        "brightSight": token.data.brightSight
                    })
                    console.log("updated actor flags:", actor.data.flags.dae);
                    await MidiMacros.addDfred("Blinded", actor)
                    let updates = [{
                        _id: token.id,
                        dimSight: 0,
                        brightSight: 0
                    }];
                    console.log("updates: ", updates);
                    await canvas.scene.updateEmbeddedDocuments("Token", updates);
                }
            },
            two: {
                label: "Deafness",
                callback: async () => {
                    await DAE.setFlag(actor, "DAEBlind", {"condition": "deaf"})
                    console.log(actor.f.flag.DAEblind)
                    await MidiMacros.addDfred("Deafened", actor)
                }
            }
        },
    }).render(true);
}
if (args[0] === "off") {
    let flag = DAE.getFlag(actor, "DAEBlind")
    if (flag.condition === "blind") {
        await MidiMacros.removeDfred("Blinded", actor)
        let updates = [{
            "_id": flag.tokenId,
            "dimSight": flag.dimSight,
            "brightSight": flag.brightSight
        }];
        await canvas.scene.updateEmbeddedDocuments("Token", updates);
    } else if (flag.condition === "deaf") {
        await MidiMacros.removeDfred("Deafened", actor)
    }
    await DAE.unsetFlag(actor, "DAEBlind")
}