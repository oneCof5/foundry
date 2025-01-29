// function to replace the Roll table tomessage function.
async function createMessageContent(table, roll, results){
    return `<em>${game.i18n.format(`TABLE.DrawFlavor${results.length > 1 ? "Plural" : ""}`, {number: results.length, name: table.name})}</em>` + await renderTemplate(CONFIG.RollTable.resultTemplate, {
      description: await TextEditor.enrichHTML(table.description, {documents:true}),
      results: results.map(result => {
        const r = result.toObject(false);
        r.text = result.getChatText();
        r.icon = result.icon;
        return r;
      }),
      rollHTML: table.displayRoll && roll ? await roll.render() : null,
      table
    });
  }
  
  // lets create an example to work with that function.
  const table1 = await fromUuid("RollTable.pTpD1y27sjEwZbmZ");
  const table2 = await fromUuid("RollTable.HpVYxffij65f2TLm");
  const draw1 = await table.drawMany(4,{displayChat: false}); // both drawMany and draw work, showing both for that reason.
  const draw2 = await table2.draw({displayChat: false});
  
  // construct an array of objects {draw: xxxxx, table: yyyyy} however you like 
  // here I hard code one.
  const draws = [{draw: draw1, table: table1}, {draw: draw2,table: table2}];
  
  let msg  = "";
  for(let {draw,table} of draws){
    msg += await createMessageContent(table, draw.roll, draw.results)
  }
  ChatMessage.create({content: msg});