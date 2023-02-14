let healingFormula = '1d6';
let clericLevels = origin.actor.classes.cleric.system.levels;
if (origin.uuid != actor.uuid) {
  healingFormula = healingFormula + '+' + clericLevels;
}
async function showMenu(title, options) {
  let buttonData = [];
  for (let i = 0; i < options.length; i++) {
    let menuLabel = options[i][0];
    let menuValue = options[i][1];
    let generatedOption = {};
    generatedOption = {
      label: menuLabel,
      value: menuValue
    };
    buttonData.push(generatedOption);
  }
  let menuReturn = await warpgate.buttonDialog({
    buttons: buttonData,
    title: title
  }, 'column');
  return menuReturn;
}
async function applyDamage(damage, damageType, targets) {
  await MidiQOL.applyTokenDamage(
    [
      {
        damage: damage,
        type: damageType
      }
    ],
    damage,
    new Set(targets),
    null,
    null
  );
}
let charmed = actor.effects.find(eff => eff.label === 'Charmed');
let frightened = actor.effects.find(eff => eff.label === 'Frightened');
let needMenu = false;
if (charmed || frightened) needMenu = true;
let action = 'Heal';
if (needMenu) {
  let options = [];
  if (charmed) options.push(['Remove the charmed condition.', 'Charmed']);
  if (frightened) options.push(['Remove the frightened condition.', 'Frightened']);
  options.push(['Gain temporary HP.', 'Heal']);
  action = await showMenu('You are charmed or frightened, what would you like to do?', options);
}
if (action === 'Charmed' || action === 'Frightened') {
  await game.dfreds.effectInterface.removeEffect({ effectName: action, uuid: actor.uuid });
} else {
  let damageRoll = await new Roll(healingFormula).roll({ async: true });
  applyDamage(damageRoll.total, 'temphp', [token]);
  damageRoll.toMessage({
    rollMode: 'roll',
    speaker: { alias: name }
  });
}

