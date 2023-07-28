// requires Warpgate, Sequencer, and JB2A patreon module
const selected = canvas.tokens.get(args.at(-1).tokenId); //canvas.tokens.controlled[0];
const stepSpell = args.at(-1).item
const distanceAvailable = stepSpell.system.range.value;

// Warpgate Crosshairs
let crosshairsDistance = 0;
const checkDistance = async (crosshairs) => {
    while (crosshairs.inFlight) {
        await warpgate.wait(100); //wait for initial render
        const ray = new Ray(selected.center, crosshairs);
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
const position = await warpgate.crosshairs.show({
  interval: selected.document.width % 2 === 0 ? 1 : -1,
  size: selected.document.width,
  icon: stepSpell.img,
  label: '0 ft.',
  },{show: checkDistance});

if (location.cancelled || crosshairsDistance > distanceAvailable) {return;}

new Sequence()

.effect()
.file("jb2a.explosion.07.bluewhite")
.atLocation(selected)
.scaleIn(0, 500, {ease: "easeOutCubic"})
.fadeOut(1000)
.scale({x:selected.data.width /4, y: selected.data.height/4})

.animation()
.on(token)
.opacity(0)

.effect()
.file("jb2a.energy_strands.range.standard.blue.04")
.atLocation(selected)
.stretchTo(position)
.waitUntilFinished(-2000)
.playbackRate(1.25)

.effect()
.file("jb2a.explosion.07.bluewhite")
.atLocation(position)
.scale({x:selected.data.width /4, y: selected.data.height/4})
.scaleIn(0, 500, {ease: "easeOutCubic"})
.fadeOut(1000)

.animation()
.on(selected)
.teleportTo(position)
.snapToGrid()
.offset({ x: -1, y: -1 })
.waitUntilFinished()

.effect()
.file("jb2a.token_border.circle.spinning.blue.001")
.name("FarStepCon")
.scaleIn(0, 1000, {ease: "easeOutElastic"})
.persist()
.scaleOut(0, 500, {ease: "easeOutElastic"})
.atLocation(selected)
.attachTo(selected, {bindAlpha: false})
.scaleToObject(2)

.animation()
.on(selected)
.opacity(1)
.waitUntilFinished()

.play();

await Sequencer.EffectManager.endEffects({ name: "FarStepCon" });