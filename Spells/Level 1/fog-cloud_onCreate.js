// Apply Perfect Vision and FX to the template
const updates = {
  "borderColor": "#9e9e9e",
  "fillColor": "#9e9e9e",
  "texture": "modules/jb2a_patreon/Library/1st_Level/Fog_Cloud/FogCloud_01_White_800x800.webm",
  "hidden": false,
  "flags": {
    "perfect-vision": {
      "visionLimitation": {
        "enabled": true,
        "sight": 0,
        "detection": { "feelTremor": null, "seeAll": null, "seeInvisibility": null, "senseAll": null, "senseInvisibility": null }
      }
    }
  }
};
await template.update(updates);

// Apply Blinded to affected tokens
const containedTokens = await game.modules.get("templatemacro").api.findContained(template);
const uuids = containedTokens.map(tokenId => canvas.tokens.get(tokenId).actor.uuid);

for (let uuid of uuids) {
  const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Blinded', uuid);
  if (!hasEffectApplied) {
    game.dfreds.effectInterface.addEffect({ effectName: 'Blinded', uuid });
  }
}
