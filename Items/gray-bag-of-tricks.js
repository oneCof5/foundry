// Requires ItemMacro, Warpgate, JB2A and Sequencer
console.log(args);

const lastArg = args[args.length - 1];
const myToken = canvas.tokens.get(lastArg.tokenId);

// Locate the Roll Table from the world compendium and draw a result
const comp = game.packs.get("world.curse-of-strahd-tables");
const tableId = comp.index.find(n => n.name === "Gray Bag of Tricks")._id;
const table = await comp.getDocument(tableId);

if (!table) return ui.notifications.warn("Missing table.");
const { results } = await table.draw();
let summonType = results[0].text;

const beastActor = game.actors.get(results[0].documentId); // use the document Id of the actor to get an actor object
console.log('beastActor',beastActor);

// Crosshairs
const distanceAvailable = lastArg.itemData.system.range.value;  // use the range on the source item
let crosshairsDistance = 0;

const checkDistance = async (crosshairs) => {
    while (crosshairs.inFlight) {
        await warpgate.wait(100); //wait for initial render
        const ray = new Ray(myToken.center, crosshairs);
        const distance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0];

        //only update if the distance has changed
        if (crosshairsDistance !== distance) {
            crosshairsDistance = distance;
            if (distance > distanceAvailable) {
                crosshairs.icon = 'icons/skills/social/wave-halt-stop.webp';
            } else {
                crosshairs.icon = 'icons/skills/targeting/crosshair-bars-yellow.webp';
            }
            crosshairs.draw();
            crosshairs.label = `${distance} ft`;
        }
    }
}

const curLocation = await warpgate.crosshairs.show(
    {
      size: beastActor.prototypeToken.width, // the spawned token's size
      interval: beastActor.prototypeToken.width % 2 === 0 ? 1 : -1, // swap between targeting the grid square vs intersection based on token's size
      icon: beastActor.prototypeToken.texture.src, 
      label: '0 ft.',
    },
    {
        show: checkDistance
    },
);

if (curLocation.cancelled || crosshairsDistance > distanceAvailable) { return; }

//prepare to summon token
const updates = {}; // { token : { "alpha":0 } };
const location = {'x':curLocation.x,'y':curLocation.y};

const callbacks = {
  pre: async (location) => {
    myEffectFunction(location);
    await warpgate.wait(500);
  },
  post: async (location, spawnedTokenD) => {
    postEffects(location, spawnedTokenD);
    await warpgate.wait(500);
  }
};

const options = { controllingActor: actor };

// Summon the token
await warpgate.spawnAt(location, summonType, updates, callbacks, options);

// Effect functions
async function myEffectFunction(location) {
  let seq = new Sequence();
    seq.effect()
      .file('jb2a.magic_signs.circle.02.conjuration.intro.yellow')
      .atLocation(location)
      .scale(.25)
      .endTime(400)
    seq.play()
}

async function postEffects(location, spawnedTokenD) {
  let seq = new Sequence();
  seq.animation()
    .on(spawnedTokenD)
    .opacity(0)
    .fadeIn(1000)
    .waitUntilFinished(-999);
  seq.effect()
    .file('jb2a.impact.003.blue')
    .atLocation(location)
  seq.effect()
    .file('jb2a.magic_signs.circle.02.conjuration.outro.yellow')
    .atLocation(location)
    .belowToken()
    .scale(.25)
    .startTime(400);
  seq.play()
}