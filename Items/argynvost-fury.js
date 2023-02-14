if (args[0].tag === 'OnUse' && args[0].macroPass === 'preSave') {
  const castingToken = canvas.tokens.get(args[0].tokenId);
  const targets = MidiQOL.findNearby(null, castingToken, 30, 0);
  let theTs = targets.filter(function (token) {
    let undead = ['undead', 'fiend', 'reborn'].some(i => (token.actor.type === 'character' ? token.actor.system.details.race : token.actor.system.details.type.value).toLowerCase().includes(i));
    if (undead) return token;
  });
  const newTs = theTs.map((token) => token.document.id);
  game.user?.updateTokenTargets(newTs);
  game.user?.broadcastActivity({newTs});

  if (game.modules.get("sequencer")?.active) {
    const seq = new Sequence();
    seq.effect()
      .file("modules/JB2A_DnD5e/Library/2nd_Level/Divine_Smite/DivineSmiteReversed_01_Regular_BlueYellow_Caster_400x400.webm")
      .atLocation(castingToken)
      .scaleToObject(12.5)
      .belowTokens()
      .fadeIn(500)
      .rotateIn(350, 1500, { ease: "easeInCubic" })
      .scaleIn(0, 1500, { ease: "easeInCubic" })
      .fadeOut(1500, { ease: "easeOutCubic", delay: 500 })
      .rotateOut(90, 2500, { ease: "easeInOutCubic" })
      .scaleOut(12, 2500, { ease: "easeInOutCubic" });
    seq.play()
  }
}