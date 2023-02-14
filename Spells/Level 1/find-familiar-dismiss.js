/* collect all tokens on the scene spawned by me */
const mySpawns = canvas.tokens.placeables.filter( token => token.actor?.getFlag('warpgate','control')?.user == game.user.id);

/* dismiss each one */
for(const token of mySpawns) {
    await warpgate.dismiss(token.id, canvas.scene.id);
}
