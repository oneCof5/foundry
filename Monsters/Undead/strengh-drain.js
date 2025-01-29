console.log("STRENGTH DRAIN -- args ", args);
const lastArg = args.pop();
console.log("STRENGTH DRAIN -- lastArg ", lastArg);
const sdWf = MidiQOL.Workflow.getWorkflow(lastArg.uuid);
console.log("STRENGTH DRAIN -- sdWf ", sdWf);
// const target = canvas.tokens.controlled[0] || token;
// if (!target.combatant) return ui.notifications.warn("Your selected token is not in a combat.");
// const { roll: { total } } = await new Roll("1d8").toMessage({ flavor: `${target.name} gets an initiative bonus (Gift of Alacrity)!` });
// await target.combatant.update({ initiative: target.combatant.initiative + total });