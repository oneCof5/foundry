const lastArg = args[args.length - 1];
//console.log('Atlas of Endless Horizons - lastArg:', lastArg);
let tokenD = canvas.tokens.get(lastArg.tokenId);
//console.log('Atlas of Endless Horizons - tokenD:', tokenD);
const actorD = tokenD.actor;
//console.log('Atlas of Endless Horizons - actorD:', actorD);

// DAE: While equipped, create Teleport feature
if (args[0] === 'on') {
  const img = 'icons/sundries/books/book-embossed-jewel-gold-purple.webp';
  const atlasName = 'Atlas of Endless Horizons';
  const teleportName = `Teleport: ${atlasName}`;
  let sourceItemUuId = lastArg.origin.split('.');
  const atlasItemId = sourceItemUuId[sourceItemUuId.length - 1];
  console.log('Atlas of Endless Horizons - atlasItemId: ',atlasItemId);

  const atlasFeature = {
    'name': `${teleportName}`,
    'type': 'feat',
    'img': `${img}`,
    'data': {
      'description': {'value': '<p>When you are hit by an attack, you can use your reaction to expend 1 charge to teleport up to 10 feet to an unoccupied space you can see. If your new position is out of range of the attack, it misses you.</p>'},
      'source': `${atlasName}`,
      'activation': {'type': 'reaction','cost': 1          },
      'duration': {'value': null,'units': 'inst'},
      'target': {'type': 'self'},
      'range': {'value': 10,'long': null,'units': 'ft'},
      'consume': {'type': 'charges','target': `${atlasItemId}`,'amount': 1},
      'actionType': 'util',
      'chatFlavor': `As the attack strikes, ${actorD.data.name} seems to shatter like glass, only to reappear a short distance away.`,
    },
    'flags': {
      'midi-qol': {
        'effectActivation': false,
        'onUseMacroName': '[postActiveEffects]ItemMacro'
      },
      'favtab': {
        'isFavorite': true
      },
      'itemacro': {
        'macro': {
          'data': {
            '_id': null,
            'name': `${teleportName}`,
            'type': 'script',
            'author': 'Jd73bpddRreBTuIB',
            'img': `${img}`,
            'scope': 'global',
            'command': "/* Called from DAE to teleport 10ft away */\nconst lastArg = args[args.length - 1];\nconsole.log(`Teleport`, lastArg);const distanceAvailable = lastArg.itemData.data.range.value;\nlet crosshairsDistance = 0;\nconst checkDistance = async (crosshairs) => {\n\twhile (crosshairs.inFlight) {\n\t\t//wait for initial render\n\t\tawait warpgate.wait(100);\n\t\tconst ray = new Ray(token.center, crosshairs);\n\t\tconst distance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0];\n\t\t//only update if the distance has changed\n\t\tif (crosshairsDistance !== distance) {\n\t\t\tcrosshairsDistance = distance;\n\t\t\tif (distance > distanceAvailable) {\n\t\t\t\tcrosshairs.icon = 'icons/svg/hazard.svg';\n\t\t\t} else {\n\t\t\t\tcrosshairs.icon = item.data.img;\n\t\t\t}\n\t\t\tcrosshairs.draw();\n\t\t\tcrosshairs.label = `${distance} ft`;\n\t\t}\n\t}\n}\nconst location = await warpgate.crosshairs.show(\n\t{\n\t\t// swap between targeting the grid square vs intersection based on token's size\n\t\tinterval: token.data.width % 2 === 0 ? 1 : -1,\n\t\tsize: token.data.width,\n\t\ticon: item.data.img,\n\t\tlabel: '0 ft.',\n\t},\n\t{\n\t\tshow: checkDistance\n\t},\n);\nif (location.cancelled || crosshairsDistance > distanceAvailable) {\n\treturn;\n}\nconst seq = new Sequence().effect()\n\t.scale(.25)\n\t.endTime(400)\n\t.file('jb2a.magic_signs.circle.02.conjuration.intro.yellow')\n\t.waitUntilFinished(-500)\n\t.atLocation(token);\nseq.animation()\n\t.on(token)\n\t.fadeOut(500)\n\t.duration(500)\n\t.waitUntilFinished();\nseq.animation()\n\t.on(token)\n\t.teleportTo(location)\n\t.snapToGrid()\n\t.waitUntilFinished();\nseq.animation()\n\t.on(token)\n\t.fadeIn(1000)\n\t.waitUntilFinished(-999);\nseq.effect()\n\t.file('jb2a.impact.003.blue')\n\t.atLocation(token)\nseq.effect()\n\t.scale(.25)\n\t.startTime(400)\n\t.file('jb2a.magic_signs.circle.02.conjuration.outro.yellow')\n\t.atLocation(token)\nawait seq.play();\n",
            'folder': null,
            'sort': 0,
            'permission': {
              'default': 0
            },
            'flags': {}
          }
        }
      },
      'core': {
        'sourceId': `Item.${atlasItemId}`
      },
    }
  };

  await actorD.createEmbeddedDocuments('Item', [atlasFeature]);
  let itemId = actorD.data.items.getName(teleportName).id;
  console.log('Atlas of Endless Horizons - itemId: ',atlasItemId);
  await DAE.setFlag(actorD, 'daeAtlasHorizons', {'itemId': itemId});
}

// DAE: When not equipped, remove the Harsh Critique feature if it exists
if (args[0] === 'off') {
    let flag = DAE.getFlag(actorD, 'daeAtlasHorizons')
    await actorD.deleteEmbeddedDocuments('Item', [flag.itemId]);
    await DAE.unsetFlag(actorD,'daeAtlasHorizons');
}
