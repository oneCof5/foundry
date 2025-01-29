/*
Adjust for tokenActor to be an array of eiher selected or targeted tokens, and iterate over each.
*/

// define constants
const DARAKHUL_FEVER_EFFECT_NAME = [
    "Bitten",
    "Darakhul Fever"
];
const DARAKHUL_FEVER_EFFECT_DESC = [
    "<p>You have been bitten by a ghoul. You feel slightly feverish, but otherwise remain unaffected.</p>",
    "<p>Spread mainly through bite wounds, this rare disease makes itself known within 24 hours by swiftly debilitating the infected. A creature so afflicted must make a Constitution saving throw after every long rest. Failure costs the victim 1d6 Constitution damage and 1d4 Dexterity damage. The victim recovers from the disease by making successful saving throws on two consecutive days, but the accumulating Constitution damage makes this less likely with each passing day.</p>" 
];

// define the source and target
const targetedToken = game.user.targets.first();
const selectedToken = canvas.tokens.controlled[0];
const tokenActor = (!targetedToken) ? selectedToken.actor : targetedToken.actor; // if there is no targeted token, use the selected token instead.
if (!tokenActor) {
    ui.error('Select a token and/or a target.');
    return;
}
console.log('tokenActor: ',tokenActor);

// Find the effect named Darakhul Fever
const effect = tokenActor.effects.find(e => DARAKHUL_FEVER_EFFECT_NAME.includes(e.name));
console.log('effect: ',effect);

// ensure an active effect exists on the selected token.
if (!effect) return void ui.notifications.error(`The effect was NOT found on the selected token (${selectedToken.name})`);

// if effect is 'bitten' update the name & desc and set remaining saves flag to 2
if (effect.name === DARAKHUL_FEVER_EFFECT_NAME[0]) {
    // update the name and description of the effect
    let updates = [{
        _id: effect.id,
        name: `${DARAKHUL_FEVER_EFFECT_NAME[1]}`,
        description: `${DARAKHUL_FEVER_EFFECT_DESC[1]}`,
    }];
    await tokenActor.updateEmbeddedDocuments("ActiveEffect", updates);

    // set remaining saves and save off original ability score values
    let flags = {
        "darakhulFever": {
            "remainingSaves": 2,
            "originalCON": tokenActor.system.abilities.con.value,
            "originalDEX": tokenActor.system.abilities.dex.value
        }
    };
    await effect.setFlag("world", "peashooter", flags);
}

// get saved flags
const df_flags = await effect.getFlag("world", "peashooter.darakhulFever");
console.log('df_flags= ', df_flags);

// Dialog to indicate successful save or failed save.
let dialogTitle = `Darakhul Fever`;
let dialogContent = `Did the saving throw succeed?`;

return foundry.applications.api.DialogV2.wait({
        window: { title: dialogTitle },
        content: dialogContent,
        buttons: [
            {
                action: "yes",
                label: "Yes",
                default: true,
                callback: async (event, button, dialog) => {
                    // save success
                    console.log(`Dialog button 'yes' clicked.`);
                    // console.log('Passing the event=',event,' button=',button,' and dialog=',dialog,' parameters.')

                    // Reduce tracker flag by 1 and if zero remove the ActiveEffect.
                    let remainingDays = df_flags.remainingSaves - 1;
                    console.log('remainingDays: ',remainingDays);

                    if (remainingDays > 0) {
                        // update days remaining
                        await effect.setFlag("world", "peashooter.darakhulFever.remainingSaves", remainingDays);
                    } else {
                        // Remove the effect from the actor
                        await tokenActor.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
                    }
                }
            },
            {
                action: "no",
                label: `No`,
                callback: async (event, button, dialog) => {
                    // save failed
                    console.log(`Dialog button 'no' clicked.`)
                    // console.log('Passing the event=',event,' button=',button,' and dialog=',dialog,' parameters.')

                    // reset tracker to 2 days
                    await effect.setFlag("world", "peashooter.darakhulFever.remainingSaves", 2);

                    const myRolls = [];

                    // DEXTERITY SCORE (1d4)
                    // get existing reduction (if exists) and default to zero if undefined
                    let dexEffect = effect.changes.find(ec => ec.key==="system.abilities.dex.value");
                    console.log('dexEffect: ',dexEffect);

                    let currDexReduction = (!dexEffect) ? 0 : dexEffect.value;
                    console.log('currDexReduction:',currDexReduction);
                    
                    // Roll new reduction
                    let dexReduction = await reduceAbilityScore(tokenActor,"dex","1d4",currDexReduction, (-1*df_flags.originalDEX));
                    console.log('dexReduction: ',dexReduction);

                    // CONSTITUTION SCORE (1d6)
                    // get existing reduction (if exists) and default to zero if undefined
                    let conEffect = effect.changes.find(ec => ec.key==="system.abilities.con.value");
                    console.log('conEffect: ',conEffect);

                    let currConReduction = (!conEffect) ? 0 : conEffect.value;
                    console.log('currConReduction: ',currConReduction);
                    
                    // Roll new reduction
                    let conReduction = await reduceAbilityScore(tokenActor,"con","1d6",currConReduction, (-1*df_flags.originalCON));
                    console.log('conReduction: ',conReduction);

                    let updates = [{
                        _id: effect.id,
                        "changes": [
                            {
                                "key": "system.abilities.dex.value",
                                "mode": `${CONST.ACTIVE_EFFECT_MODES.ADD}`,
                                "value": `${dexReduction}`,
                                "priority": null
                            },
                            {
                                "key": "system.abilities.con.value",
                                "mode": `${CONST.ACTIVE_EFFECT_MODES.ADD}`,
                                "value": `${conReduction}`,
                                "priority": null
                            }
                        ]
                    }];
                    await tokenActor.updateEmbeddedDocuments("ActiveEffect", updates);
                    console.log('effect (updated): ', effect);

                    let deathMsg = 'With an ability score of zero, they perish from the Darakhul Fever!';
                    if (tokenActor.system.abilities.dex.value === 0) {
                        ui.notifications.warn(`Oh no!  ${tokenActor.name} has a current DEX score of ${tokenActor.system.abilities.dex.value}. ${deathMsg}`);
                    }
                    if (tokenActor.system.abilities.con.value === 0) {
                        ui.notifications.warn(`Oh no!  ${tokenActor.name} has a current CON score of ${tokenActor.system.abilities.con.value}. ${deathMsg}`);
                    }
                }
            }
        ],
        close: () => {
            console.log(`Dialog closed.`)
        }
    });   

async function reduceAbilityScore(tokenActor,flavorAbility,rollFormula, oldVal, maxVal) {
    const abilityRoll = await new CONFIG.Dice.BasicRoll(rollFormula, {}, {type: "ability score reduction"}).evaluate();
    let totVal = oldVal - abilityRoll.total;
    abilityRoll.toMessage({
        flavor: `Darakhul Fever: ${flavorAbility} damage`,
        speaker: ChatMessage.getSpeaker({ tokenActor })
    });
    if (totVal < maxVal) {totVal = maxVal} // prevent from becoming a negative total ability score value
    return totVal;
}