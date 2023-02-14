if (!token) token = game.users.character?.getActiveTokens()[0] ?? false;
if (!token) return ui.notifications.warn(`${game.user.name} has no assigned character or no active token on scene`);

const msgFlavor= `<p>${token.data.name} takes the <b>Hide</b> action.</p>`

// Make the Dexterity (Stealth) Check
await game.MonksTokenBar.requestRoll([{"token": token.id}],{request:'skill:ste', silent:true, fastForward:true, flavor: msgFlavor, rollMode:'roll'})

// Apply DFred's Convenient Effect
await game.dfreds.effectInterface.toggleEffect('Hiding');

// Report Passive Perception
game.macros.getName('all-tokens-passive-perception').execute();