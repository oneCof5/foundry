// use this if the table is in the sidebar.
const table = game.tables.getName("Gray Bag of Tricks");

// use this if the table is in a compendium.
//const tableKey = "key of the compendium that has the table";
//const tableName = "Gray Bag of Tricks";
//const pack = game.packs.get(tableKey);
//const tableId = pack.index.find(i => i.name === tableName)._id;
//const table = await pack.getDocument(tableId);

// draw items from compendium or sidebar.
if(!table ) return ui.notifications.warn("Missing table.");
const {results} = await table.draw();
console.log('results: ', results);
let summonType = results[0].data.text;
console.log("summonType", summonType);

function greetings(token){    
    const actions = ['appears','splats','flatulates','sneezes','coughs','snorts','whistles','laughs','giggles','points','dances','hums','sings','waves','burps','grunts','naps']
    ChatMessage.create({ content: `<img src="${token.data.img}" width="30" height="30" style="border:0px">${token.name} ${actions[Math.floor(Math.random()*actions.length)]}.` });
}


//prep summoning area
async function myEffectFunction(template) {
    new Sequence()
//        .sound()
//            .file("/assets/sounds/firewoosh.ogg")
        .effect()
            .file('modules/jb2a_patreon/Library/2nd_Level/Misty_Step/MistyStep_01_Regular_Orange_400x400.webm')
            .atLocation(template)
            .center()
            .JB2A()
            .scale(.7)
            //.belowTokens()
        .play()
}

async function postEffects(template, token) {
//bring in our minion
new Sequence()
    .animation()
        .on(token)
            .fadeIn(500)

    .play()
}

const callbacks = {
    pre: async (template,update) => {
        myEffectFunction(template);
        await warpgate.wait(500);
    },
    post: async (template, token) => {
    postEffects(template,token);
    await warpgate.wait(500);
    greetings(token);
    }
};

const updates = {
    token : {
        "alpha":0
    }
}

const options = {controllingActor: actor};

// summon token
await warpgate.spawn(summonType, updates, callbacks, options);