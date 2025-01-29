const selectedToken = canvas.tokens.controlled[0];

if (!selectedToken)  {
    ui.notifications.warn(`Please select a token.`);
    return;
}
let tActor = selectedToken.actor;
console.log(tActor);
if (tActor.type !== "character") {
    ui.notifications.warn(`Please select a player character.`);
    return;
}
const fontOfMagic = actor.items?.find(f => f.name === "Font of Magic");
console.log(fontOfMagic);
if (!fontOfMagic) {
    ui.notifications.warn(`The selected player character does not seem to have Sorcery Points.`);
    return;
};
const SP = Math.max((fontOfMagic?.system.uses.value ?? 0));
console.log(SP);
const SPmax = Math.max((fontOfMagic?.system.uses.max ?? 0));
console.log(SPmax);


const conversionMap = {1: 2, 2: 3, 3: 5, 4: 6, 5: 7};
// const spellPoints = item.system.uses;
const spellSlots = {...tActor.system.spells};
console.log(spellSlots);

// array of spell levels for converting points to slots.
const validLevelsWithSpentSpellSlots = Object.entries(spellSlots).filter(([key, entry]) => {
  const k = key === "pact" ? entry.level : key.at(-1);
  const cost = conversionMap[k];
  if (!cost || (cost > spellPoints.value)) return false;
  return (entry.max > 0 && entry.value < entry.max);
});
console.log(validLevelsWithSpentSpellSlots);
// array of spell levels for converting slots to points.
const spellLevelsWithAvailableSlots = Object.entries(spellSlots).filter(([key, entry]) => {
  return (entry.value > 0) && (entry.max > 0);
});
console.log(spellLevelsWithAvailableSlots);