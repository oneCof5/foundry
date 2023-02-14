/* REQUIRES MidiQOL, DAE, Convenient Effects, and ActiveAuras */
let meetsReqs = (game.modules.get('dae')?.active || game.modules.get('midi-qol')?.active || game.modules.get('dae')?.active || game.modules.get('dae')?.active);
if (!meetsReqs) { ui.notifications.error('This macro requires DAE & MidiQOL by Tim Posney, Convenient Effects by DFred and Active Auras by Kandashi to function.'); return; }

const lastArg = args[args.length - 1]; console.log('Storm Sphere - lastArg:', lastArg);
const tokenD = canvas.tokens.get(lastArg.tokenId); // console.log('Storm Sphere - tokenD:', tokenD);
const actorD = tokenD.actor; // console.log('Storm Sphere - actorD:', actorD);
const gameRound = game.combat ? game.combat.round : 0;
let spellLevel, itemName, itemId;

if (lastArg.tag) {
  // Save off the DAE the flags to calc the item damage before things get out of sync with OnUse vs On/Off ItemMacro calls
  Hooks.once('midi-qol.RollComplete', async function (rcWork) {
    // set the SS flag
    await DAE.setFlag(actorD, 'daeStormSphere', {'itemName': rcWork.item.data.name,'itemId': rcWork.itemId,'spellLevel': rcWork.itemLevel});

    // apply Aura to the placed template using Active Aura's Helper
    await AAhelpers.applyTemplate(args);

    // locate the active Concentrating effect
    const getConc = await actorD.data.effects.find(c => c.data.label === 'Concentrating');
    if (!getConc) return ui.notifications.error('Concentrating is missing');

    // create the temp Lightning Bolt effect and link it to the Concentrating effect
    const effectData = {
        label: `${lastArg.itemData.name}: Lightning Bolt`,
        icon: lastArg.itemData.img,
        origin: lastArg.itemData.uuid,
        disabled: false,
        duration: { seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
        flags: {
          'dae': {
            'stackable': 'none',
            'durationExpression': '',
            'macroRepeat': 'none',
            'specialDuration': [],
            'transfer': true
          }
        },
        changes: [
            {key: `flags.dae.deleteUuid`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: getConc.uuid, priority: 20 },
            {key: `macro.itemMacro`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: '', priority: 20}
        ]
    };
    await MidiQOL.socket().executeAsGM('createEffects', { actorUuid: tokenD.actor.uuid, effects: [effectData] });
    const effect = await tokenD.actor.effects.find(i => i.data.label === `${lastArg.itemData.name}: Lightning Bolt`);
    const concUpdate = {
        _id: getConc.data._id,
        changes: [{ key: `flags.dae.deleteUuid`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: effect.uuid, priority: 20 }]
    };
    await MidiQOL.socket().executeAsGM('updateEffects', { actorUuid: tokenD.actor.uuid, updates: [concUpdate] });
  });
}

// called from the created temp Lightning Bolt effect created during OnUse
if (args[0] === 'on') {
  console.log('Storm Sphere - args[0]:', args[0]);

  let flag = await DAE.getFlag(actorD, 'daeStormSphere');
  const numDie = `${flag.spellLevel}`;
  const sslbFeat = {
    'name': 'Storm Sphere: Lightning Bolt',
    'type': 'feat',
    'img': 'icons/magic/lightning/bolt-strike-blue.webp',
    'data': {
      'description' :{'value': `<p>A 20-foot-radius sphere of whirling air springs into existence centered on a point you choose within range. The sphere remains for the spell’s duration. Each creature in the sphere when it appears or that ends its turn there must succeed on a Strength saving throw or take 2d6 bludgeoning damage. The sphere’s space is difficult terrain.</p>\n<p>Until the spell ends, you can use a bonus action on each of your turns to cause a bolt of lightning to leap from the center of the sphere toward one creature you choose within 60 feet of the center. Make a ranged spell attack. You have advantage on the attack roll if the target is in the sphere. On a hit, the target takes ${numDie}d6 lightning damage.</p>`},
      'source': `${flag.itemName}`,
      'activation': {'type': 'bonus','cost': 1},
      'duration': {'value': null,'units': 'inst'},
      'target': {'value': 1, 'type': 'creature'},
      'range': {'value': 60,'long': null,'units': 'ft'},
      'actionType': 'rsak',
      'damage': {'parts': [[`${numDie}d6[lightning]`, 'lightning']]}
    },
    'flags': {
      'midi-qol': {
        'effectActivation': false
      },
      'favtab': {
        'isFavorite': true
      },
      'core': {
        'sourceId': `Item.${flag.itemId}`
      },
      'itemacro': {
        'macro': {
          'data': {
            '_id': null,
            'name': 'Storm Lightning',
            'type': 'script',
            'author': 'Jd73bpddRreBTuIB',
            'img': 'icons/svg/dice-target.svg',
            'scope': 'global',
            'command': `let targetD = canvas.tokens.get(args[0].targets[0].id);\nlet hasSS = targetD.data.actorData.effects.find(ss => ss.label === 'Storm Sphere')._id;\nif(hasSS) {\n\tHooks.once('midi-qol.preAttackRoll', async function (preAttack) {\n\t\tpreAttack.advantage = true;\n\t\treturn preAttack;\n\t});\n}\n`,
            'folder': null,
            'sort': 0,
            'permission': {
              'default': 0
            },
            'flags': {}
          }
        }
      }
    }
  };
  await actorD.createEmbeddedDocuments('Item', [sslbFeat]);
  let sslbFeatItemId = actorD.data.items.getName('Storm Sphere: Lightning Bolt').id;
  await DAE.setFlag(actorD, 'daeStormSphereLightningBolt', {'itemId': sslbFeatItemId});
}

if (args[0] === 'off') {
  console.log('Storm Sphere - args[0]:', args[0]);
  let flag = DAE.getFlag(actorD, 'daeStormSphereLightningBolt');
  await actorD.deleteEmbeddedDocuments('Item', [flag.itemId]);
  await DAE.unsetFlag(actorD,'daeStormSphereLightningBolt');
  await DAE.unsetFlag(actorD,'daeStormSphere');
}
