const lastArg = args.at(-1);
console.log(lastArg);
if (lastArg.macroPass==="preambleComplete") {
    // clear the targets
    game.user?.updateTokenTargets();
    game.user?.broadcastActivity({});
}

if (lastArg.macroPass==="preItemRoll") {
  const wf = MidiQOL.Workflow.getWorkflow(lastArg.uuid);
  // spell range multiplies by upcast level (base 20)
  wf.item.system.target.value = 20 * workflow.castData.castLevel;
}
