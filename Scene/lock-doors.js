/*
Lock all Doors
*/
canvas.walls.updateAll(w => ({ds: w.data.ds === CONST.WALL_DOOR_STATES.LOCKED ? CONST.WALL_DOOR_STATES.CLOSED : CONST.WALL_DOOR_STATES.LOCKED}), w => w.data.door === CONST.WALL_DOOR_TYPES.DOOR);
