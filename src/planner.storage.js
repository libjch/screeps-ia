
var logger = require('logger');
var buildUtil = require('util.build');
var classname = 'StoragePlanner';
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

Room.prototype.checkStorage = function(){
    if (this.controller && this.controller.my && getAvailableStorageNumber(this) > 0) {
        var number = 0;
        var storage = this.storage;
        if(storage){
            logger.debug('Storage already exists '+this.name,classname);
            return;
        }
        var storagesSites = room.find(FIND_CONSTRUCTION_SITES, {
            filter: (csite) => {
                return (csite.structureType == STRUCTURE_STORAGE);
            }
        });
        number += storagesSites.length;

        if (number >= getAvailableStorageNumber(this)) {
            logger.debug('Storage CSite already exists '+this.name,classname);
            return;
        }
        logger.debug('Build storage! '+this.name,classname);
        this.findBuildPositionInRoom(STRUCTURE_STORAGE);
    }
};