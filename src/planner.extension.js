
var logger = require('logger');
var buildUtil = require('util.build');
var classname = 'ExtensionPlanner';
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('planner.road');
 * mod.thing == 'a thing'; // true
 */

function getAvailableExtensionsNumber(room) {
    return CONTROLLER_STRUCTURES.extension[room.controller.level];
}

Room.prototype.checkExtensions =function(){
    if (this.controller && this.controller.my) {
        var number = 0;
        var extensions = this.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION);
            }
        });
        number += extensions.length;

        var extensionsSites = this.find(FIND_CONSTRUCTION_SITES, {
            filter: (csite) => {
                return (csite.structureType == STRUCTURE_EXTENSION);
            }
        });

        number += extensionsSites.length;

        logger.log("Number of extensions: " + number + " (" + extensions.length + ',' + extensionsSites.length + ')', classname);

        //Availables extensions:
        var avails = getAvailableExtensionsNumber(this);

        if(number < avails){
            //Find 1st spot available around spawn:
            this.findBuildPositionInRoom(STRUCTURE_EXTENSION);
        }
    }
};