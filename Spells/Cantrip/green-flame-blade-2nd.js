// macro vars
const sequencerFile = "jb2a.shield_themed.above.fire.01.orange";
const sequencerScale = 1.5;
const damageType = "fire";
const lastArg = args[args.length - 1];

if (lastArg.macroPass = 'preDamageRoll') {
    const workflow = MidiQOL.Workflow.getWorkflow(lastArg.uuid)
    console.log(`Calling the ${lastArg.macroPass} section using:`,workflow);

    const tactor = MidiQOL.MQfromActorUuid(lastArg.actorUuid);
    console.log('TACTOR variable:', tactor);
    const characterLevel = tactor.type === "character" ? tactor.data.data.details.level : tactor.data.data.details.cr;
    const charSpellcasting = tactor.data.data.attributes.spellcasting.toLowerCase();
    let spellMod;
    switch (charSpellcasting) {
        case 'cha':
            spellMod = tactor.data.data.abilities.cha.mod;
            break;
        case 'int':
            spellMod = tactor.data.data.abilities.int.mod;
            break;
        case 'wis':
            spellMod = tactor.data.data.abilities.int.mod;
            break;
        default: spellMod = 0;
    }
    const cantripDice = Math.floor((characterLevel + 1) / 6);
    if (cantripDice > 0) {
        workflow.item.data.data.damage.parts[0] = [`(${cantripDice}d8+${spellMod})[${damageType}]`, `${damageType}`]
    }
}

if (lastArg.macroPass = 'postActiveEffects') {
    console.log(`Calling the ${lastArg.macroPass} section`);
    let targets = Array.from(lastArg.targets);
    console.log(targets);
    sequencerEffect(targets, sequencerFile, sequencerScale);
}

// sequencer caller for effects on target
function sequencerEffect(targets, file, scale) {
    console.log(`Calling the sequencer function`);
    if (game.modules.get("sequencer")?.active && hasProperty(Sequencer.Database.entries, "jb2a")) {
      targets.forEach(t => {
        let target = canvas.tokens.get(t.id);
          new Sequence()
            .effect()
              .file(file)
              .atLocation(target)
              .scaleToObject(scale)
            .play();
        });
    }
}

