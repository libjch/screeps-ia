
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
    return CONTROLLER_STRUCTURES.storage[room.controller.level];
}

module.exports = {
    checkStorage: function(){
        for(var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if (room.controller && room.controller.my && room.controller.level >= 4) {

                var number = 0;
                var storages = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE);
                    }
                });

                number += storages.length;
                if (number > getAvailableTowersNumber(room)) {
                    return;
                }

                var storagesSites = room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (csite) => {
                        return (csite.structureType == STRUCTURE_TOWER);
                    }
                });

                number += storagesSites.length;

                if (number > getAvailableTowersNumber(room)) {
                    return;
                }

                //Find 1st spot available around spawn:
                var res = buildUtil.findBuildPositionInRoom(room, STRUCTURE_STORAGE);
            }
        }

    }

};