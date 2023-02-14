Hooks.on("midi-qol.preAttackRoll", function (workflow) {
  const targetActor = workflow.targets.first().actor;
  const targetIsProtected = targetActor.data.effects.find(i=> i.data.label === "Protection from Good and Evil" || i.data.label === "Protection from Evil and Good") !== undefined;
  const attackerIsEvilOrGood = ['aberration', 'celestial', 'elemental', 'fey', 'undead', 'fiend', 'reborn'].some(i => (workflow.actor.type === 'character' ? workflow.actor.system.details.race : workflow.actor.system.details.type?.value).toLowerCase().includes(i));
//	debugger;
	if(!(targetIsProtected && attackerIsEvilOrGood)) return {};
  workflow.disadvantage = true;
});