// World Script & MidiQOL Modules Required to run this.
Hooks.on("midi-qol.postCheckSaves", (workflow) => {
  // skip if not Vortex Warp
  if (!workflow.item.name === 'Vortex Warp') return;
  const failed = new Set();
  // if the target is friendly and they failed their save (friendly = disposition is same)
  for (let target of workflow.targets) {
      if (target.document.disposition === workflow.token.document.disposition && workflow.failedSaves.length > 0) {
          failed.add(target);
      }
  }
  workflow.failedSaves = failed;
  console.log(`VORTEX WARP - workflow: `, workflow);
});