
var logger = require('logger');
var classname = 'RoadPlanner';
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('road.planner');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    checkRoads: function(){
        if(Game.time % 100 == 0){
            for(var roomName in Game.rooms) {
                var room = Game.rooms[roomName];
                if (room.controller && room.controller.my) {
                    var sources = room.find(FIND_SOURCES);

                    //Build roads from sources to controller
                    for (let source of sources) {
                        var path = room.findPath(source.pos, room.controller.pos, {ignoreCreeps: true});
                        for (let i = 0; i < 20 && i < path.length; i++) {
                            var res = room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
                            if(res != ERR_INVALID_TARGET){
                                logger.debug("Create road:" +res ,classname);
                            }
                        }
                    }
                }
            }

        }
    }
};