// console.log('args: ', args[0]);
if (args[0].tag === "OnUse") {
    const actorD = game.actors.get(args[0].actorData._id);
    const level = args[0].spellLevel;
    const summonerPb = actorD.data.data.attributes.prof;
    const classLvl = actorD._classes.sorcerer.data.data.levels;
    const undeadThralls = actorD.data.items.filter(i => i.name === "Undead Thralls").length;
    const upcastNumber = (level - 3) * 2; // upcast is plus 2 per higher spell level
    const number = 1 + undeadThralls + upcastNumber;
    const dmgBonus = undeadThralls === 1 ? summonerPb : 0;
    const hpSkellie = 13 + classLvl
    const hpZombie = 22 + classLvl

    const buttonData = {
        buttons: [
            {
                label: "Skeleton",
                value: {
                    actor: {
                        "name": "Animated Skeleton",
                        "data": {
                            "attributes": {
                                "hp": {
                                    "value": `${hpSkellie}`,
                                    "max": `${hpSkellie}`,
                                    "formula": `2d8 + 4 + ${classLvl}`
                                }
                            }
                        }
                    },
                    embedded: {
                        Item: {
                            "Rusted Shortsword": {
                                "type": "weapon",
                                "img": "icons/weapons/swords/sword-guard-brown.webp",
                                // 'data.damage.parts': [[`1d6[piercing]+@mod+${summonerPb} `,'piercing']],
                                "data": {
                                    "description": {
                                        "value": `<p><em>Melee Weapon Attack:</em> +4 to hit, reach 5 ft., one target. <em>Hit:</em> 5 (1d6 + 2 + ${summonerPb}) piercing damage.</p>`,
                                        "chat": "<p>Proficiency with a shortsword allows you to add your proficiency bonus to the attack roll for any attack you make with it.</p>",
                                        "unidentified": "Shortsword"
                                    },
                                    "quantity": 1,
                                    "weight": 2,
                                    "price": 10,
                                    "attunement": 0,
                                    "equipped": true,
                                    "rarity": "common",
                                    "identified": true,
                                    "activation": {
                                        "type": "action",
                                        "cost": 1
                                    },
                                    "target": {
                                        "value": 1,
                                        "type": "creature"
                                    },
                                    "range": {
                                        "value": 5,
                                        "units": "ft"
                                    },
                                    "actionType": "mwak",
                                    "attackBonus": "0",
                                    "damage": {
                                        "parts": [
                                            [`1d6[piercing] + @mod + ${dmgBonus}`, "piercing"]
                                        ]
                                    },
                                    "weaponType": "martialM",
                                    "baseItem": "shortsword",
                                    "properties": {
                                        "fin": true,
                                        "lgt": true
                                    },
                                    "proficient": true
                                }
                            },
                            "Battered Shortbow": {
                                "type": "weapon",
                                "img": "icons/weapons/bows/shortbow-recurve.webp",
                                "data": {
                                    "description": {
                                        "value": `<p><em>Ranged Weapon Attack:</em> +4 to hit, range 80/320 ft., one target. <em>Hit:</em> 5 (1d6 + 2 + ${summonerPb}) piercing damage.</p>`,
                                        "chat": "<p>Proficiency with a shortbow allows you to add your proficiency bonus to the attack roll for any attack you make with it.</p>",
                                        "unidentified": "Shortbow"
                                    },
                                    "quantity": 1,
                                    "weight": 2,
                                    "price": 25,
                                    "attunement": 0,
                                    "equipped": true,
                                    "rarity": "common",
                                    "identified": true,
                                    "activation": {
                                        "type": "action",
                                        "cost": 1
                                    },
                                    "target": {
                                        "value": 1,
                                        "type": "creature"
                                    },
                                    "range": {
                                        "value": 80,
                                        "long": 320,
                                        "units": "ft"
                                    },
                                    "actionType": "rwak",
                                    "attackBonus": "0",
                                    "damage": {
                                        "parts": [
                                            [`1d6[piercing] + @mod + ${dmgBonus}`, "piercing"]
                                        ]
                                    },
                                    "weaponType": "simpleR",
                                    "baseItem": "shortbow",
                                    "properties": { // "amm": true,
                                        "fir": true,
                                        "two": true
                                    },
                                    "proficient": true
                                }
                            }
                        }
                    }
                }
            }, {
                label: "Zombie",
                value: {
                    actor: {
                        "name": "Animated Zombie",
                        "data": {
                            "attributes": {
                                "hp": {
                                    "value": `${hpZombie}`,
                                    "max": `${hpZombie}`,
                                    "formula": `3d8 + 9 + ${classLvl}`
                                }
                            }
                        }
                    },
                    embedded: {
                        Item: {
                            "Slam": {
                                "type": "feat",
                                "img": "icons/skills/melee/unarmed-punch-fist-blue.webp",
                                "data": {
                                    "description": {
                                        "value": "<em>Melee Weapon Attack</em>: +3 to hit, reach 5 ft., one target. <em>Hit</em>: 4 (1d6 + 1) bludgeoning damage."
                                    },
                                    "activation": {
                                        "type": "action"
                                    },
                                    "ability": "str",
                                    "actionType": "mwak",
                                    "damage": {
                                        "parts": [
                                            [`1d8[force] + ${dmgBonus}`, "force"]
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }

            }
        ]
    };

    for (let i = 0; i < number; i++) {
        buttonData.title = `Animating which type? (${
            i + 1
        } of ${number})`;
        const choice = await warpgate.buttonDialog(buttonData);
        console.log('choice: ', choice);
        if (choice === true) 
            return;
        
        await warpgate.spawn(choice.actor.name, choice);
    }

}
