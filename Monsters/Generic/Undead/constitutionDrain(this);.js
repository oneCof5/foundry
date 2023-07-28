constitutionDrain(this);

async function constitutionDrain({ speaker, actor, token, character, item, args }) {
    if (this.hitTargets.size != 1 || this.isFumble) return;
    let roll = await new Roll('1d4').roll({ async: true });
    roll.toMessage({
        rollMode: 'roll',
        speaker: { alias: name },
        flavor: this.item.name
    });
    let damage = -roll.total;
    let targetActor = this.targets.first().actor;
    let effect = _findEffect(targetActor, this.item.name);
    if (!effect) {
        let effectData = {
            'label': this.item.name,
            'icon': this.item.img,
            'duration': {
                'seconds': 604800
            },
            'changes': [
                {
                    'key': 'system.abilities.con.value',
                    'mode': 2,
                    'value': damage,
                    'priority': 20
                }
            ],
            'flags': {
                'dae': {
                    'transfer': false,
                    'specialDuration': [
                        'shortRest'
                    ],
                    'stackable': 'multi',
                    'macroRepeat': 'none'
                }
            }
        };
        await _createEffect(targetActor, effectData);
    } else {
        let oldDamage = parseInt(effect.changes[0].value);
        damage += oldDamage;
        let updates = {
            'changes': [
                {
                    'key': 'system.abilities.con.value',
                    'mode': 2,
                    'value': damage,
                    'priority': 20
                }
            ]
        };
        await _updateEffect(effect, updates);
    }
    if (targetActor.system.abilities.con.value <= 0) {
        let unconscious = _findEffect(targetActor, 'Unconscious');
        if (unconscious) await _removeCondition(targetActor, 'Unconscious');
        await _addCondition(targetActor, 'Dead', true, null)
    }
}

function _findEffect(actor, name) {
    return actor.effects.find(eff => eff.label === name);
}

async function _createEffect(actor, effectData) {
    if (game.user.isGM) {
        await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
    } else {
        await MidiQOL.socket().executeAsGM('createEffects', { 'actorUuid': actor.uuid, 'effects': [effectData] });
    }
}
async function _removeEffect(effect) {
    if (game.user.isGM) {
        await effect.delete();
    } else {
        await MidiQOL.socket().executeAsGM('removeEffects', { 'actorUuid': effect.parent.uuid, 'effects': [effect.id] });
    }
}
async function _updateEffect(effect, updates) {
    if (game.user.isGM) {
        await effect.update(updates);
    } else {
        updates._id = effect.id;
        await MidiQOL.socket().executeAsGM('updateEffects', { 'actorUuid': effect.parent.uuid, 'updates': [updates] });
    }
}
async function _addCondition(actor, name, overlay, origin) {
    await game.dfreds.effectInterface.addEffect(
        {
            'effectName': name,
            'uuid': actor.uuid,
            'origin': origin,
            'overlay': overlay
        }
    );
}
async function _removeCondition(actor, name) {
    await game.dfreds.effectInterface.removeEffect(
        {
            'effectName': name,
            'uuid': actor.uuid
        }
    );
}
