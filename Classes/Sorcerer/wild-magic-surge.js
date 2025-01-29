/* 
Level 3: Wild Magic Surge
Your spellcasting can unleash surges of untamed magic. Once per turn, you can
roll 1d20 immediately after you cast a Sorcerer spell with a spell slot. If you
roll a 20, roll on the Wild Magic Surge table to create a magical effect.
If the magical effect is a spell, it is too wild to be affected by your 
Metamagic.

1. Select a single token (caster).
2. Roll a d20. If the result is 20, roll on Wild Magic Surge Table from compendium.
3. Output results to a single chat message card.
*/

// Select the casting token
const selectedToken = canvas.tokens.controlled[0];
if (!selectedToken) {
    ui.notifications.warn(`Please select a token.`);
    return;
}
let tActor = selectedToken.actor;
if (tActor.type !== "character") {
    ui.notifications.warn(`Please select a player character.`);
    return;
}

// Roll the d20

// Compare the results

// draw from the table in the compendium

Compendium.compendium-peashooters-ddb.tables.RollTable.DreqFrw7itPbtxKG

/* 
const table = await fromUuid("uuid of table inside compendium");
await table.draw({rollMode: CONST.DICE_ROLL_MODES.PRIVATE});
*/

let tableToUse = event.target.outerText;
const pack = game.packs.get("foundry_community_tables.community-tables-independent");
const entry = pack.index.getName(tableToUse);
const table = await pack.getDocument(entry._id);
let roll = await table.draw({displayChat:false});
let result = roll.results[0].text;
let tableName = roll.results[0].parent.name
let chatData = {
  user: game.user._id,
  speaker: ChatMessage.getSpeaker(),
  content: "<i>Rolling on <strong>" + tableName + "</strong> rolltable</i><br><br>" + result,
  whisper: game.users.filter(u => u.isGM).map(u => u._id)
  };
ChatMessage.create(chatData, {});

/*
const result1 = await game.tables.getName("table 1").draw({displayChat: false})
const result2 = await game.tables.getName("table 2").draw({displayChat: false})
const result3 = await game.tables.getName("table 3").draw({displayChat: false})
await ChatMessage.create({
  content:`<p>Result of table 1: ${result1.results[0].getChatText()}</p>
           <p>Result of table 2: ${result2.results[0].getChatText()}</p>
           <p>Result of table 3: ${result3.results[0].getChatText()}</p>`,
  whisper: [game.user]
});
*/


/////////////////////////////////////////////////////////////////

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

// Output a ChatMessage

// const roll = await new Roll('1d20').evaluate();
// const flavor = roll.total === 20 ? 'Wild Magic Surge!' : 'no!';
// await roll.toMessage({flavor});

ChatMessage.create(sendMessage(), {});

// Check if a Wild Magic Surge occurred by rolling a d20
async function getCheckWildMagicSurgeRoll() {
    const wildMagicCheckRoll = await new Roll(`1d6+${spellLevel}`).roll({ async: true });
    const wildMagicCheckTotal = wildMagicCheckRoll.total;
    return wildMagicCheckTotal;
}

// Draw from table in compendium
async function wildMagicSurgeEffectDrawResult() {
    const wildMagicSurgeDrawResult = await new Roll(`1d12+(1+${finalPool})d6kh+${token.actor.system.abilities[attr].value}`).roll({ async: true });
    const total = wildMagicSurgeDrawResult.total;
    return total;
}

async function finalMessage() {
    const wildMagicCheckRoll = await getCheckWildMagicSurgeRoll();
    const wildMagicSurgeDrawResult = await wildMagicSurgeEffectDrawResult();
    const hlt = token.actor.system.abilities.hlt.value;
    const message = `<p>Strain roll is: ${wildMagicCheckRoll} VS Health of ${hlt}.</p><p>If necessary, the ${skillName} check to control the spell is ${wildMagicSurgeDrawResult}</p>`;
    return message;
}

async function sendMessage() {
    return {
        speaker: ChatMessage.getSpeaker(),
        content: await finalMessage()
    };
}
