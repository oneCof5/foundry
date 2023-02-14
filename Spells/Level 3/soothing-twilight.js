async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
// console.log("lastArg",lastArg);
const actorD = game.actors.get(lastArg.actor._id);
// console.log("actorD",actorD);
const tokenD = canvas.tokens.get(lastArg.tokenId);
// console.log("tokenD",tokenD);
const {levels} = actorD.getRollData().classes.cleric;
// console.log("{levels}",{levels});
const clericLvl = {levels}.levels
// console.log("clericLvl",clericLvl);

if (args[0].tag === "on") {
  AAhelpers.applyTemplate(args)
  let itemData = [{
    "name": "Soothing Twilight",
    "type": "feat",
    "img": "icons/magic/unholy/orb-glowing-purple.webp",
    "data": {
      "description": {
        "value": "<section class=\"secret\">\n<p>At 2nd level, you can use your Channel Divinity to refresh your allies with soothing twilight.</p>\n<p>As an action, you present your holy symbol, and a sphere of twilight emanates from you. The sphere is centered on you, has a 30-foot radius, and is filled with dim light. The sphere moves with you, and it lasts for 1 minute or until you are incapacitated or die.</p>\n<p>Whenever a creature (including you) ends its turn in the sphere of twilight, you can grant that creature one of these benefits:</p>\n<ul>\n<li>You grant it temporary hit points equal to 1d6 plus your cleric level.</li>\n</ul>\n<ul>\n<li>You end one effect on it causing it to be charmed or frightened.</li>\n</ul>\n</section>",
        "chat": "",
        "unidentified": ""
      },
      "activation": {
        "type": "special",
        "cost": null,
        "condition": ""
      },
      "range": {
        "value": null,
        "long": null,
        "units": "self"
      }
    },
    "effects": [
        {
          "changes": [
            {
              "key": "flags.midi-qol.OverTime",
              "mode": 5,
              "value": `turn=end,damageRoll=1d6+${clericLvl},damageType=temphp,label=Soothing Twilight`,
              "priority": "20"
            }
          ],
          "disabled": false,
          "duration": {
            "startTime": null
          },
          "icon": "icons/magic/unholy/orb-glowing-purple.webp",
          "label": "Soothing Twilight",
          "transfer": false,
          "flags": {
            "core": {
              "statusId": ""
            },
            "dae": {
              "stackable": "none",
              "durationExpression": "",
              "macroRepeat": "none",
              "specialDuration": [],
              "transfer": false
            },
            "ActiveAuras": {
              "isAura": true,
              "aura": "Allies",
              "radius": 15,
              "alignment": "",
              "type": "",
              "ignoreSelf": false,
              "height": true,
              "hidden": false,
              "displayTemp": true,
              "hostile": false,
              "onlyOnce": false
            }
          },
          "tint": null,
          "selectedKey": "flags.midi-qol.OverTime"
        }
      ],
  }];
  let item = tokenD.actor.items.find(i => i.name === "Soothing Twilight");
  if (item) {
    await tokenD.actor.deleteEmbeddedDocuments("Item", [item.id]);
    await tokenD.actor.createEmbeddedDocuments("Item", itemData);
  } else {
    await tokenD.actor.createEmbeddedDocuments("Item", itemData);
  }
}