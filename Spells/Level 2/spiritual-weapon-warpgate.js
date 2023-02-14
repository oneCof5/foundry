const version = '10.0.13';
try {
  const origin = args[0].itemUuid;
  if (origin) {
      const removeList = actor.effects.filter(ae => ae.origin === origin && getProperty(ae, 'flags.dae.transfer') !== 3).map(ae=>ae.id);
      await actor.deleteEmbeddedDocuments('ActiveEffect', removeList)
  }

  let casterSpellMod = args[0].actor.system.abilities[args[0].actor.system.attributes.spellcasting]?.mod;
  casterSpellMod =Number.isNaN(Number(casterSpellMod)) ? await parseBonuses(casterSpellMod) : Number(casterSpellMod) ;
  let casterProf = args[0].actor.system.attributes.prof;
  casterProf = Number.isNaN(Number(casterProf)) ? await parseBonuses(casterProf) : Number(casterProf) ;
  let casterSpellAttack = args[0].actor.system.bonuses.msak.attack;
  casterSpellAttack = Number.isNaN(Number(casterSpellAttack)) ? await parseBonuses(casterSpellAttack) : Number(casterSpellAttack) ;

  const casterAttackBonus = casterSpellMod + casterProf + casterSpellAttack;
  const casterDamageBonus = casterSpellMod || '';
  const numDice = 1 + Math.floor((args[0].spellLevel-2)/2);
  const damagePart = casterDamageBonus ? `${numDice}d8[force] + ${casterDamageBonus}` : `${numDice}d8[force]`; 
  const updates = {
    Item: {
      'Spiritual Weapon Attack': {
        'type': 'weapon',
        'img': args[0].itemData.img, 
        'system': {
          'equipped': true,
          'identified': true,
          'target': {'value': 1,'type': 'creature'},
          'range.units': 'touch',
          'actionType': 'msak',
          'attackBonus': `${casterAttackBonus}`,
          'damage.parts': [[`${damagePart}`,'force']],
          'weaponType': 'simpleM',
          'properties.mgc': true,
          'proficient': false
        }
      }
    }
  }

  const result = await warpgate.spawn('Rose',  {embedded: updates}, {}, {});
  if (result.length !== 1) return;
  const createdToken = game.canvas.tokens.get(result[0]);
  await createdToken.actor.items.getName('Spiritual Weapon Attack').update({'data.proficient': false});
  const targetUuid = createdToken.document.uuid;

  await actor.createEmbeddedDocuments('ActiveEffect', [{
      label: 'Summon', 
      icon: args[0].item.img, 
      origin,
      duration: {seconds: 60, rounds:10},
      'flags.dae.stackable': false,
      changes: [{key: 'flags.dae.deleteUuid', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: [targetUuid]}]
  }]);
} catch (err) {
    console.error(`${args[0].itemData.name} - SPIRITUAL WEAPON ${version}`, err);
}

async function parseBonuses (bonus) {
  let flavorRemoved = bonus.replace(/\[(.*?)\]/g,''); // strip out the [desc] tags in the source
  let dirtyArr = flavorRemoved.split('+'); // convert to an array using the + symbol e.g +1 + 2 + 3 becomes an array of [1,2,3]
  let cleanedArr = dirtyArr.join('').split(''); // remove the invalid items (non numbers)
  let newBonus = cleanedArr.reduce(function(total,num) {
    return parseInt(total)+parseInt(num);
  });
  return newBonus;
}