const playlist_name = "your playlist name";
const playList = game.playlists.getName(playlist_name);
let songArray = this.getFlag("world", `songArray_${playlist_name}`);
if(!playList.playing) {
    if(songArray == undefined || songArray.length < 1) {
        songArray = playList.data.sounds.map(s => s.name);
        let songToPlay = songArray.shift();
        await playList.playSound(playList.sounds.getName(songToPlay));
        await this.setFlag("world", `songArray_${playlist_name}`, songArray);
    }
    else{
        let songToPlay = songArray.shift();
        await playList.playSound(playList.sounds.getName(songToPlay));
        await this.setFlag("world", `songArray_${playlist_name}`, songArray);
    }
}
else {
    await playList.stopAll();
}
