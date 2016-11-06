var constants = require('global.variables');
var logger = require('logger');

var classname = 'BuildUtil';

module.exports = {
    findBuildPositionInRoom: findBuildPositionInRoom
};


function tryBuildAtPosition(roomSpawn,dx,dxs,dy,dys,structureType){
    var x = roomSpawn.pos.x + (dx*dxs);
    var y = roomSpawn.pos.y + (dy*dys);
    logger.debug("position: "+x+' '+y+' '+(dx%2 == dy%2));
    if(dx%2 == dy%2){ //on the grid
        var res = roomSpawn.room.createConstructionSite(x, y, structureType);
        logger.warn("Create " + structureType+ " at:"+x+' '+y+' '+res,classname);
        return res;
    }
}

function findBuildPositionInRoom(room,structureType){
    logger.debug("Find Build spot in room: "+room);

    var roomSpawn = undefined;
    for(var i in Game.spawns) {
        var spawn = Game.spawns[i];
        if(spawn.room == room){
            roomSpawn = spawn;
            break;
        }
    }
    //Build around spawner
    if(roomSpawn == undefined){
        logger.error('No spawn found for room '+roomName,classname);
        return ERR_NOT_OWNER;
    }

    for(let dist = 1;dist < 12;dist++){
        //X
        for(let dxs = -1; dxs <2;dxs +=2) { //go both ways
            var dx = dist * dxs;
            for(let dy = 0; dy < dist; dy++) {
                for (let dys = -1; dys < 2; dys += 2) { //search both ways
                    if(tryBuildAtPosition(roomSpawn,dx,dxs,dy,dys,roomSpawn,structureType)==OK){
                        return OK;
                    }
                }
            }
        }

        //Y
        for(let dys = -1; dys <2;dys +=2) { //go both ways
            var dy = dist * dys;
            for(let dx = 0; dx < dist; dx++) {
                for (let dxs = -1; dxs < 2; dxs += 2) { //search both ways
                    if(tryBuildAtPosition(roomSpawn,dx,dxs,dy,dys,roomSpawn,structureType)==OK){
                        return OK;
                    }
                }
            }
        }
    }


}
