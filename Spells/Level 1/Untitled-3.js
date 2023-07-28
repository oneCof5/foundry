// Get Lair Token
const lair = canvas.tokens.placeables.filter((token) => token.name.toLowerCase().match(/lair/i))[0];
lair.control()

// Get Strahd Token
const strahd = canvas.tokens.placeables.filter((token) => token.name.toLowerCase().match(/strahd/i))[0];
console.log(strahd);

// Animate
new Sequence()
.animation()
.on(lairPlaceable)
.teleportTo({ x: strahd.x, y: strahd.y })
.snapToGrid()

.play();