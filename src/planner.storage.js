
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

function getAvailableStorageNumber(room) {
    return CONTROLLER_STRUCTURES.storage[room.controller.level];
}

module.exports = {
    checkStorage: function(){
        for(var roomName in Game.rooms) {
            var room = Game.rooms[roomName];

            logger.debug('Room: '+room.name);

            if (room.controller && room.controller.my && getAvailableStorageNumber(room) > 0) {
                var number = 0;
                var storage = room.storage;
                if(storage)
                    logger.debug('Storage already exists');
                    return;
                }
                var storagesSites = room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (csite) => {
                        return (csite.structureType == STRUCTURE_STORAGE);
                    }
                });
                number += storagesSites.length;

                if (number >= getAvailableStorageNumber(room)) {
                    logger.debug('Storage CSite already exists');
                    return;
                }
                buildUtil.findBuildPositionInRoom(room, STRUCTURE_STORAGE);
            }
        }
    }
};