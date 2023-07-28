const lastArg = args.at(-1);
if (lastArg.tag === "OnUse") {
    // check if failed saves
    if (lastArg.failedSaves.length > 0) {
        const target = game.canvas.tokens.get(lastArg.failedSaves[0].id);
        const stepSpell = lastArg.item
        const upcastDistance = (lastArg.castData.castLevel - lastArg.castData.baseLevel) * 30;
        const distanceAvailable = stepSpell.system.range.value + upcastDistance;

        // Warpgate Crosshairs
        let crosshairsDistance = 0;
        const checkDistance = async (crosshairs) => {
            while (crosshairs.inFlight) {
                await warpgate.wait(100); //wait for initial render
                const tokenCenter = target.center;
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
        const position = await warpgate.crosshairs.show({
            interval: target.document.width % 2 === 0 ? 1 : -1,
            size: target.w / canvas.grid.size,
            icon: stepSpell.img,
            label: '0 ft.',
            tag: 'Vortex Warp',
            drawIcon: true,
            drawOutline: true,
            rememberControlled: true,
        }, { show: checkDistance });

        if (position.cancelled || crosshairsDistance > distanceAvailable) { return; }
        console.log("LOCATION:", position);
        //canvas.grid.getSnappedPosition(position.x - 10, position.y - 10);

        new Sequence()

            .effect()
            .from(target)
            .duration(1500)
            .scaleOut(0, 500, { ease: "easeInOutElastic" })
            .rotateOut(180, 300, { ease: "easeOutCubic" })

            .animation()
            .delay(100)
            .on(target)
            .opacity(0)

            .effect()
            .file("jb2a.particles.outward.white.01.02")
            .scaleIn(0, 500, { ease: "easeOutQuint" })
            .delay(1000)
            .fadeOut(1000)
            .atLocation(target)
            .duration(1000)
            .size(1.35, { gridUnits: true })
            .zIndex(1)

            .effect()
            .file("jb2a.portals.horizontal.vortex.purple")
            .atLocation(target)
            .scaleToObject(0.5)
            .rotateIn(-360, 500, { ease: "easeOutCubic" })
            .rotateOut(360, 500, { ease: "easeOutCubic" })
            .scaleIn(0, 600, { ease: "easeInOutCirc" })
            .scaleOut(0, 600, { ease: "easeOutCubic" })
            .opacity(1)
            .duration(1500)
            .belowTokens()
            .zIndex(0)

            .effect()
            .file("jb2a.extras.tmfx.outflow.circle.04")
            .atLocation(target)
            .scaleToObject(2.5)
            .rotateIn(-360, 500, { ease: "easeOutCubic" })
            .rotateOut(360, 500, { ease: "easeOutCubic" })
            .scaleIn(0, 600, { ease: "easeInOutCirc" })
            .scaleOut(0, 600, { ease: "easeOutCubic" })
            .fadeOut(1000)
            .opacity(0.2)
            .belowTokens()
            .zIndex(0)

            .effect()
            .file("jb2a.template_circle.vortex.intro.purple")
            .atLocation(target)
            .scaleToObject(1.9)
            .rotateIn(-360, 500, { ease: "easeOutCubic" })
            .rotateOut(360, 500, { ease: "easeOutCubic" })
            .scaleIn(0, 600, { ease: "easeInOutCirc" })
            .scaleOut(0, 600, { ease: "easeOutCubic" })
            .opacity(1)
            .belowTokens()
            .zIndex(1)
            .waitUntilFinished()

            .animation()
            .on(target)
            .teleportTo(position)
            .snapToGrid()
            .offset({ x: -1, y: -1 })
            .waitUntilFinished(200)

            .effect()
            .file("jb2a.portals.horizontal.vortex.purple")
            .atLocation(target)
            .scaleToObject(0.5)
            .rotateIn(-360, 500, { ease: "easeOutCubic" })
            .rotateOut(360, 500, { ease: "easeOutCubic" })
            .scaleIn(0, 600, { ease: "easeInOutCirc" })
            .scaleOut(0, 600, { ease: "easeOutCubic" })
            .opacity(1)
            .duration(1500)
            .belowTokens()
            .zIndex(0)

            .effect()
            .file("jb2a.template_circle.vortex.outro.purple")
            .atLocation(target)
            .scaleToObject(1.9)
            .rotateIn(-360, 500, { ease: "easeOutCubic" })
            .rotateOut(360, 500, { ease: "easeOutCubic" })
            .scaleIn(0, 500, { ease: "easeInOutCirc" })
            .scaleOut(0, 500, { ease: "easeOutCubic" })
            .opacity(1)
            .belowTokens()
            .zIndex(1)

            .effect()
            .file("jb2a.extras.tmfx.outflow.circle.04")
            .atLocation(target)
            .scaleToObject(2.5)
            .rotateIn(-360, 500, { ease: "easeOutCubic" })
            .rotateOut(360, 500, { ease: "easeOutCubic" })
            .scaleIn(0, 500, { ease: "easeInOutCirc" })
            .scaleOut(0, 500, { ease: "easeOutCubic" })
            .opacity(0.2)
            .fadeOut(1000)
            .belowTokens()
            .zIndex(0)

            .effect()
            .file("jb2a.particles.outward.white.01.02")
            .delay(250)
            .scaleIn(0, 500, { ease: "easeOutQuint" })
            .fadeOut(1000)
            .atLocation(target)
            .duration(1000)
            .size(1.35, { gridUnits: true })
            .zIndex(1)

            .effect()
            .from(target)
            .delay(250)
            .atLocation(target)
            .duration(1500)
            .scaleIn({ x: 0.2, y: 0 }, 1000, { ease: "easeOutElastic" })
            .rotateIn(360, 500, { ease: "easeOutCubic" })
            .waitUntilFinished(-200)

            .animation()
            .on(target)
            .opacity(1)

            .play();
    }
}
