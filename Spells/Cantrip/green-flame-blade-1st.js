const sequencerFile = "jb2a.shield_themed.above.fire.01.orange";
const sequencerScale = 1.5;
const damageType = "fire";
const lastArg = args[args.length - 1];

// sequencer caller for effects on target
function sequencerEffect(target, file, scale) {
    if (game.modules.get("sequencer")?.active && hasProperty(Sequencer.Database.entries, "jb2a")) {
        new Sequence().effect().file(file).atLocation(target).scaleToObject(scale).play();
    }
}
// get the attacking weapon and modify with Green-Flame Blade on hit damage
function weaponAttack(caster, sourceItemData, origin, target) {
    const chosenWeapon = DAE.getFlag(caster, "greenFlameBladeChoice");
    const filteredWeapons = caster.items.filter((i) => i.type === "weapon" && i.data.data.equipped && i.data.data.actionType === 'mwak');
    const weaponContent = filteredWeapons
        .map((w) => {
            const selected = chosenWeapon && chosenWeapon == w.id ? " selected" : "";
            return `<option value="${w.id}"${selected}>${w.name}</option>`;
        })
        .join("");

    const content = `<div class="form-group"><label>Weapons : </label><select name="weapons"}>${weaponContent}</select></div>`;
    new Dialog({
        title: "Green-Flame Blade: Choose a weapon to attack with",
        content,
        buttons: {
            Ok: {
                label: "Ok",
                callback: async (html) => {
                    const itemId = html.find("[name=weapons]")[0].value;
                    const weaponItem = caster.getEmbeddedDocument("Item", itemId);
                    DAE.setFlag(caster, "greenFlameBladeChoice", itemId);
                    const weaponCopy = duplicate(weaponItem);
                    weaponCopy.name = weaponItem.name + " [Green-Flame Blade]";
                    const attackItem = new CONFIG.Item.documentClass(weaponCopy, { parent: caster });
                    const options = { showFullCard: false, createWorkflow: true, configureDialog: true };
                    await MidiQOL.completeItemRoll(attackItem, options);
                    const targetToken = await fromUuid(lastArg.tokenUuid);
                    const casterToken = canvas.tokens.placeables.find((t) => t.actor?.uuid === caster.uuid);
                    const casterLevel = caster.type === "character" ? caster.data.data.details.level : caster.data.data.details.cr;
                    const cantripDice = Math.floor((casterLevel + 1) / 6);
                    const damageRoll = await new Roll(`${cantripDice}d8[${damageType}]`).evaluate({async: true});
                    await new MidiQOL.DamageOnlyWorkflow(
                      caster,
                      casterToken.data,
                      damageRoll.total,
                      damageType,
                      [targetToken],
                      damageRoll,
                      {
                          flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`,
                          itemCardId: lastArg.itemCardId,
                          itemData: workflowItemData,
                          isCritical: false,
                      }
                    );
                    sequencerEffect(targetToken, sequencerFile, sequencerScale);                
                },
            },
            Cancel: {
                label: "Cancel",
            },
        },
    }).render(true);
}

if (args[0].tag === "OnUse") {
  console.log(lastArg.itemCardId);
    if (lastArg.targets?.length > 0) {
        const casterData = await fromUuid(lastArg.actorUuid);
        const caster = casterData.actor ? casterData.actor : casterData;
        weaponAttack(caster, lastArg.itemData, lastArg.uuid, lastArg.targets[0]);
    } else {
        ui.notifications.error("Green-Flame Blade: No target selected: please select a target and try again.");
    }

}