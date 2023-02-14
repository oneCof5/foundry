let thePassive = 'Perception';
let messageContent;

messageContent = `  <div class="monks-tokenbar savingthrow chat-card">`;
messageContent += `    <header class="card-header flexrow"><h3 class="item-name">Passive ${thePassive}</header>`;
messageContent += `    <div class="message-content" style="margin:5px 0px">`;
messageContent += `      <div class="form-group sheet actor">`;
messageContent += `        <ol class="items-list inventory-list">`;
messageContent += `          <li class="items-header flexrow"><h3 class="item-name flexrow">Actors</h3></li>`;
messageContent += `          <ol class="itemlist">`;

//  <img src="icons/svg/eye.svg" title="Passive ${thePassive}" width="36" height="36">

// Gather tokens in the current scene into an array.
let theTs = canvas.tokens.placeables
  .filter((token) => token.data && token.actor)
  .filter((token) => token.actor.data.data.attributes.hp.value > 0);

// Filter out duplicate actors (i.e. all goblins have the same passive perception)
let uniqueTs = [...new Map(theTs.map((m) => [m.actor.id, m])).values()];

// Sort the output array by type and passive.
uniqueTs.sort(function (a,b) {
  return b.actor.data.data.skills.prc.passive - a.actor.data.data.skills.prc.passive
});

// Build chat message content.
for (let uniqueT of uniqueTs) {
  messageContent += `<li class="item flexrow " data-item-id="${uniqueT.id}" style=""><div class="dice-roll flexcol"><div class="item-row flexrow"><div class="item-name flexrow"><div class="item-image" style="background-image:url('${uniqueT.data.img}')"></div><h4 class="noselect">${uniqueT.data.name}</h4></div><div class="roll-controls flexrow"><div class="dice-total flexrow noselect"><div class="dice-result noselect reveal"><span class="total">${uniqueT.actor.data.data.skills.prc.passive}</span></div></div></div></div></li>`;
}

// close out the ol and divs
messageContent += `</ol></ol></div></div></div>`;

console.log(messageContent);

// create the message
const chatData = {
  user: game.user._id,
  speaker: game.user,
  content: messageContent,
  whisper: game.users.filter((u) => u.isGM).map((u) => u._id),
};
ChatMessage.create(chatData, {});