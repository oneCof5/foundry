// requires Warpgate, Sequencer, and JB2A patreon module
const casterToken = canvas.tokens.get(args.at(-1).tokenId);
const stepSpell = args.at(-1).item
const distanceAvailable = stepSpell.system.range.value;

// Warpgate Crosshairs
let crosshairsDistance = 0;
const checkDistance = async (crosshairs) => {
    while (crosshairs.inFlight) {
        await warpgate.wait(100); //wait for initial render
        const tokenCenter = casterToken.center;
        const ray = new Ray(tokenCenter, crosshairs);
        const distance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0];

        //only update if the distance has changed
        if (crosshairsDistance !== distance) {
            crosshairsDistance = distance;
            if (distance > distanceAvailable) {
                crosshairs.icon = 'icons/svg/hazard.svg';
            } else {
                crosshairs.icon = stepSpell.img;
            }
            crosshairs.draw();
            crosshairs.label = `${distance} ft`;
        }
    }
}

// swap between targeting the grid square vs intersection based on token's size
const location = await warpgate.crosshairs.show({
  interval: casterToken.document.width % 2 === 0 ? 1 : -1,
  size: casterToken.document.width,
  icon: stepSpell.img,
  label: '0 ft.',
  },{show: checkDistance});

if (location.cancelled || crosshairsDistance > distanceAvailable) {return;}

// get the destination location x y
const { x, y } = canvas.grid.getSnappedPosition(location.x - 10, location.y - 10);

// Sequencer Effects
new Sequence()
.animation()
.on(casterToken)
.fadeOut(50)
.hide()

.effect()
.file('jb2a.misty_step.01.blue')
.atLocation(casterToken)
.waitUntilFinished()

.animation()
.on(casterToken)
.teleportTo(location)
.snapToGrid()
.offset({x: -1, y:-1 })

.animation()
.on(casterToken)
.show()
.opacity(1)
.fadeIn(250)
.waitUntilFinished()

.effect()
.file('jb2a.misty_step.02.blue')
.atLocation(location)
.waitUntilFinished(-500)

.play();
