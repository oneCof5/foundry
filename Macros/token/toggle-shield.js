// For a selected group of tokens, toggle whether a shield is equipped.

tokens = canvas.tokens.controlled;
tokens.forEach(toggleShield);

async function toggleShield(token) {
    const theShield = token.actor.items.find(e => e.type == 'equipment' && e.system.type.baseItem == 'shield') ?? 0;
    if (theShield) {
        await theShield.update({ 'system.equipped': !theShield.system.equipped });
    }
}