const spawns = [{summonName: "Scarecrow", dieRoll: "1d4"},{summonName: "Barovian Witch", dieRoll: "2d4"}]
for (let spawn of spawns) {
    console.log("For Our Mother spawn: ",spawn);
    let {total} = await new Roll(`${spawn.dieRoll}`).evaluate({async: true});

    // notify the results
    await ChatMessage.create({
        "flavor": "For Our Mother",
        "content": `<p>${total} ${spawn.summonName} join the battle!</p>`,
        "whisper": ChatMessage.getWhisperRecipients("GM")
    });
    // drop on the board
    await loadTexture(game.actors.getName(spawn.summonName).data.token.img);
    await warpgate.spawn(spawn.summonName, {}, {}, {duplicates: total});
}

