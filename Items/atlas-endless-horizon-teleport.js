/* This is the ItemMacro for the Teleport Feature of the Atlas of Endless Horizons 
This is called from DAE to perform the teleport */
const lastArg = args[args.length - 1];console.log(`Teleport`, lastArg);
const distanceAvailable = lastArg.itemData.data.range.value;
let crosshairsDistance = 0;
const checkDistance = async (crosshairs) => {
  while (crosshairs.inFlight) {
    //wait for initial render
    await warpgate.wait(100);
    const ray = new Ray(token.center, crosshairs);
    const distance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0];
    //only update if the distance has changed
    if (crosshairsDistance !== distance) {
      crosshairsDistance = distance;
      if (distance > distanceAvailable) {
        crosshairs.icon = 'icons/svg/hazard.svg';
      } else {
        crosshairs.icon = item.data.img;
      }
      crosshairs.draw();
      crosshairs.label = `${distance} ft`;
    }
  }
}
const location = await warpgate.crosshairs.show(
  {
    // swap between targeting the grid square vs intersection based on token's size
    interval: token.data.width % 2 === 0 ? 1 : -1,
    size: token.data.width,
    icon: item.data.img,
    label: '0 ft.',
  },
  {
    show: checkDistance
  },
);
if (location.cancelled || crosshairsDistance > distanceAvailable) {
  return;
}
const seq = new Sequence().effect()
  .scale(.25)
  .endTime(400)
  .file('jb2a.magic_signs.circle.02.conjuration.intro.yellow')
  .waitUntilFinished(-500)
  .atLocation(token);
seq.animation()
  .on(token)
  .fadeOut(500)
  .duration(500)
  .waitUntilFinished();
seq.animation()
  .on(token)
  .teleportTo(location)
  .snapToGrid()
  .waitUntilFinished();
seq.animation()
  .on(token)
  .fadeIn(1000)
  .waitUntilFinished(-999);
seq.effect()
  .file('jb2a.impact.003.blue')
  .atLocation(token)
seq.effect()
  .scale(.25)
  .startTime(400)
  .file('jb2a.magic_signs.circle.02.conjuration.outro.yellow')
  .atLocation(token)
await seq.play();