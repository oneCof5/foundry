// DAE Macro.execute aid @spellLevel @data.attributes.hp.max
const lastArg = args[args.length - 1];
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);
const target = canvas.tokens.get(lastArg.tokenId);

let buf = (parseInt(args[1])-1) * 5;
let curHP = tactor.data.data.attributes.hp.value;
let curMax = tactor.data.data.attributes.hp.max;

if (args[0] === "on") {
    tactor.update({"data.attributes.hp.value": curHP+buf});
} else {
  if (curHP > (curMax)) {
     tactor.update({"data.attributes.hp.value": curMax});
  }
}
