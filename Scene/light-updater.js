async function updateLights(data) {
    const update = canvas.tokens.controlled.map(t  => mergeObject({_id: t.id}, data));
    await canvas.scene.updateEmbeddedDocuments("Token", update);
}

const dialogEditor = new Dialog({
    title: "Light Updater",
    content: "Pick an option",
    buttons: {
        torch: {
            label: "torch",
            callback: () => {
                updateLights({
                    brightLight: 20,
                    dimLight: 40,
                    lightAlpha: 0.25,
                    lightColor: "#AA7700", //#f69a54
                    lightAnimation: {
                        type: "torch",
                        intensity: 2,
                        speed: 2
                    }
                });
                dialogEditor.render(true);
            }
        },
        other: {
            label: "sunburst",
            callback: () => {
                updateLights({
                    brightLight: 20,
                    dimLight: 40,
                    lightAlpha: 0.25,
                    lightColor: "#AA7700",
                    lightAnimation: {
                        type: "sunburst",
                        intensity: 2,
                        speed: 2
                    }
                });
                dialogEditor.render(true);
            }
        }
    }
}).render(true);
