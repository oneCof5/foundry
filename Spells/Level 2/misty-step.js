/* Requires Advanced Macros, MidiQOL, JB2A and Warp Gate */
let error = false;
if(typeof args !== 'undefined' && args.length === 0){
    error = `You can't run this macro from the hotbar! This is a callback macro. To use this, enable MidiQOL settings in "Workflow" -> "Add macro to call on use", then add this macro's name to the bottom of the Misty Step spell in the "On Use Macro" field.`;
}

if(!(game.modules.get("jb2a_patreon") || game.modules.get("JB2A_DnD5e"))){
    error = `You need to have JB2A installed to run this macro!`;
}

if(!game.modules.get("advanced-macros")?.active){
    let installed = game.modules.get("advanced-macros") && !game.modules.get("advanced-macros").active ? "enabled" : "installed";
    error = `You need to have Advanced Macros ${installed} to run this macro!`;
}

if(!game.modules.get("midi-qol")?.active){
    let installed = game.modules.get("midi-qol") && !game.modules.get("midi-qol").active ? "enabled" : "installed";
    error = `You need to have MidiQOL ${installed} to run this macro!`;
}

if(!game.modules.get("warpgate")?.active){
    let installed = game.modules.get("warpgate") && !game.modules.get("warpgate").active ? "enabled" : "installed";
    error = `You need to have Warp Gate ${installed} to run this macro!`;
}

if(error){
    ui.notifications.error(error);
    return;
}

const lastArg = args[args.length - 1];
// console.log(lastArg);
let tokenD = canvas.tokens.get(lastArg.tokenId);
tokenD.actor.sheet.minimize();
// Poof out animation
new Sequence()
  .effect()
    .baseFolder("modules/JB2A_DnD5e/Library/2nd_Level/Misty_Step")
    .file("MistyStep_01_Regular_Blue_400x400.webm")
    .atLocation(tokenD)
    .randomRotation()
  .play()

const tokenCenter = tokenD.center;
let cachedDistance = 0;
const checkDistance = async(crosshairs) => {

    while (crosshairs.inFlight) {

        //wait for initial render
        await warpgate.wait(100);

        const ray = new Ray( tokenCenter, crosshairs );

        const distance = canvas.grid.measureDistances([{ray}], {gridSpaces:true})[0]

        //only update if the distance has changed
        if (cachedDistance !== distance) {
          cachedDistance = distance;
          if(distance > 30) {
              crosshairs.icon = 'icons/svg/hazard.svg'
          } else {
              crosshairs.icon = tokenD.data.img
          }

          crosshairs.draw()

          crosshairs.label = `${distance} ft`

        }

    }

}

const callbacks = {
    show: checkDistance
}

const location = await warpgate.crosshairs.show({size: tokenD.data.width, icon: tokenD.data.img, label: '0 ft.'}, callbacks)
//console.log(location)

if (location.cancelled) return;
if (cachedDistance > 30) {
    ui.notifications.error('Misty Step has a maximum range of 30 ft.')
    return;
}
const {x,y} = canvas.grid.getSnappedPosition(location.x-10, location.y-10);
const updates = {token: {x,y}}
// await item.roll();
await warpgate.mutate(tokenD.document, updates, {}, {permanent: true} )

await new Sequence()
  .effect()
    .baseFolder("modules/JB2A_DnD5e/Library/2nd_Level/Misty_Step")
    .file("MistyStep_02_Regular_Blue_400x400.webm")
    .atLocation(location)
    .randomRotation()
  .wait(750)
  .thenDo(async () => {
    await tokenD.document.update({
      hidden: false
      }, { animate: false });
    })
  .play()

tokenD.actor.sheet.maximize();
