
var logger = require('logger');
var classname = 'RoadPlanner';
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('planner.road');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    checkRoads: function(){
        for(var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if (room.controller && room.controller.my) {
                var sources = room.find(FIND_SOURCES);

                //Build roads from sources to controller
                for (let source of sources) {
                    var path = room.findPath(source.pos, room.controller.pos, {ignoreCreeps: true});
                    for (let i = 0; i < 40 && i < path.length; i++) {
                        var res = room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
                        if(res != ERR_INVALID_TARGET){
                            logger.debug("Create road to controller:" +res ,classname);
                        }
                    }
                }

                var roomSpawn = undefined;
                for(var i in Game.spawns) {
                    logger.warn(i+" "+Game.spawns[i]);
                    var spawn = Game.spawns[i];
                    if(spawn.room.name == room.name){
                        roomSpawn = spawn;
                        break;
                    }
                }
                //Build around spawner
                if(roomSpawn == undefined){
                    logger.error('No spawn found for room '+roomName,classname);
                   continue;
                }

                var path = room.findPath(roomSpawn.pos, room.controller.pos, {ignoreCreeps: true});
                for (let i = 0; i < 40 && i < path.length; i++) {
                    var res = room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
                    if(res != ERR_INVALID_TARGET){
                        logger.debug("Create road to spawnCenter:" +res ,classname);
                    }
                }
            }
        }


    }
};