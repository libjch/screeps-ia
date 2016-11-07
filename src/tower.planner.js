
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

function getAvailableTowersNumber(room) {
    return CONTROLLER_STRUCTURES.tower[room.controller.level];
}

module.exports = {
    checkTowers: function(){
        for(var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if (room.controller && room.controller.my) {

                var number = 0;
                var extensions = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER);
                    }
                });
                number += extensions.length;

                var extensionsSites = room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (csite) => {
                        return (csite.structureType == STRUCTURE_TOWER);
                    }
                });

                number += extensionsSites.length;

                logger.log("Number of towsers: " + number + " (" + extensions.length + ',' + extensionsSites.length + ')', classname);

                //Availables extensions:
                var avails = getAvailableTowersNumber(room);

                if(number < avails){
                    //Find 1st spot available around spawn:
                    var res = buildUtil.findBuildPositionInRoom(room,STRUCTURE_TOWER);
                    if(res == OK){
                        number++;
                    }
                }
            }
        }

    }

};