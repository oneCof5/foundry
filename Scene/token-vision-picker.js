let presets = {
    darkvision: {
        vision: true,
        dimSight: 60,
        brightSight: 0,
        dimLight: 0,
        brightLight:  0,
        lightAngle: 360,
        lockRotation: false,
        lightColor: "",
        lightAlpha: 0.2,
    },
    light_cantrip: {
              vision: true,
              dimSight: 1,
              brightSight: 0,
              dimLight: 40,
              brightLight:  20,
              lightAngle: 360,
              lockRotation: false,
              lightAnimation: {type: "torch", intensity: 1, speed: 1},
              lightColor: "#bbbbff",
              lightAlpha: 0.2,
    },
    torch: {
              vision: true,
              dimSight: 1,
              brightSight: 0,
              dimLight: 20,
              brightLight:  10,
              lightAngle: 360,
              lockRotation: false,
              lightAnimation: {type: "torch", intensity: 5, speed: 5},
              lightColor: "#ffbb33",
              lightAlpha: 0.2,
    },
    normal_vision: {
              vision: true,
              dimSight: 5,
              brightSight: 0,
              dimLight: 0,
              brightLight:  0,
              lightAngle: 360,
              lockRotation: false,
              lightColor: "",
              lightAlpha: 0.2,
    },
    no_vision: {
              vision: false,
    }
};

let vision_buttons = [];
for (let key in presets) {
    vision_buttons.push({
        label: key.replaceAll('_',' '),
        callback: async function() {
            updateTokens(presets[key]);
            }
    });
}

new Dialog({
  title: `Select a vision option`,
  content: ``,
  buttons: vision_buttons,
  //default: "yes",
  close: html => {
    }
}).render(true);

async function updateTokens(preset){
    const updates = canvas.tokens.controlled.map(t => mergeObject({_id: t.id}, preset));
    await canvas.scene.updateEmbeddedDocuments("Token", updates);
}
