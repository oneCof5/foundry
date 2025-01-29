(async () => {
    const token = canvas.tokens.controlled[0];
    if (!token) {
        ui.notifications.error("No token selected.");
        return;
    }

    const animTorch = {"type": "torch", "speed": 2, "intensity": 2, "reverse": false};
    const animBlank = {"type": "", "speed": 5, "intensity": 5, "reverse": false};
    const options = {
        'Torch': {"dim": 40, "bright": 20, "angle": 360, "alpha": 0.05, "animation": animTorch, "color": '#c26824'},
        'Hooden Lantern (Open)': {"dim": 60, "bright": 30, "angle": 360, "alpha": 0.05, "animation": animTorch, "color": '#c26824'},
        'Hooded Lantern (Closed)': {"dim": 5, "bright": 0, "angle": 360, "alpha": 0.05, "animation": animTorch, "color": '#c26824'},
        'Bullseye Lantern': {"dim": 120, "bright": 60, "angle": 60, "alpha": 0.05, "animation": animTorch, "color": '#c26824'},
        'Light': {"dim": 40, "bright": 20, "angle": 360, "alpha": 0.05, "animation": animBlank, "color": '#dbdbdb'},
        'Daylight': {"dim": 120, "bright": 60, "angle": 360, "alpha": 0.05, "animation": animBlank, "color": '#dbdbdb'},
        'Candle': {"dim": 10, "bright": 5, "angle": 360, "alpha": 0.05, "animation": animTorch, "color": '#c26824'},
        'Dusk Lantern': {"dim": 120, "bright": 60, "angle": 60, "alpha": 0.05, "animation": animTorch, "color": '#cf2a35'},
        'Clear': {"dim": 0, "bright": 0, "angle": 360, "alpha": 0.5, 'color': "", "animation": animBlank} 
    }
    const buttons = Object.keys(options).reduce((acc,e)=>{
        acc[e.slugify()] = {label: e, callback: ()=>{return e}};
        return acc;
    },{});
    console.log('buttons: ', buttons);
    const choice  = await Dialog.wait({
        title: "Light options",
        buttons
    });
    console.log('choice: ', choice);
    console.log('options[choice]: ', options[choice]);

    await token.document.update({light:options[choice]});
})();