//DAE Macro Execute, Effect Value = "Macro Name" @target 

/**
 * For each target, the GM will have to choose 
 */

const lastArg = args.at(-1);
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);

let target = canvas.tokens.get(lastArg.tokenId);
let originalSize = target.document.width;
let mwak = target.actor.system.bonuses.mwak.damage;

if (args[0] === "on") {
  new Dialog({
    title: "Enlarge or Reduce",
    buttons: {
      one: {
        label: "Enlarge",
        callback: async () => {
          let bonus = mwak + "+ 1d4";
          let enlarge = (originalSize + 1);
          await tactor.update({ "system.bonuses.mwak.damage": bonus });
          await target.document.update({ "width": enlarge, "height": enlarge });
          await DAE.setFlag(tactor, 'enlageReduceSpell', {
            size: originalSize,
            ogMwak: mwak,
          });
          ChatMessage.create({ content: `${target.name} is enlarged` });
        }
      },
      two: {
        label: "Reduce",
        callback: async () => {
          let bonus = mwak + " -1d4";
          let size = originalSize;
          let newSize = (size > 1) ? (size - 1) : (size - 0.3);
          await tactor.update({ "system.bonuses.mwak.damage": bonus });
          await target.document.update({ "width": newSize, "height": newSize });
          await DAE.setFlag(tactor, 'enlageReduceSpell', {
            size: originalSize,
            ogMwak: mwak,
          });
          ChatMessage.create({ content: `${target.name} is reduced` });
        }
      },
    }
  }).render(true);
}
if (args[0] === "off") {
  let flag = DAE.getFlag(tactor, 'enlageReduceSpell');
  await tactor.update({ "system.bonuses.mwak.damage": flag.ogMwak });
  await target.document.update({ "width": flag.size, "height": flag.size });
  await DAE.unsetFlag(tactor, 'enlageReduceSpell');
  ChatMessage.create({ content: `${target.name} is returned to normal size` });
}