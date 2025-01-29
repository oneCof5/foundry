/*  World script on stealth checks
Grabs selected tokens and rolls a stealth check against all other tokens passive perception on the map. Then returns the results.
*/
Hooks.on("dnd5e.rollSkill", (srcActor, d20Roll, skillId) => {
  if (skillId === "ste") {
    const uniqueActor = {};
    const caughtBy = canvas.tokens.placeables
      .filter(token => !!token.actor) // no actor with token
      .filter(({ actor }) => actor.system.attributes.hp.value > 0) // not dead
      .filter(({ actor }) => { if (uniqueActor[actor.name]) { return false; } uniqueActor[actor.name] = true; return true; }) // all goblins have same
      .filter(({ actor }) => { return srcActor.id !== actor.id; }) // not themselves
      .filter(({ actor }) => actor.system.skills.prc.passive >= d20Roll.total); // passive equal or higher
    let messageContent = `<h4>Is ${srcActor.name} hidden with a ${d20Roll.total}?</h4>`;
    if (caughtBy.length > 0) {
      messageContent += `<h5>Failed vs: </h5>`;
      messageContent += `<table><thead><tr style="text-align:center"><th colspan=2>ACTOR</th><th>PRC</th></tr></thead>`;
      messageContent += `<tbody>`;
      caughtBy.map((token) => {
        messageContent += `<tr height="32"><td><img src="${token.document.texture.src}" height="30" width="30" style="border:none"></img></td><td style="padding-left: 6px"><strong>${token.name}</strong></td><td>${token.actor.system.skills.prc.passive}</td></tr>`;
      });
      messageContent += '</tbody></table>';
    } else {
      messageContent += `<h5>Successfully hidden!</h5>`;
    }

    // notify the GM
    ChatMessage.create({
      content: messageContent,
      flavor: "Hiding Check",
      speaker: { actor: null, scene: null, token: null, alias: '' },
      whisper: ChatMessage.getWhisperRecipients("GM")
    });
  }
})