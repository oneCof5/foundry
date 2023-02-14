
const level = args[0].spellLevel;
const actorD = game.actors.get(args[0].actor._id);
let moreMinions = Math.floor((level-2)/2);

function greetings(token){
    
    const actions = ['appears','splats','flatulates','sneezes','coughs','snorts','whistles','laughs','giggles','points','dances','hums','sings','waves','burps','grunts','naps']
    ChatMessage.create({ content: `<img src="${token.data.img}" width="30" height="30" style="border:0px">${token.name} ${actions[Math.floor(Math.random()*actions.length)]}.` });
    
}


//prep summoning area
async function myEffectFunction(template) {
    new Sequence()
        .effect()
            .file('modules/jb2a_patreon/Library/2nd_Level/Misty_Step/MistyStep_01_Regular_Orange_400x400.webm')
            .atLocation(template)
            .center()
            .JB2A()
            .scale(.7)
        .play()
}

//bring in our minion
async function postEffects(template, token) {
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

const options = {controllingActor: actor};

//summon token
for (var summonType in summonList){
    if (summonList[summonType] > 0){
        for (let i = 0; i < summonList[summonType]; i++) {
            let updates = {
                token : {
                   "alpha":0,
                   "name":`${summonType} of ${actorD.name}`,
                },
                actor: {
                   "name":`${summonType} of ${actorD.name}`,
                }
            }

            await warpgate.spawn(summonType, updates, callbacks, options);

            }
    }
}