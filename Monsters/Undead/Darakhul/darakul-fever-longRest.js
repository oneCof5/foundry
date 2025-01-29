console.log('LONG REST DF SAVE MACRO');
console.log('effect: ', effect);
console.log('actor: ', actor);
console.log('character: ',character);
console.log('token: ',token);
console.log('scene: ',scene);
console.log('origin: ',origin);
console.log('speaker: ',speaker);
console.log('item: ',item);

await game.MonksTokenBar.requestRoll([{
  "token": token.name}], // "Aeris"
  {request: [{
    "type":"save",
    "key":"con",
    "count":1
  }],
  dc: 17,
  silent: true,
  fastForward: false,
  flavor: "Darakhul Fever Save",
  rollMode: 'gmroll'
});