/* BOOMING BLADE */
async function wait(ms) { return new Promise(resolve => {setTimeout(resolve, ms);}); }
const macroName = 'boomingBlade';
const macroVersion = '10.0';
console.log(`${macroName} (${macroVersion}):`, 'STARTING');
const lastArg = args[args.length - 1];
//console.log(`${macroName} (${macroVersion}):`, 'var - lastArg = ', lastArg);
const gameRound = game.combat ? game.combat.round : 0;
//console.log(`${macroName} (${macroVersion}):`, 'var - caster = ', caster);

const damageType = 'thunder';

/* MidiQOL OnUse */
if (lastArg.tag === 'OnUse') {
  /* First Usage */
  if (lastArg.macroPass === "postActiveEffects") {
    if (lastArg.targets?.length > 0) {
      console.log(`${macroName} (${macroVersion}):`, 'On Use Post Active Effects triggered!');
      console.log(`${macroName} (${macroVersion}):`, 'var args = ', args);
      const item = await fromUuid(lastArg.item.uuid);
      const caster = await fromUuid(lastArg.actor.uuid);
      await weaponAttack(item, caster, lastArg.tokenUuid, lastArg.targetUuids);
    }
  }
  /* ItemMacro Bonus Damage */
  if(lastArg.macroPass === "DamageBonus") {
    console.log(`${macroName} (${macroVersion}):`, 'On Use Damage Bonus triggered!');
    console.log(`${macroName} (${macroVersion}):`, 'var args = ', args);
    const caster = await fromUuid(lastArg.actor.uuid);
    const cantripLevel = caster.type === 'character' ? caster.system.details.level : caster.system.details.cr;
    const cantripDice = 1 + (Math.floor((cantripLevel + 1) / 6));
    const bonusDamageRoll = await new Roll(`${cantripDice}d8[${damageType}]`).evaluate({ async: true });
    game.dice3d?.showForRoll(bonusDamageRoll);
    return {damageRoll: bonusDamageRoll.total, flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`};
  }
}

/* DAE */
if (args[0] === "on") {
  /* Effect On (target of weapon attack). Sets the stage */  
  console.log(`${macroName} (${macroVersion}):`, 'DAE On triggered!');
  console.log(`${macroName} (${macroVersion}):`, 'var args = ', args);
}

if (args[0] === "off" && args[2]["expiry-reason"] === "midi-qol:isMoved") {
  const sourceItem = await fromUuid(args[2].origin);
  let casterActor = await fromUuid(sourceItem.parent.uuid);
  if (casterActor.actor) casterActor = casterActor.actor;
  const damageRoll = await new Roll(`${args[1]}d8[thunder}]`).evaluate({async: true});
  game.dice3d?.showForRoll(damageRoll);
  const bbMove = {
    "name": "Booming Blade (Movement)",
    "type": "feat",
    "system": {
      "description": {"value": "<p>Voluntary movement triggers Booming Blade secondary damage.</p>"},
      "activation": {"type": "special","cost": null,"condition": ""},
      "duration": {"value": null, "units": "inst"},
      "target": {"value": null, "width": null,"units": "", "type": "self"},
      "range": {"value": null, "long": null, "units": "self"},
      "actionType": "other",
      "damage": {"parts": [[`${args[2]}d8[thunder]`, "thunder"]] }
    },
    "img": "icons/skills/melee/sword-stuck-glowing-pink.webp",
    "effects": [{
      "label": "Booming Blade (Movement)",
      "icon": "icons/skills/melee/sword-stuck-glowing-pink.webp",
      "origin": `${args[2].origin}`,
      "duration": {"rounds": 1},
      "disabled": false,
      "changes": [{ "key": "macro.itemMacro", "mode": 0, "value": "2", "priority": 20}],
      "transfer": false,
      "flags": {"dae": {"selfTarget": false,"selfTargetAlways": true, "stackable": "none", "durationExpression": "", "macroRepeat": "none", "specialDuration": ["isMoved"]}}
    }],
    "flags": {"midi-qol": {"effectActivation": false,"noProvokeReaction": true}}
  };
  const pseudoOwneditem = new Item.implementation(bbMove, {parent: casterActor, temporary: true});
  const options = { showFullCard: false, createWorkflow: true, configureDialog: false, versatile: false, isCritical: false};
  await MidiQOL.completeItemRoll(pseudoOwneditem,options);
}

/* Functions */
async function seqEffect (file,target,scale) {
  const seq = new Sequence();
  seq.effect()
    .file(file)
    .atLocation(target)
    .scaleToObject(scale);
  seq.play();
}

async function weaponAttack(attackerItem, attackerActor, attackerTokenUuid, attackerTargetUuids ) {
  console.log(`${macroName} (${macroVersion}):`, 'Weapon Attack Function triggered!');
  console.log(`${macroName} (${macroVersion}):`, 'var args = ', args);
  const attackerWeapons = attackerActor.items.filter((i) => i.type === "weapon" && i.data.data.equipped);
  const weaponContent = attackerWeapons
      .map((w) => {
          return `<option value="${w.id}">${w.name}</option>`;
      })
      .join("");
  const content = `<div class="form-group"><label>Weapons : </label><select name="weapons"}>${weaponContent}</select></div>`;
  const d = new Dialog({
      title: "Booming Blade: Choose a weapon to attack with",
      content,
      buttons: {
          Ok: {
              label: "Ok",
              callback: async (html) => {
                  const chosenWeaponId = html.find("[name=weapons]")[0].value;
                  const chosenWeaponItem = attackerActor.getEmbeddedDocument("Item", chosenWeaponId);
//                  console.log(`${macroName} (${macroVersion}):`, 'var chosenWeaponItem = ',chosenWeaponItem);

                  const weaponCopy = duplicate(chosenWeaponItem);
                  delete weaponCopy._id;
                  weaponCopy.name = chosenWeaponItem.name + " [Booming Blade]";
 //                 console.log(`${macroName} (${macroVersion}):`, 'var weaponCopy = ', weaponCopy);
                  weaponCopy.effects.push({
                      changes: [{
                        key: 'macro.itemMacro',
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: '',
                        priority: '20'
                      }],
                      disabled: false,
                      duration: { rounds: 1 },
                      icon: attackerItem.img,
                      label: attackerItem.name,
                      transfer: false,
                      // prebuild MidiQOL.DamageOnlyWorkflow(actor,token,damageTotal,damageType,targets,roll,options)
                      flags: { dae: { specialDuration: ["turnStartSource", "isMoved"], transfer: false } },
                  });
//                  console.log(`${macroName} (${macroVersion}):`, 'var weaponCopy = ', weaponCopy);
                  setProperty(weaponCopy, "flags.itemacro", duplicate(lastArg.itemData.flags.itemacro));
                  setProperty(weaponCopy, "flags.midi-qol.effectActivation", false);
//                  console.log(`${macroName} (${macroVersion}):`, 'var weaponCopy = ', weaponCopy);

                  const options = { showFullCard: true, createWorkflow: true, configureDialog: true, createMessage: true };
                  const attackItem = new CONFIG.Item.documentClass(weaponCopy, { parent: attackerActor });
                  await MidiQOL.completeItemRoll(attackItem, options);
              },
          },
          Cancel: {
              label: "Cancel",
          },
      },
  });
  d.render(true);
}