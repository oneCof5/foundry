// Define constants
const lastArg = args.at(-1);
const casterToken = canvas.tokens.get(lastArg.tokenId);
const casterActor = await fromUuid(lastArg.actorUuid);

/* DAE ON */
if (args[0] === "on") {
  // determine the radius of the sphere
  let dist = 30;

  // draw the template
  let templateData = {
    "t": "circle",
    "user": game.user.id,
    "distance": dist,
    "direction": 0,
    "x": casterToken.center.x,
    "y": casterToken.center.y,
    // "fillColor": "#ffcc66",
    "angle": 0,
    "width": null,
    // "borderColor": "#ffcc66",
    "texture": "https://assets.forge-vtt.com/61c6079e99b8eb56f3ca7ede/artwork/BLANK_ICON.png",
    "hidden": true
  };

  const templateDocs = await canvas.scene.createEmbeddedDocuments(`MeasuredTemplate`, [templateData]);
  await tokenAttacher.attachElementsToToken(templateDocs, casterToken, false);
  const templateDoc = templateDocs[0];

  // apply the lighting FX
  const updateFX = {
    "_id": casterToken.id,
    "light": {
      "angle": 360,
      "alpha": 0.1,
      "animation": { "type": "dome", "speed": 3, "intensity": 5, "reverse": false },
      "bright": dist,
      "color": "#ffcc66",
      "darkness": { "min": 0.2, "max": 1 },
      "dim": 2 * dist
    }
  };
  await canvas.scene.updateEmbeddedDocuments("Token", [updateFX]);

  // set template macro flags
  await templateDoc.setFlag("templatemacro", "whenEntered", { "asGM": false, "command": `let actorDoc = token.actor;\nconst effects = actorDoc.effects.filter(e => ["sunlight sensitivity", "sunlight hypersensitivity"].includes(e.label.toLowerCase()));\nconst updates = effects.map(e => ({ "_id": e.id, "disabled": false }))\nawait actorDoc.updateEmbeddedDocuments("ActiveEffect", updates);\n` });
  await templateDoc.setFlag("templatemacro", "whenLeft", { "asGM": false, "command": `let actorDoc = token.actor;\nconst effects = actorDoc.effects.filter(e => ["sunlight sensitivity", "sunlight hypersensitivity"].includes(e.label.toLowerCase()));\nconst updates = effects.map(e => ({ "_id": e.id, "disabled": true }))\nawait actorDoc.updateEmbeddedDocuments("ActiveEffect", updates);\n` });
  await templateDoc.setFlag("templatemacro", "whenMoved", { "asGM": false, "command": `let sensitives = canvas.tokens.placeables.map((t) => {\n\teffects = t.actor.effects.filter(e => ["sunlight sensitivity", "sunlight hypersensitivity"].includes(e.label.toLowerCase()));\n\tif (effects.length > 0) {\n\t\treturn { "token": t, "effect": effects[0] };\n\t}\n});\nsensitives = await sensitives.filter(o => o);\nlet containers = new Set();\nfor (let sensitive of sensitives) {\n\tlet sensitiveCount = 0;\n\tconst isContained = await game.modules.get("templatemacro").api.findContainers(sensitive.token.document);\n\tif (isContained.length > 0) {\n\t\tfor (let templateId of isContained) {\n\t\t\tlet templateDoc = canvas.templates.placeables.find(p => p.id == templateId).document;\n\t\t\tif (templateDoc.flags.templatemacro.sourceEffectName.name === "sunlight") {\n\t\t\t\tsensitiveCount++;\n\t\t\t}\n}\n\t\tif ((sensitiveCount > 0) && (sensitive.effect.disabled)) {\n\t\t\tawait sensitive.token.document.actor.updateEmbeddedDocuments("ActiveEffect", [{ "_id": sensitive.effect.id, "disabled": false }]);\n\t\t}\n\t} else {\n\t\tif (!sensitive.effect.disabled) {\n\t\t\tawait sensitive.token.document.actor.updateEmbeddedDocuments("ActiveEffect", [{ "_id": sensitive.effect.id, "disabled": true }]);\n\t\t}\n\t}\n}\n` });
  await templateDoc.setFlag("templatemacro", "sourceEffectName", { "name": `sunlight` });

  // set a flag allowing us remove this template later
  await DAE.setFlag(casterActor, "daeSunlight", { "templateId": templateDoc.id });

  // activate sunlight sensitivity for affected tokens
  await toggleSensitivity(templateDoc, false);
}

/* DAE OFF */
if (args[0] === "off") {
  // get the templateId from the actor and grab the template doc
  const flag = await DAE.getFlag(casterActor, "daeSunlight");
  const templateDoc = game.scenes.viewed.templates.find(t => t.id === flag.templateId);

  // deactivate sunlight sensitivity for affected tokens
  await toggleSensitivity(templateDoc, true);

  // delete the template
  await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [flag.templateId]);

  // clean up flag
  DAE.unsetFlag(casterActor, "daeSunlight");
}

/* HELPER FUNCTIONS */
async function toggleSensitivity(templateDoc, bolDisabled) {
  const tokens = canvas.tokens.placeables;
  for (let token of tokens) {
    const effects = token.actor.effects.filter(e => ["sunlight sensitivity", "sunlight hypersensitivity"].includes(e.label.toLowerCase()));
    // stop if this token doesnt require an update
    if (!effects || effects.disabled === bolDisabled) break;
    const templates = game.modules.get("templatemacro").api.findContainers(token.document);
    for (template of templates) {
      if (template === templateDoc.id) {
        const updates = effects.map(e => ({ "_id": e.id, "disabled": bolDisabled }))
        await token.actor.updateEmbeddedDocuments("ActiveEffect", updates);
      }
    }
  }
}