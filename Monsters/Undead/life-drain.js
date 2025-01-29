// Requires the source actor (the undead) is the selected token and the targeted token is actively marked as a target.
if (canvas.tokens.controlled.length != 1) {
    ui.notifications.error("Choose a single attacking token.");
    return;
};
const targetAcquired = game.user.targets.first() ?? false;
if (!targetAcquired) {
    ui.notifications.error("Choose a single token being attacked.");
    return;
};

const sourceActor = canvas.tokens.controlled.at(0).actor ?? false;
const sourceItem = sourceActor.items.filter(e => e.name == 'Necrotic Slam').at(0);

// establish the target and save off the current maxtemp hp reduction (if any)
const target = game.user.targets.first().actor;
let currentTempMaxHP = (target.system.attributes.hp.tempmax ?? 0);

// Request the total damage taken
const drainedHP = await foundry.applications.api.DialogV2.prompt({
    content: "<input type='number' name='drainedHP' placeholder='Roll Total'>",
    ok: { callback: (event, button) => button.form.elements.drainedHP.valueAsNumber },
    position: { width: 300, height: "auto" },
    modal: true,
    window: { title: "Input Total", icon: "fa-solid fa-dice" }
});

// If "Life Drained" is already on the target, add to the existing reduction.
const existingEffect = target.effects.filter(e => e.name == 'Life Drained') ?? false;
if (existingEffect.length > 0) {
    // override the saved maxtemp hp reduction with the effect value
    currentTempMaxHP = existingEffect[0].changes[0].value;
    // delete the existing effect so we can replace it
    await target.deleteEmbeddedDocuments("ActiveEffect", existingEffect.map(e => e.id))
}

// don't set hp.tempmax to less than the total max HP
const calcHP = Math.max(currentTempMaxHP - drainedHP, -target.system.attributes.hp.max);

await target.createEmbeddedDocuments("ActiveEffect", [{
    name: 'Life Drained',
    description: 'Maximum health reduced',
    icon: 'icons/magic/death/projectile-skull-fire-purple.webp',
    changes: [
        {
            key: `system.attributes.hp.tempmax`,
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: `${calcHP}`,
        },
    ],
    disabled: 'false',
    duration: {
        duration: 864000,
        seconds: 864000,
        type: 'seconds',
    },
    origin: `Actor.${sourceActor._id}.Item.${sourceItem._id}`,
    transfer: false,
}]);