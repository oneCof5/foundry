this.registerFlowStep("animateDead", true, async (activation) => {
  const caster = game.actors.get(this.item.parent._id);
  console.log("ANIMATE DEAD ------ caster: ", caster);
  const casterToken = canvas.tokens.get(caster.getActiveTokens()[0].id);
  const undeadThralls = caster.items.filter(i => i.name === "Undead Thralls").length;
  const upcastNumber = (activation.config.spellLevel - 3) * 2; // upcast is plus 2 per higher spell level
  const number = 1 + undeadThralls + upcastNumber;
  const casterProf = caster.system.attributes.prof;
  const sorcererLevel = caster.classes.sorcerer.system.levels;
  const clericLevel = caster.classes.cleric.system.levels;
  const dmgBonus = undeadThralls === 1 ? casterProf : 0;

  const buttonData = {
    buttons: [{
      label: "Skeleton",
      value: {
        actor: {
          "name": "Skeleton",
          "system.attributes.hp": {
            "value": sorcererLevel + 11,
            "max": sorcererLevel + 11,
            "formula": `2d8 + 4 + ${sorcererLevel}`
          }
        },
        embedded: {
          Item: {
            "Shortsword": {
              "system.damage.parts": [[`1d6+@mod+${dmgBonus}`, 'piercing']]
            },
            "Shortbow": {
              "system.damage.parts": [[`1d6+@mod+${dmgBonus}`, 'piercing']]
            }
           }
        }
      }
    }, {
      label: "Zombie",
      value: {
        actor: {
          name: "Zombie",
          "system.attributes.hp": {
            value: sorcererLevel + 33,
            max: sorcererLevel + 33,
            formula: `3d8 + 9 + ${sorcererLevel}`
          }
        },
        embedded: {
          Item: {
            "Slam": {
              "system.damage.parts": [[`1d6+@mod+${dmgBonus}`, 'bludgeoning']]
            }  
          }
        }
      }
    }]
  };

  // Loop over number of summoned minions
  for (let n = 1; n < number + 1; n++) {
    buttonData.title = `Choose the type of undead to animate.</br>Raising ${n + 1} of ${number} servant(s).`;
    const choice = await warpgate.buttonDialog(buttonData);
    if (choice === true) return {}; // break if no choice
    const undeadActor = game.actors.getName(choice.actor.name);

    // Crosshairs
    let crosshairsDistance = 0;
    const distanceAvailable = this.item.system.range.value;  // use the range on the source item
    const checkDistance = async (crosshairs) => {
      while (crosshairs.inFlight) {
        await warpgate.wait(100); //wait for initial render
        const ray = new Ray(casterToken.center, crosshairs);
        const distance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0];

        //only update if the distance has changed
        if (crosshairsDistance !== distance) {
          crosshairsDistance = distance;
          if (distance > distanceAvailable) {
            crosshairs.icon = 'icons/skills/social/wave-halt-stop.webp';
          } else {
            crosshairs.icon = undeadActor.prototypeToken.texture.src;
          }
          crosshairs.draw();
          crosshairs.label = `${distance} ft`;
        }
      }
    }

    const curLocation = await warpgate.crosshairs.show(
      {
        size: undeadActor.prototypeToken.width, // the spawned token's size
        interval: undeadActor.prototypeToken.width % 2 === 0 ? 1 : -1, // swap between targeting the grid square vs intersection based on token's size
        label: '0 ft.',
      },
      { show: checkDistance }
    );

    // Cancel if location cancelled
    if (curLocation.cancelled || crosshairsDistance > distanceAvailable) { return; }
    const location = { 'x': curLocation.x, 'y': curLocation.y };


    // define callbacks for rolled hp
    const callbacks = {
      post: async (location, spawnedTokenD) => {
        if (undeadThralls) {
          let spawnActor = game.actors.get(spawnedTokenD.actorId);
          const hpRoll = new Roll(`${spawnActor.system?.attributes.hp?.formula}`).evaluate({ async: false });
          const updatedHp = { 'system.attributes.hp': { 'min': `${hpRoll.total}`, 'max': `${hpRoll.total}`, 'value': `${hpRoll.total}` } };
          await spawnActor.update(updatedHp);
        }
      }
    };

    // combine general and specific updates
    let updates = {
      token: { "disposition": 1 },
      embedded: {
        Item: {
          "Twilight Sanctuary Temp HP": {
            "type": "feat",
            "img": "icons/magic/unholy/orb-glowing-purple.webp",
            "system": {
              "activation.type": "special",
              "target.type": "self",
              "actionType": "other",
              "damage.parts": [[`1d6[temphp]+${clericLevel}`,"temphp"]]          
            }          
          }
        }
      }
    };
    updates = mergeObject(updates, choice);

    // define options
    const options = { controllingActor: caster };

    // Summon the token
    await warpgate.spawnAt(location, choice.actor.name, updates, callbacks, options);
  }
});

return this.applyDefaultTargetsAsEffective(
  this.performCustomStep("animateDead"),
  this.attackCompleted()
);

function waitFor3DDiceMessage(targetMessageId) {
  function buildHook(resolve) {
    Hooks.once('diceSoNiceRollComplete', (messageId) => {
      if (targetMessageId === messageId)
        resolve(true);
      else
        buildHook(resolve)
    });
  }
  return new Promise((resolve, reject) => {
    if (game.dice3d) {
      buildHook(resolve);
    } else {
      resolve(true);
    }
  });
}