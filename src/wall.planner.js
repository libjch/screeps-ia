
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

                    //Left wall:
                    var entrances = room.lookForAtArea(LOOK_TERRAIN,0,0,49,0,true);

                    for(let entry of entrances){
                        logger.debug(entry.x+" "+entry.y+" "+entry.structure,classname);
                    }
                }
            }

        }
    }
};