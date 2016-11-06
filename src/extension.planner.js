
var logger = require('logger');
var buildUtil = require('build.util');
var classname = 'ExtensionPlanner';
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('road.planner');
 * mod.thing == 'a thing'; // true
 */

function getAvailableExtensionsNumber(room) {
    return CONTROLLER_STRUCTURES.extension[room.controller.level];
}

module.exports = {
    checkExtensions: function(){
        if(Game.time % 100 == 10){
            for(var roomName in Game.rooms) {
                var room = Game.rooms[roomName];
                if (room.controller && room.controller.my) {

                    var number = 0;
                    var extensions = room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION);
                        }
                    });
                    number += extensions.length;

                    var extensionsSites = room.find(FIND_CONSTRUCTION_SITES, {
                        filter: (csite) => {
                            return (csite.structureType == STRUCTURE_EXTENSION);
                        }
                    });

                    number += extensionsSites.length;

                    logger.log("Number of extensions: " + number + " (" + extensions.length + ',' + extensionsSites.length + ')', classname);

                    //Availables extensions:
                    var avails = getAvailableExtensionsNumber(room);

                    if(number < avails){
                        //Find 1st spot available around spawn:
                        var res = buildUtil.findBuildPositionInRoom(room,STRUCTURE_EXTENSION);
                        if(res == OK){
                            number++;
                        }
                    }
                }
            }

        }
    }
};