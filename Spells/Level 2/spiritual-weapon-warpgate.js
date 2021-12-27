/*
provided by siliconsaint for honeybadger's warpgate v1.5.0
https://github.com/trioderegion/warpgate
Called via DAE Macro.Execute spiritual-weapon @target @spellLevel
1. Summon the Spiritual Weapon token (named Rose)
2. Update the SW token's attack modifier to use the caster's spell attack. Remove the token's CR proficiency and any attribute mod (so it only uses the caster's)
3. Update the SW token's damage to use upcast and the spell casting mod of the caster.
4. Restore when the DAE effect ends.
*/
// console.log(args);
const lastArg = args[args.length -1];
const actorD = game.actors.get(lastArg.actorId);
const tokenD = canvas.tokens.get(lastArg.tokenId);
const level = args[2];
let summonType = "Rose";
// console.log("SPELL ATTRIBUTES", actorD.data.data.attributes);
const summonerDc = actorD.data.data.attributes.spelldc;
// console.log("SUMMONER DC", summonerDc);
const summonerAttack = summonerDc - 8;
// console.log("SUMMONER ATTACK", summonerAttack);
const summonerMod = getProperty(tokenD.actor, `data.data.abilities.${getProperty(tokenD.actor, 'data.data.attributes.spellcasting')}.mod`);
// console.log("SUMMONER MOD", summonerMod);
let damageScale = '';

if ((level-3) > 0){
    damageScale = `+ ${Math.floor((level-2)/2)}d8[force]`;
}

let updates = {
  embedded: { Item: {
    "Attack":{
      'data.attackBonus': `${summonerAttack} - @mod - @prof`,
      'data.damage.parts': [[`1d8[force] ${damageScale} + ${summonerMod}`, 'force']]
    }
  }}
};

async function myEffectFunction(template, update) {
  //prep summoning area
  let effect = '';

  new Sequence()
    .effect()
      .file(effect)
      .atLocation(template)
      .center()
      .JB2A()
      .scale(1.5)
      .belowTokens()
    .play()
}

async function postEffects(template, token) {
  //bring in our minion
  new Sequence()
    .animation()
      .on(token)
        .fadeIn(500)
    .play()
}

const callbacks = {
/*
pre: async (template, update) => {
    myEffectFunction(template,update);
    await warpgate.wait(1750);
  },
*/
  post: async (template, token) => {
    postEffects(template,token);
    await warpgate.wait(500);
  }
};

const options = {controllingActor: actor};

if (args[0] === "on") {
  let mySpawn = await warpgate.spawn(summonType, updates, callbacks, options);
  DAE.setFlag(actorD, 'spiritual-weapon', { tokenId: mySpawn[0] });
}

if (args[0] === "off") {
  const flag = await DAE.getFlag(actorD, 'spiritual-weapon');
  await warpgate.dismiss(flag.tokenId);
  DAE.unsetFlag(actorD, 'spiritual-weapon');
}
