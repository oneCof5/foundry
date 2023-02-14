// https://discord.com/channels/170995199584108546/699750150674972743/1007373249526628474
function waitFor3DDiceMessage(targetMessageId) {
  function buildHook(resolve) {
    Hooks.once('diceSoNiceRollComplete', (messageId) => {
      if (targetMessageId === messageId)
        resolve(true);
      else
        buildHook(resolve)
    });
  }
  return new Promise((resolve,reject) => {
    if(game.dice3d){
      buildHook(resolve);
    } else {
      resolve(true);
    }
  });
}

let msg = await new Roll("1d6").toMessage();
waitFor3DDiceMessage(msg.id);