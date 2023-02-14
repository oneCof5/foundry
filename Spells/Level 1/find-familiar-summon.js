// Get a list of the possible minions
const playerCharacterId = game.users.current.id;

let ownedActors = game.actors.filter( a => a.data.permission[playerCharacterId] == 2 && a.folder.data.name == 'Summons' && a.data.data.details.source == 'Find Familiar');
ownedActors.sort(function(a, b){return a.name - b.name;}); //sort the list

let myFamiliarOptions = [ {type: 'header', label: 'Find Familiar'} ];
for (let a of ownedActors) {
  myFamiliarOptions.push({ type: 'radio', label: `<img src='${a.img}'' style='border:0px; width: 50px; height:50px;'><br/>${a.name}`, options: 'findFamiliar' });
}

// dialog options
let choices = await warpgate.dialog( myFamiliarOptions,"Choose your familiar:", "Poof!" );
let familiarArray = [];
for (let i = 1; i < myFamiliarOptions.length; i++) {
  familiarArray.push(choices[i]);
}
familiarArray = familiarArray.filter(Boolean);
let chosenFamiliar = familiarArray[0];
let summonType = chosenFamiliar.replace(/^.*<br\/>/i, '');


// Warp Gate
const updates = {};
const options = { controllingActor: actor};
const callbacks = {
  post: async (template, token) => {
    //bring in our minion
    new Sequence()
      .animation()
        .on(token)
          .fadeIn(500)
      .play()
    await warpgate.wait(500);
  }
};

warpgate.spawn(summonType, updates, callbacks, options);
