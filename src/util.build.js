var constants = require('global.variables');
var logger = require('logger');

var classname = 'BuildUtil';


function tryBuildAtPosition(roomSpawn,dx,dy,structureType){
    var x = roomSpawn.pos.x + (dx);
    var y = roomSpawn.pos.y + (dy);
    logger.debug("position: "+x+' '+y+' '+(dx%2 == dy%2),classname);
    if(Math.abs(dx%2) == Math.abs(dy%2)){ //on the grid
        if(this.lookForAt(LOOK_FLAGS,x,y).length){
            return ERR_INVALID_TARGET;
        }
        var res = this.createConstructionSite(x, y, structureType);
        logger.warn("Create " + structureType+ " at:"+x+' '+y+' '+res,classname);
        return res;
    }else{
        //Is is swamp?
        if(Game.map.getTerrainAt(x, y, this.name) == 'swamp'){
            this.createConstructionSite(x, y, STRUCTURE_ROAD);
        }
    }
}

Room.prototype.findBuildPositionInRoom = function(structureType){
    logger.debug("Find Build spot in room: "+this,classname);

    var roomSpawn = undefined;
    for(var i in Game.spawns) {
        var spawn = Game.spawns[i];
        if(spawn.room == this){
            roomSpawn = spawn;
            break;
        }
    }
    //Build around spawner
    if(roomSpawn == undefined){
        logger.error('No spawn found for room '+this,classname);
        return ERR_NOT_OWNER;
    }

    for(let dist = 1;dist < 12;dist++){
        //X
        for(let dxs = -1; dxs <2;dxs +=2) { //go both ways
            var dx = dist;
            for(let dy = 0; dy <= dist; dy++) {
                for (let dys = -1; dys < 2; dys += 2) { //search both way
                    if(tryBuildAtPosition(roomSpawn,dx*dxs,dy*dys,structureType)==OK){
                        return OK;
                    }
                }
            }
        }

        //Y
        for(let dys = -1; dys <2;dys +=2) { //go both ways
            var dy = dist;
            for(let dx = 0; dx <= dist; dx++) {
                for (let dxs = -1; dxs < 2; dxs += 2) { //search both ways
                    if(tryBuildAtPosition(roomSpawn,dx*dxs,dy*dys,structureType)==OK){
                        return OK;
                    }
                }
            }
        }
    }
}
