Hooks.on("midi-qol.preCheckSaves", function(workflow) {
    console.log("WS workflow",workflow);
    let bladesong = workflow.targets.effects.find(i => i.data.label.toLowerCase() === `bladesong`);
    if (!bladesong) return{};

});