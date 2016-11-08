
var logger = require('logger');
var buildUtil = require('util.build');
var classname = 'WallPlanner';
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('planner.road');
 * mod.thing == 'a thing'; // true
 */

function getAvailableTowersNumber(room) {
    return CONTROLLER_STRUCTURES.link[room.controller.level];
}

module.exports = {
    checkTowers: function(){
        for(var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if (room.controller && room.controller.my) {
                var avails = getAvailableTowersNumber(room);
                if(avails > 0) {
                    return;
                }
                var number = 0;
                var extensions = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_LINK);
                    }
                });
                number += extensions.length;
                if(avails>number){
                    return;
                }
                var extensionsSites = room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (csite) => {
                        return (csite.structureType == STRUCTURE_LINK);
                    }
                });
                number += extensionsSites.length;

                logger.log("Number of links: " + number + " (" + extensions.length + ',' + extensionsSites.length + ')', classname);

                //Availables extensions:

                if(number < avails){
                    //Find 1st spot available around spawn:

                    //TODO Here
                }

            }
        }

    }

};