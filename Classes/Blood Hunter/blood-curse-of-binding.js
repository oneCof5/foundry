console.log(args); // Use this in the future to explore what is already passed on from the item when calling upon a macro with it! Super helpful!
const lastArg = args[args.length - 1];
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);
let target  = Array.from(game.user.targets)[0].actor;

const level = tactor.data.type === "npc" ? tactor.data.data.details.cr : tactor.classes["blood-hunter"].data.data.levels;
let hemoDie = (4 + (2 * (Math.floor((level + 1) / 6))));
let damageRoll = new Roll(`1d${hemoDie}`).roll();
let HP = tactor.data.data.attributes.hp.value;
let gameRound = game.combat ? game.combat.round : 0;

const DC = args[0].item.data.save.dc; // extracting it from the item allows you to have items affect your caster's spell dc and shit without needing to change all your macros

if (args[0].failedSaves.length == 0) {
  await ChatMessage.create({content: `${target.name} exerts control and shakes off the binding attempt`});
return; }

if (args[0].failedSaves.length == 1) {

new Dialog({
  title: "Do you wish to amplify your curse?",
  buttons:{
    one: {
        label: "Yes",
        callback: () => activate()
    },
    two: {
      label: "No",
      callback: () => noactivate()
  }
  }
}).render(true);

function activate () {let apply = async function() {
  let the_message = "";
  {
    const effectData = {
      label: "Blood Curse of Binding",
      icon: "icons/tools/fasteners/chain-steel-blue.webp",
      changes: [{
        "key": "data.attributes.movement.walk",
        "value": "0",
        "mode": 5 ,
        "priority": 20
       },
       {
        "key": "data.attributes.movement.climb",
        "value": "0",
        "mode": 5 ,
        "priority": 20
       },
       {
        "key": "data.attributes.movement.swim",
        "value": "0",
        "mode": 5 ,
        "priority": 20
       },
       {
        "key": "data.attributes.movement.fly",
        "value": "0",
        "mode": 5 ,
        "priority": 20
       },
       {
        "key": "flags.midi-qol.OverTime",
        "value": `turn=end, saveAbility=str, saveDC=${DC}, label=Blood Curse of Binding `,
        "mode": 0 ,
        "priority": 19
       }],
        disabled: false,
        duration: {rounds: 10, startRound: gameRound, startTime: game.time.worldTime },
            flags: {
            dae: {
                macroRepeat: ["endEveryTurn"],
                specialDuration: ["isSaveSuccess.str"]
            }
        },

      }
      await target.createEmbeddedEntity("ActiveEffect", effectData);
    }
   await ChatMessage.create({content: `${tactor.name} has amplified the curse, they injure themselves for <b>${damageRoll.total}</b> points of damage.`});
   await tactor.update({"data.attributes.hp.value" : HP - damageRoll.total });
};
apply();
}

function noactivate (){let noapply = async function() {
  {
    const effectData = {
      changes: [{
        "key": "macro.CUB",
        "value": "Blood Curse of Binding",
        "mode": 0 ,
        "priority": 20
       },],
            }
      await target.createEmbeddedEntity("ActiveEffect", effectData);
    }
};
noapply();
}
  }
