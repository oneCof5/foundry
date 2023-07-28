//DAE Macro Execute, Effect Value = "Macro Name" @target
console.log(args);
const target = canvas.tokens.get(args[1]).document;
if(!target) return;
const messageContent = `${target.name} turns invisible`;
const flavor = "Greater Invisibility"
const speaker = ChatMessage.getSpeaker();
let whisper = null;

if (args[0] === "on") {
    target.update({ "hidden": true });
    if(game.user.isGM) { whisper = ChatMessage.getWhisperRecipients("GM"); } 
    ChatMessage.create({ content: messageContent, flavor: flavor, speaker: speaker, whisper: whisper });
}

if (args[0] === "off") {
    if(game.user.isGM) { whisper = ChatMessage.getWhisperRecipients("GM"); } 
    ChatMessage.create({ content: messageContent, flavor: flavor, speaker: speaker, whisper: whisper });
    target.update({ "hidden": false });
}