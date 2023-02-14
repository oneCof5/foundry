// https://discord.com/channels/170995199584108546/699750150674972743/1027096755168358420
const comp = game.packs.get("dnd5e.tables");
const tableId = comp.index.find(n => n.name === "Confusion")._id;
const table = await comp.getDocument(tableId);
await table.draw();
// Change dnd5e.tables to your compendium entry and Confusion to the name of the table
// If you don't know the entry, just open a console by pressing the F12 key and typing game.packs in the command line
// You can change table.draw() to table.drawMany(number) if you need something that rolls the table more than once where number represents how many times it rolls on the table. 
// Or you could just click the macro several times of course