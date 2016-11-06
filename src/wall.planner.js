
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


module.exports = {
    checkWalls: function(){
        if(true || Game.time % 100 == 30){
            for(var roomName in Game.rooms) {
                var room = Game.rooms[roomName];
                if (room.controller && room.controller.my) {
                    //var exits = Game.map.describeExits(roomName);

                    var spawns = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
                    var spawn = spawns[0];
                    logger.debug(spawn+" "+spawn.pos,classname);

                    var exit = spawn.pos.findClosestByPath(FIND_EXIT_LEFT);
                    logger.debug(exit,classname);

                    //Left wall:
                    var entrances = room.lookForAtArea(LOOK_TERRAIN,0,0,49,0);
                    var x = 0;
                    for(let y = 0;y<49;y++){
                        if(entrances[y][0] == 'plain'){

                            if(y == exit.y){
                                var res = room.createConstructionSite(x,y,STRUCTURE_RAMPART);
                                if(res != ERR_INVALID_TARGET){
                                    logger.debug("Create Rampart:" +res ,classname);
                                }
                            }else{
                                var res = room.createConstructionSite(x,y,STRUCTURE_WALL);
                                if(res != ERR_INVALID_TARGET){
                                    logger.debug("Create wall:" +res ,classname);
                                }
                            }
                        }
                    }
                }
            }

        }
    }
};