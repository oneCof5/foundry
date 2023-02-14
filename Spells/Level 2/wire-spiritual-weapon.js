// DAE itemMacro with spawned tokenId as argument
if (typeof args !== 'undefined') {
  if (args[0] == "off") {
    warpgate.dismiss(args[1]); // kill the token
    return;
  }
}

// WIRE itemMacro
if (typeof this !== 'undefined') {
  this.registerFlowStep("spiritual-weapon", true, async (activation) => {
    console.log("### SPIRITUAL WEAPON ### - this - ", this);
    console.log("### SPIRITUAL WEAPON ### - activation - ", activation);
    const caster = game.actors.get(this.item.parent._id);
    console.log("### SPIRITUAL WEAPON ### - caster - ", caster);
    const summonRange = this.item.system.range.value;  // use the range on the source item
    console.log("### SPIRITUAL WEAPON ### - summonRange - ", summonRange);
    const casterToken = caster.getActiveTokens(false, true)[0];
    console.log("### SPIRITUAL WEAPON ### - casterToken - ", casterToken);
    const spellSlot = activation.config.spellLevel;
    const casterMsakBonus = Number(caster.system.bonuses.msak.attack.split("+").filter(Number).reduce(function (total, num) { return parseFloat(total) + parseFloat(num) }));
    const casterMsakDamage = Number(caster.system.abilities[caster.system.attributes.spellcasting].mod) + casterMsakBonus;
    const casterMsakAttack = caster.system.attributes.prof + casterMsakDamage
    const spiritualWeaponActor = game.actors.getName("Rose");

    // Crosshairs
    let crosshairsDistance = 0;
    const checkDistance = async (crosshairs) => {
      while (crosshairs.inFlight) {
        await warpgate.wait(100); //wait for initial render
        const ray = new Ray(casterToken.center, crosshairs);
        const distance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0];

        //only update if the distance has changed
        if (crosshairsDistance !== distance) {
          crosshairsDistance = distance;
          if (distance > summonRange) {
            crosshairs.icon = 'icons/skills/social/wave-halt-stop.webp';
          } else {
            crosshairs.icon = spiritualWeaponActor.prototypeToken.texture.src;
          }
          crosshairs.draw();
          crosshairs.label = `${distance} ft`;
        }
      }
    };

    const curLocation = await warpgate.crosshairs.show(
      {
        size: spiritualWeaponActor.prototypeToken.width, // the spawned token's size
        interval: spiritualWeaponActor.prototypeToken.width % 2 === 0 ? 1 : -1, // swap between targeting the grid square vs intersection based on token's size
        label: '0 ft.',
      },
      { show: checkDistance }
    );

    // Cancel if location cancelled
    if (curLocation.cancelled || crosshairsDistance > summonRange) { return }
    const location = { 'x': curLocation.x, 'y': curLocation.y };

    // update the attack scaled to caster and spell level
    const updates = {
      embedded: {
        Item: {
          "Spiritual Weapon Attack": {
            "system": {
              "attackBonus": `-2 + ${casterMsakAttack}`,
              "damage.parts": [[`${1 + Math.floor((spellSlot-2)/2)}d8[force]+${casterMsakDamage}`, "force"]]
            }
          }
        }
      }
    };

    // define options
    const options = { controllingActor: caster };

    // Summon the token
    const spiritualWeaponTokenId = (await warpgate.spawnAt(location, "Rose", updates, {}, options))[0];
    console.log("#### Warpgate spawned tokenid is ", spiritualWeaponTokenId);

    // Update the DAE flag with the spawned token so it can be dismissed later
    let spiritualWeaponEffect = caster.effects.find(e => e.label === "Spiritual Weapon");
    console.log("#### spiritualWeaponEffect: ", spiritualWeaponEffect);
    spiritualWeaponEffect.update({
      "changes": [{
        "key": "macro.itemMacro",
        "value": `${spiritualWeaponTokenId}`,
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
        this.performCustomStep("spiritual-weapon")
      )
    )
  )
}