// filter the canvas for NPCs that aren't dead
const theTs = canvas.tokens.placeables
  .filter((tok) => tok.actor.system.attributes.hp.value > 0 && !tok.document?.hasPlayerOwner);

// get unique actors (all goblins have the same perception)
let uniqueTs = [...new Map(theTs.map((m) => [m.actor.id, m])).values()];

// Sort the output array by type and passive.
uniqueTs.sort(function (a,b) {
  return b.actor.system.skills.prc.passive - a.actor.system.skills.prc.passive
});

// Build chat message content.
let msgContent = `<div><table><thead><tr><th colspan=2>Token</th><th>Passive Perception</th></tr></thead><tbody>`;
for (let uniqueT of uniqueTs) {
  msgContent += `<tr height="32"><td><img src="${uniqueT.document.texture.src}" width=30 height=30 style="border: none;"/></td><td style="padding-left" 6px"><strong>${uniqueT.document.name}</strong></td><td>${uniqueT.actor.system.skills.prc.passive}</td></tr>`;
}
msgContent += `</tbody></table></div>`;

// create the message
ChatMessage.create({
  'content': msgContent,
  'whisper': ChatMessage.getWhisperRecipients('GM')
});