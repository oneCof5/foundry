this.registerFlowStep("mistyStep", true, async (activation) => {
  const caster = game.actors.get(this.item.parent._id);
  const casterToken = canvas.tokens.get(caster.getActiveTokens()[0].id);

  casterToken.actor.sheet.minimize();

  const tokenCenter = casterToken.center;
  let cachedDistance = 0;
  const checkDistance = async (crosshairs) => {

    while (crosshairs.inFlight) {
      await warpgate.wait(100); //wait for initial render
      const ray = new Ray(tokenCenter, crosshairs);
      const distance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0]

      //only update if the distance has changed
      if (cachedDistance !== distance) {
        cachedDistance = distance;
        if (distance > 30) {
          crosshairs.icon = 'icons/svg/hazard.svg'
        } else {
          crosshairs.icon = casterToken.data.img
        }
        crosshairs.draw()
        crosshairs.label = `${distance} ft`
      }
    }
  }

  let callbacks = {
    show: checkDistance
  }
  const location = await warpgate.crosshairs.show({ size: casterToken.data.width, icon: casterToken.data.img, label: '0 ft.' }, callbacks)
  if (location.cancelled) return;
  if (cachedDistance > 30) {
    ui.notifications.error('Misty Step has a maximum range of 30 ft.')
    return;
  }
  // the destination location
  const { x, y } = canvas.grid.getSnappedPosition(location.x - 10, location.y - 10);
  // move the token
  let updates = { token: { x, y } }

  // effects
  callbacks = {
    pre: async (template, token) => {
      new Sequence()
        .animation()
        .on(token)
        .hide()
        .effect()
        .file("jb2a.misty_step.01.blue")
        .atLocation(token)
        .randomRotation()
        .play()
    },
    post: async (template, token) => {
      new Sequence()
        .animation()
        .on(token)
        .show()
        .effect()
        .file("jb2a.misty_step.01.blue")
        .atLocation(template)
        .play()
    }
  };

  // warpgate options
  const options = { permanent: true };

  // warpgate magic
  await warpgate.mutate(casterToken.document, updates, callbacks, options)
});

return this.applyDefaultTargetsAsEffective(
  this.performCustomStep("mistyStep"),
  this.attackCompleted()
);