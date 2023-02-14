let targetD = canvas.tokens.get(args[0].targets[0].id);
let hasSS = targetD.data.actorData.effects.find(ss => ss.label === 'Storm Sphere')._id;
if(hasSS) {
    Hooks.once('midi-qol.preAttackRoll', async function (preAttack) {
		preAttack.advantage = true;
		return preAttack;
    });
}

