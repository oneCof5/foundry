const template = canvas.templates.placeables[canvas.templates.placeables.length-1];

new Sequence()

.effect()
.file("jb2a.fireball.beam.orange")
.atLocation(token)
.stretchTo(template)

.effect()
.file("jb2a.magic_signs.circle.02.evocation.loop.yellow")
.atLocation(token)
.fadeIn(500)
.fadeOut(500)
.anchor({x:0.4})
.scaleToObject(2)
.duration(4000)
.rotateTowards(template, {cacheLocation: true})
.loopProperty("sprite", "rotation", { from: 0, to: 360, duration: 1000})
.scaleOut(0, 4000, {ease: "easeOutQuint", delay: -4000})
.zIndex(2)

.effect()
.file("jb2a.particles.outward.orange.01.04")
.atLocation(token)
.fadeIn(500)
.fadeOut(500)
.anchor({x:0.4})
.scaleToObject(2)
.duration(5000)
.rotateTowards(template, {cacheLocation: true})
.loopProperty("sprite", "rotation", { from: 0, to: 360, duration: 3000})
.scaleOut(0, 5000, {ease: "easeOutQuint", delay: -3000})
.zIndex(1)

.effect()
.file("jb2a.particles.outward.orange.01.03")
.atLocation(token)
.anchor({x:0.4})
.scaleToObject(1.75)
.animateProperty("sprite", "position.x", { from: 0, to: -1000, duration: 15000})
.rotateTowards(template, {cacheLocation: true})
.scaleIn(0, 500, {ease: "easeOutQuint"})
.duration(6000)
.playbackRate(2)
.fadeOut(2000)
.delay(2000)
.zIndex(2)

.effect()
.file("jb2a.fireball.explosion.orange")
.atLocation(template)
.scaleIn(0, 500, {ease: "easeOutQuint"})
.delay(2100)
.zIndex(2)

.play();