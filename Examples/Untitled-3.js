// https://discord.com/channels/170995199584108546/699750150674972743/1065680059077242880
// Looking for a way to add all scenes to a compendia. 

const targetKey = "key of the compendium that you want to put all the scenes in";
const sourceKeys = [
  "key of comp 1",
  "key of comp 2",
  "..."
];
const data = [];
for(const key of sourceKeys){
  const pack = await game.packs.get(key).getDocuments();
  const sceneData = pack.map(p => p.toObject());
  data.push(...sceneData);
}
await Scene.createDocuments(data, {pack: targetKey});
To get the keys: game.packs.keys() in the console (F12)