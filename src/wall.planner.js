
var logger = require('logger');
var buildUtil = require('build.util');
var classname = 'WallPlanner';
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('road.planner');
 * mod.thing == 'a thing'; // true
 */
var spawn = undefined;

function checkAndBuild(room,x,y,type){
    var existing = undefined;

    existing = room.lookForAt(LOOK_TERRAIN,x,y);
    if(existing == 'wall'){
        //logger.warn('Already a wall at '+x+' '+y,classname);
        return;
    }

    existing = room.lookForAt(LOOK_CONSTRUCTION_SITES,x,y);
    if(existing.length){
        //logger.warn('Existing CS at '+x+' '+y,classname);
        return;
    }
    existing = room.lookForAt(LOOK_STRUCTURES,x,y);
    if(existing.length){
        //logger.warn('Existing STR at '+x+' '+y,classname);
        return;
    }

    var path = spawn.pos.findPathTo(x,y);
    if(path.length) {

        var res = "";
        for(let step of path){
            res += "("+step.x+','+step.y+')';
        }
        console.log('Path find to '+x+' '+y+' '+res);

        //room.createConstructionSite(x, y, type);
    }
    else{
        logger.warn('No path found to '+x+' '+y,classname);
    }
}

module.exports = {
    checkWalls: function(){
        if(true || Game.time % 100 == 30){
            for(var roomName in Game.rooms) {
                var room = Game.rooms[roomName];
                if (room.controller && room.controller.my) {
                    //var exits = Game.map.describeExits(roomName);

                    var spawns = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
                    spawn = spawns[0];
                    logger.debug(spawn+" "+spawn.pos,classname);

                    {//Left wall:
                        var exit = spawn.pos.findClosestByPath(FIND_EXIT_LEFT);
                        logger.debug(exit,classname);

                        var entrances = room.lookForAtArea(LOOK_TERRAIN, 0, 0, 49, 0);
                        var x = 2;
                        for (let y = 0; y < 49; y++) {
                            if (entrances[y][0] == 'plain') {
                                if (entrances[y - 1][0] == 'wall') {
                                    //new border
                                    checkAndBuild(room,x, y - 1, STRUCTURE_WALL);
                                    checkAndBuild(room,x, y - 2, STRUCTURE_WALL);
                                    checkAndBuild(room,x - 1, y - 2, STRUCTURE_WALL);
                                }
                                if (entrances[y + 1][0] == 'wall') {
                                    //last of a border
                                    checkAndBuild(room,x, y + 1, STRUCTURE_WALL);
                                    checkAndBuild(room,x, y + 2, STRUCTURE_WALL);
                                    checkAndBuild(room,x - 1, y + 2, STRUCTURE_WALL);
                                }
                                if (y == exit.y) {
                                    //logger.debug('Create Rampart? '+x+' '+y);
                                    var res = checkAndBuild(room,x, y, STRUCTURE_RAMPART);
                                    //if(res != ERR_INVALID_TARGET){
                                    //logger.debug("Create Rampart:" + res, classname);
                                    //}
                                } else {
                                    var res = checkAndBuild(room,x, y, STRUCTURE_WALL);
                                    //if(res != ERR_INVALID_TARGET){
                                    //logger.debug("Create wall:" + res, classname);
                                    //}
                                }
                            }
                        }
                    }
                    {//Right wall:
                        var exit = spawn.pos.findClosestByPath(FIND_EXIT_RIGHT);
                        logger.debug(exit,classname);

                        var entrances = room.lookForAtArea(LOOK_TERRAIN, 0, 49, 49, 49);
                        var x = 47;
                        for (let y = 0; y < 49; y++) {
                            if (entrances[y][49] == 'plain') {
                                if (entrances[y - 1][49] == 'wall') {
                                    //new border
                                    checkAndBuild(room,x, y - 1, STRUCTURE_WALL);
                                    checkAndBuild(room,x, y - 2, STRUCTURE_WALL);
                                    checkAndBuild(room,x + 1, y - 2, STRUCTURE_WALL);
                                }
                                if (entrances[y + 1][49] == 'wall') {
                                    //last of a border
                                    checkAndBuild(room,x, y + 1, STRUCTURE_WALL);
                                    checkAndBuild(room,x, y + 2, STRUCTURE_WALL);
                                    checkAndBuild(room,x + 1, y + 2, STRUCTURE_WALL);
                                }
                                if (y == exit.y) {
                                    //logger.debug('Create Rampart? '+x+' '+y);
                                    var res = checkAndBuild(room,x, y, STRUCTURE_RAMPART);
                                    //if(res != ERR_INVALID_TARGET){
                                    //logger.debug("Create Rampart:" + res, classname);
                                    //}
                                } else {
                                    var res = checkAndBuild(room,x, y, STRUCTURE_WALL);
                                    //if(res != ERR_INVALID_TARGET){
                                    //logger.debug("Create wall:" + res, classname);
                                    //}
                                }
                            }
                        }
                    }
                    {//Top wall:
                        var exit = spawn.pos.findClosestByPath(FIND_EXIT_TOP);
                        logger.debug(exit,classname);
                        var entrances = room.lookForAtArea(LOOK_TERRAIN, 0, 0, 0, 49);
                        var y = 2;
                        for (let x = 0; x < 49; x++) {
                            if (entrances[0][x] == 'plain') {
                                if (entrances[0][x-1] == 'wall') {
                                    //new border
                                    checkAndBuild(room,x - 1, y, STRUCTURE_WALL);
                                    checkAndBuild(room,x - 2, y, STRUCTURE_WALL);
                                    checkAndBuild(room,x - 2, y - 1, STRUCTURE_WALL);
                                }
                                if (entrances[0][x+1] == 'wall') {
                                    //last of a border
                                    checkAndBuild(room,x+1, y, STRUCTURE_WALL);
                                    checkAndBuild(room,x+2, y, STRUCTURE_WALL);
                                    checkAndBuild(room,x+2, y - 1, STRUCTURE_WALL);
                                }
                                if (x == exit.x) {
                                    //logger.debug('Create Rampart? '+x+' '+y);
                                    var res = checkAndBuild(room,x, y, STRUCTURE_RAMPART);
                                    //if(res != ERR_INVALID_TARGET){
                                    //logger.debug("Create Rampart:" + res, classname);
                                    //}
                                } else {
                                    var res = checkAndBuild(room,x, y, STRUCTURE_WALL);
                                    //if(res != ERR_INVALID_TARGET){
                                    //logger.debug("Create wall:" + res, classname);
                                    //}
                                }
                            }
                        }
                    }
                    {//Top wall:
                        var exit = spawn.pos.findClosestByPath(FIND_EXIT_BOTTOM);
                        logger.debug(exit,classname);
                        var entrances = room.lookForAtArea(LOOK_TERRAIN, 49, 0, 49, 49);
                        var y = 47;
                        for (let x = 0; x < 49; x++) {
                            if (entrances[49][x] == 'plain') {
                                if (entrances[49][x-1] == 'wall') {
                                    //new border
                                    checkAndBuild(room,x - 1, y, STRUCTURE_WALL);
                                    checkAndBuild(room,x - 2, y, STRUCTURE_WALL);
                                    checkAndBuild(room,x - 2, y + 1, STRUCTURE_WALL);
                                }
                                if (entrances[49][x+1] == 'wall') {
                                    //last of a border
                                    checkAndBuild(room,x+1, y, STRUCTURE_WALL);
                                    checkAndBuild(room,x+2, y, STRUCTURE_WALL);
                                    checkAndBuild(room,x+2, y + 1, STRUCTURE_WALL);
                                }
                                if (x == exit.x) {
                                    //logger.debug('Create Rampart? '+x+' '+y);
                                    var res = checkAndBuild(room,x, y, STRUCTURE_RAMPART);
                                    //if(res != ERR_INVALID_TARGET){
                                    //logger.debug("Create Rampart:" + res, classname);
                                    //}
                                } else {
                                    var res = checkAndBuild(room,x, y, STRUCTURE_WALL);
                                    //if(res != ERR_INVALID_TARGET){
                                    //logger.debug("Create wall:" + res, classname);
                                    //}
                                }
                            }
                        }
                    }

                }
            }

        }
    }
};