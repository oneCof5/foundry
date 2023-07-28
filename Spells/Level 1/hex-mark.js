console.log("HexMove -- this:", this);

const chris = {
  'findEffect': function _findEffect(actor, name) {
    return actor.effects.find(eff => eff.label === name);
  },
  'createEffect': async function _createEffect(actor, effectData) {
    await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
  },
  'removeEffect': async function _removeEffect(effect) {
    await effect.delete();
  },

  'updateEffect': async function _updateEffect(effect, updates) {
    await effect.update(updates);
  }
};

if (this.targets.size != 1) return;
const actor = this.actor;
const oldTargetTokenId = actor.flags.world?.spell?.hex;
const oldTargetToken = canvas.scene.tokens.get(oldTargetTokenId);
let oldTargetOrigin;
let selection = 'flags.wire.disadvantage.ability.check.str'; // default to STR
if (oldTargetToken) {
  let oldTargetActor = oldTargetToken.actor;
  let oldTargetEffect =  chris.findEffect(oldTargetActor, 'Hexed');
  if (oldTargetEffect) {
    await chris.removeEffect(oldTargetEffect);
    oldTargetOrigin = oldTargetEffect.origin;
    selection = oldTargetEffect.changes[0].key;
  }
}
let effect = chris.findEffect(actor, 'Hex');
const duration = (effect) ? effect.duration.remaining : 3600;
let targetToken = this.targets.first();
let targetActor = targetToken.actor;
let effectData = {
	'label': 'Hexed',
	'icon': 'icons/magic/perception/silhouette-stealth-shadow.webp',
	'origin': oldTargetOrigin,
	'duration': {
		'seconds': duration
	},
	'changes': [
		{
			'key': selection,
			'mode': 5,
			'value': '1',
			'priority': 20
		}
	]
};
await chris.createEffect(targetActor, effectData);
if (effect) {
    let changes = effect.changes;
    changes[0].value = targetToken.id;
    let updates = {changes};
    await chris.updateEffect(effect, updates);
}