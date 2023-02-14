// DAE itemMacro with spawned tokenId as argument
if (typeof args !== 'undefined') {
  if (args[0] == "off") {
    warpgate.dismiss(args[1]); // kill the token
    return;
  }
}

// WIRE itemMacro
if (typeof this !== 'undefined') {
  this.registerFlowStep("summonCelestial", true, async (activation) => {
    let caster = game.actors.get(this.item.parent._id);
    const casterToken = caster.getActiveTokens(false, true)[0];
    const spellSlot = activation.config.spellLevel; // base 5, above scales
    const upcastHealth = (spellSlot - 5) * 10; // plus 10 health for each level above 5th
    const multiattack = Math.floor(spellSlot / 2); // half the spell level rounded down
    const casterMsakBonus = Number(caster.system.bonuses.msak.attack.split("+").filter(Number).reduce(function (total, num) { return parseFloat(total) + parseFloat(num) }));
    const casterAttack = Number(caster.system.abilities[caster.system.attributes.spellcasting].mod) + casterMsakBonus;
    let theCr = 9; // minimal CR cast by a level 9 character with a 5th level slot
    if (caster.system.attributes.prof > 4 ) {
      theCr = (caster.system.attributes.prof < 6) ? 13 : 17;
    }

    const buttonData = {
      title: "Choose the type of celestial spirit to summon.",
      buttons: [
        {
          label: "Avenger",
          value: {
            token: {
              name: "Bruiser the Avenger"
            },
            actor: {
              "name": "Celestial Spirit",
              "system.attributes.ac": {
                "armor": 11 + spellSlot,
                "flat": 11 + spellSlot,
                "calc": "flat"
              }
            },
            embedded: {
              Item: {
                "Radiant Bow": {
                  "type": "feat",
                  "img": "icons/weapons/bows/shortbow-recurve-yellow-blue.webp",
                  "system": {
                    "description.value": `<p><em>Ranged Weapon Attack</em>: your spell attack modifier to hit [[${casterAttack}]], range 150/600 ft., one target. <em>Hit</em>: 2d6 + 2 + ${spellSlot} [the spell’s level] radiant damage.</p>`,
                    "source": "TCoE, pg. 110",
                    "activation.type": "action",
                    "target": {
                      "value": null,
                      "width": null,
                      "units": "",
                      "type": "creature"
                    },
                    "range": {
                      "value": 150,
                      "long": 600,
                      "units": "ft"
                    },
                    "actionType": "rwak",
                    "attackBonus": `${casterAttack}`,
                    "damage.parts": [[`2d6[radiant]+@mod+${spellSlot}`, "radiant"]],
                    "type.value": "monster"
                  }
                }
              }
            }
          }
        },
        {
          label: "Defender",
          value: {
            token: {
              name: "Bruiser the Defender"
            },
            actor: {
              "name": "Celestial Spirit",
              "system.attributes.ac": {
                "armor": 11 + spellSlot + 2,
                "flat": 11 + spellSlot + 2,
                "calc": "flat"
              }
            },
            embedded: {
              Item: {
                "Radiant Mace": {
                  "type": "feat",
                  "img": "icons/weapons/maces/shortmace-ornate-gold.webp",
                  "system": {
                    "description.value": `<p><em>Melee Weapon Attack</em>: your spell attack modifier to hit [[${casterAttack}]], range 150/600 ft., one target. <em>Hit</em>: 1d10 + 3 + ${spellSlot} [the spell’s level] radiant damage, and the celestial can choose itself or another creature it can see within 10 feet of the target. The chosen creature gains 1d10 temporary hit points.</p>`,
                    "source": "TCoE, pg. 110",
                    "activation.type": "action",
                    "target": {
                      "value": null,
                      "width": null,
                      "units": "",
                      "type": "creature"
                    },
                    "range": {
                      "value": 5,
                      "long": null,
                      "units": "ft"
                    },
                    "actionType": "mwak",
                    "attackBonus": `${casterAttack}`,
                    "damage.parts": [[`2d6[radiant]+@mod+${spellSlot}`, "radiant"]],
                    "type.value": "monster"
                  }
                },
                "Radiant Mace (Healing)": {
                  "type": "feat",
                  "img": "icons/weapons/maces/shortmace-ornate-gold.webp",
                  "system": {
                    "description.value": `<p>On a successful hit, the celestial can choose itself or another creature it can see within 10 feet of the target. The chosen creature gains 1d10 temporary hit points.</p>`,
                    "activation.type": "special",
                    "target.type": "creature",
                    "range": {
                      "value": 10,
                      "long": null,
                      "units": "ft"
                    },
                    "actionType": "heal",
                    "damage.parts": [["1d10[temphp]", "temphp"]],
                    "type.value": "monster"
                  }

                }
              }
            }
          }
        }
      ]
    };

    const choice = await warpgate.buttonDialog(buttonData);
    if (choice === true) return {}; // break if no choice
    const theCelestial = game.actors.getName(choice.actor.name);

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
            crosshairs.icon = theCelestial.prototypeToken.texture.src;
          }
          crosshairs.draw();
          crosshairs.label = `${distance} ft`;
        }
      }
    };

    const curLocation = await warpgate.crosshairs.show(
      {
        size: theCelestial.prototypeToken.width, // the spawned token's size
        interval: theCelestial.prototypeToken.width % 2 === 0 ? 1 : -1, // swap between targeting the grid square vs intersection based on token's size
        label: '0 ft.',
      },
      { show: checkDistance }
    );

    // Cancel if location cancelled
    if (curLocation.cancelled || crosshairsDistance > distanceAvailable) { return }
    const location = { 'x': curLocation.x, 'y': curLocation.y };

    // combine general and specific updates
    let updates = {
      token: { "disposition": 1 },
      actor: {
        "system": {
          "attributes": {
            "hp": {
              "value": 40 + upcastHealth,
              "max": 40 + upcastHealth,
              "formula": `40 + ${upcastHealth}`
            }
          },
          "details.cr": theCr
        }
      },
      embedded: {
        Item: {
          "Multiattack": {
            "type": "feat",
            "img": "icons/skills/melee/strike-weapons-orange.webp",
            "system.description.value": `<p>The celestial makes a number of attacks equal to half this spell's level (rounded down) [[${multiattack}]].</p>`
          },
          "Healing Touch": {
            "type": "feat",
            "img": "icons/magic/holy/saint-glass-portrait-halo.webp",
            "system": {
              "description.value": `<p>The celestial touches another creature. The target magically regains hit points equal to 2d8 + the spell’s level [[${spellSlot}]].</p>`,
              "activation.type": "action",
              "target.type": "creature",
              "range.units": "touch",
              "uses": {
                "value": 1,
                "max": "1",
                "per": "day"
              },
              "actionType": "heal",
              "damage.parts": [[`2d8[healing]+${spellSlot}`, "healing"]]
            }
          }
        }
      }
    };
    updates = mergeObject(updates, choice);

    // define options
    const options = { controllingActor: caster };

    // Summon the token
    const celestialTokenId = (await warpgate.spawnAt(location, choice.actor.name, updates, {}, options))[0];
    console.log("#### Warpgate spawned tokenid is ", celestialTokenId);

    // Update the DAE flag with the spawned token so it can be dismissed later
    let celestialEffect = caster.effects.find(e => e.label === "Summon Celestial");
    console.log("#### celestialEffect: ", celestialEffect);
    celestialEffect.update({
      "changes": [{
        "key": "macro.itemMacro",
        "value": `${celestialTokenId}`,
        "mode": 0,
        "priority": 10
      }]
    })

  });

  return this.sequence(
    this.hasDuration(
      this.hasConcentration(
        this.applyConcentration()
      )
    ),
    this.applyDefaultTargetsAsEffective(
      this.sequence(
        this.applyEffects(),
        this.performCustomStep("summonCelestial")
      )
    )
  )
}