// based upon https://github.com/trioderegion/warpgate/wiki/Animate-Dead
const lastArg = args[args.length - 1];
if (lastArg.tag === "OnUse") {
    const summonerToken = canvas.tokens.get(lastArg.tokenId);
    const summonerActor = await fromUuid(lastArg.actorUuid);
    const summonerLevel = summonerActor._classes?.sorcerer?.system.levels;
    const spellLevel = lastArg.spellLevel;
    const undeadThralls = summonerActor.items.filter(i => i.name === "Undead Thralls");
    const upcastNumber = (spellLevel - 3) * 2; // upcast is plus 2 per higher spell level
    const number = 1 + upcastNumber + undeadThralls.length;

    const animatedS = { token: { name: "Animated Skeleton" }, actor: { name: "Animated Skeleton" } };
    const animatedZ = { token: { name: "Animated Zombie" }, actor: { name: "Animated Zombie" } };

    const buttonData = { buttons: [{ label: "Skeleton", value: animatedS }, { label: "Zombie", value: animatedZ }] };

    for (let i = 0; i < number; i++) {
        console.log('number: ', number);
        buttonData.title = `Choose the type of undead to animate.</br>Raising ${i + 1} of ${number} servant(s).`;
        const choice = await warpgate.buttonDialog(buttonData);

        if (choice === true) return {}; // break if no choice

        const undeadActor = game.actors.getName(choice.actor.name);

        // Crosshairs
        let crosshairsDistance = 0;
        const distanceAvailable = lastArg.itemData.system.range.value;  // use the range on the source item
        const checkDistance = async (crosshairs) => {
            while (crosshairs.inFlight) {
                await warpgate.wait(100); //wait for initial render
                const ray = new Ray(summonerToken.center, crosshairs);
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

        //prepare to summon token
        const location = { 'x': curLocation.x, 'y': curLocation.y };

        const callbacks = {
            post: async (location, spawnedTokenD) => {
                console.log('spawnedTokenD: ', spawnedTokenD);
                // Mutate for health & apply bonus damage effect based upon undead thrall
                if (undeadThralls) {
                    let tactor = game.actors.get(spawnedTokenD.actorId); // spawned token's actor
                    console.log('tactor:', tactor);

                    // update health by adding class level to roll
                    const hpRoll = new Roll(`${tactor.system?.attributes.hp?.formula} + ${summonerLevel}`).evaluate({ async: false });
                    console.log('HP ROLL: ',hpRoll);
                    let hpMsg = hpRoll.toMessage();
                    waitFor3DDiceMessage(hpMsg.id);

                    let updatedHp = {'system.attributes.hp': {'min': `${hpRoll.total}`,'max': `${hpRoll.total}`,'value': `${hpRoll.total}`}};
                    console.log('updatedHp:',updatedHp);
                    await tactor.update(updatedHp);

                    // Update bonus damage using proficiency
                    let effectData = {
                        'changes': [{ key: "system.bonuses.All-Damage", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: `${summonerActor.system.attributes.prof}`, priority: 20 }],
                        'disabled': false,
                        'icon': undeadThralls.img,
                        'label': 'Undead Thralls Bonus Damage',
                        'origin': lastArg.itemUuid,
                        'transfer': true
                    };
                    await tactor.createEmbeddedDocuments("ActiveEffect", [effectData]);
                }
            }
        };

        const options = { controllingActor: actor };

        // Summon the token
        await warpgate.spawnAt(location, choice.actor.name, {}, callbacks, options);

    }
}

// Effect functions
async function preEffects(location) {
    let seq = new Sequence();
    seq.effect()
        .file('jb2a.magic_signs.circle.02.evocation.intro.dark_red')
        .atLocation(location)
        .scale(.2)
        .waitUntilFinished();
    seq.play()
}

async function postEffects(location) {
    let seq = new Sequence();
    seq.effect()
        .file('jb2a.magic_signs.circle.02.evocation.outro.dark_red')
        .atLocation(location)
        .scale(.2)
    seq.play()
}

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