// tposney base Sneak Attack and adjusted by me
// DAE 
// console.log(args);
// const version = "0.9.52"
// async function wait(ms) { return new Promise(resolve => {setTimeout(resolve, ms);}); }
const lastArg = args[args.length - 1];
console.log("lastArg",lastArg);

if(lastArg.tag == "DamageBonus") {
    let atkAction = lastArg.itemData.data.actionType;
    console.log("atkAction",atkAction);
    let wak = ["mwak","rwak"].includes(atkAction); // weapon attack
    console.log("wak",wak);

    if (!wak) {
        MidiQOL.warn("Sneak Attack: this was not a weapon attack");
        return {}; 
    }
    console.log("passed weapon attack test");

    let finWak = lastArg.itemData.data.properties?.fin;
    console.log("test of atkAction = mwak and finWak=true",(atkAction === "mwak" && finWak));
    console.log("finWak",finWak);
    if (atkAction === "mwak" && finWak) {
        MidiQOL.warn("Sneak Attack: this was not a melee finesse weapon attack");
        return {}; 
    }
    console.log("passed finesse melee attack test");

    let numHit = lastArg.hitTargets.length;
    if (numHit < 1) {
        MidiQOL.warn("Sneak Attack: this attack missed");
        return {};
    }
    console.log("pass not a miss test");

    // get the token and actor
    tokenD = canvas.tokens.get(lastArg.tokenId);
    console.log("tokenD",tokenD);
    actorD = token.actor;
    console.log("actorD",actorD);

    if (!actorD || !tokenD || numHit) {
        MidiQOL.warn("Sneak Attack: Cannot find actor, token or attack missed.");
        return {}; 
    }
    console.log("passed actor or token or numHit test.");

    const rogueLevels = actorD.getRollData().classes.rogue?.levels;
    if (!rogueLevels) {
      MidiQOL.warn("Sneak Attack Damage: Trying to do sneak attack and not a rogue");
      return {}; // rogue only
    }
    console.log("Passed rogue levels test: ",rogueLevels);

    let target = canvas.tokens.get(lastArg.hitTargets[0].id ?? lastArg.hitTargers[0]._id);
    console.log("target",target);
    if (!target) MidiQOL.error("Sneak attack macro failed");
    console.log("Passed got a target test.");
    
    if (game.combat) {
      const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
      const lastTime = actorD.getFlag("midi-qol", "sneakAttackTime");
      if (combatTime === lastTime) {
       MidiQOL.warn("Sneak Attack Damage: Already done a sneak attack this turn");
       return {};
      }
    }
    let foundEnemy = true;
    let isSneak = lastArg.advantage;
    console.log("isSneak",isSneak);    

    if (!isSneak) {
      foundEnemy = false;
      let nearbyEnemy = canvas.tokens.placeables.filter(t => {
        let nearby = (t.actor &&
             t.actor?.id !== lastArg.actor._id && // not me
             t.id !== target.id && // not the target
             t.actor?.data.data.attributes?.hp?.value > 0 && // not incapacitated
             t.data.disposition !== target.data.disposition && // not an ally
             MidiQOL.getDistance(t, target, false) <= 5 // close to the target
         );
        foundEnemy = foundEnemy || (nearby && t.data.disposition === -target.data.disposition)
        return nearby;
      });
      isSneak = nearbyEnemy.length > 0;
    }
    console.log("isSneak after checking nearby enemies",isSneak);    

    if (!isSneak) {
      MidiQOL.warn("Sneak Attack Damage: No advantage/ally next to target");
      return {};
    }
    console.log("isSneak last test",isSneak);    

    let useSneak = getProperty(actorD.data, "flags.dae.autoSneak");
    console.log("useSneak?",useSneak);

    if (!useSneak) {
        let dialog = new Promise((resolve, reject) => {
          new Dialog({
          // localize this text
          title: "Conditional Damage",
          content: `<p>Use Sneak attack?</p>`+(!foundEnemy ? "<p>Only Neutral creatures nearby</p>" : ""),
          buttons: {
              one: {
                  icon: '<i class="fas fa-check"></i>',
                  label: "Confirm",
                  callback: () => resolve(true)
              },
              two: {
                  icon: '<i class="fas fa-times"></i>',
                  label: "Cancel",
                  callback: () => {resolve(false)}
              }
          },
          default: "two"
          }).render(true);
        });
        useSneak = await dialog;
    }
    if (!useSneak) return {}
    const diceMult = lastArg.isCritical ? 2: 1;
    const baseDice = Math.ceil(rogueLevels/2);
    if (game.combat) {
      const combatTime = `${game.combat.id}-${game.combat.round + game.combat.turn /100}`;
      const lastTime = actorD.getFlag("midi-qol", "sneakAttackTime");
      if (combatTime !== lastTime) {
         await actor.setFlag("midi-qol", "sneakAttackTime", combatTime)
      }
    }
    // How to check that we've already done one this turn?
    return {damageRoll: `${baseDice * diceMult}d6`, flavor: "Sneak Attack"};
}