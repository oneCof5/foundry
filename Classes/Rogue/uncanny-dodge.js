// inspired by crymic
const lastArg = args[args.length - 1];
// console.log('LASTARG',lastArg);
const strTokenID = lastArg.tokenId; // capture this rogue's tokenId value

const tactor = canvas.tokens.get(lastArg.tokenId).actor;
const target = canvas.tokens.get(lastArg.tokenId) || token;

// get the message history and filter by this tokenId
let damageHistory = game.messages._source.map(i => ({_id : i._id, tokenId : i.flags?.midiqol?.undoDamage[0]?.tokenId, totalDamage : i.flags?.midiqol?.undoDamage[0]?.totalDamage, newHP : i.flags?.midiqol?.undoDamage[0]?.newHP, oldHP : i.flags?.midiqol?.undoDamage[0]?.oldHP, newTempHP : i.flags?.midiqol?.undoDamage[0]?.newTempHP, oldTempHP:i.flags?.midiqol?.undoDamage[0]?.oldTempHP })).filter(i=> i.tokenId === strTokenID);
// console.log('DAMAGEHISTORY',damageHistory);

if (damageHistory.length > 0) {
    let idx = damageHistory.length - 1;
    let curtDamage = damageHistory[idx];
    let lastDamage = curtDamage.oldHP - curtDamage.newHP;
    console.log('lastDamage',lastDamage);
    const target = canvas.tokens.get(curtDamage.tokenId);
    const damage_type = "healing";
    let uncannyDamage = Math.floor(lastDamage/2);
    console.log('uncannyDamage',uncannyDamage);

    // if this token took damage, then heal half of it back
    let damageRoll = "";
    if (uncannyDamage > 1) {
        damageRoll = new Roll(`${uncannyDamage}`).evaluate({async:false});
    } else {
        damageRoll = new Roll(`0`).evaluate({async:false});
    }

    await new MidiQOL.DamageOnlyWorkflow(tactor, token, damageRoll.total, damage_type, [target], damageRoll, {flavor: `(${CONFIG.DND5E.damageTypes[damage_type]})`, itemCardId: lastArg.itemCardId});

} else {
  return ui.notifications.warn(`The macro thinks that you haven't been attacked yet.`);
}
