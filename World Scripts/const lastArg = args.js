const lastArg = args.at(-1);
console.log(lastArg);
if (lastArg.macroPass === "preambleComplete") {
    const wf = await MidiQOL.Workflow.getWorkflow(lastArg.uuid);
    // spell range multiplies by upcast level (base 20)
    const newValue = 20 * wf.castData.castLevel;

    // clear the targets
    game.user?.updateTokenTargets();
    game.user?.broadcastActivity({});

    Hooks.once("refreshMeasuredTemplate", (template) => {
        template.document.distance = newValue;
        console.log({ newTemplate: template })
    });
}