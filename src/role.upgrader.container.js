/**
 * Created by libjch on 12/07/16.
 */
var constants = require('global.variables');
var direction = require('direction.util');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        console.log("Upgrading: "+creep.carry.energy == creep.carryCapacity+" "+creep.carry.energy +"/"+creep.carryCapacity)
        if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
        }

        if(creep.memory.upgrading) {
            if(creep.room.controller.my){
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }else{
                //NOT in current room
                direction.moveToRoom(creep,creep.memory.mainroom);
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] >= 10)
                }
            });
            targets.sort(function(a,b){
                return (creep.pos.getRangeTo(a)) - (creep.pos.getRangeTo(b));
            });
            var target = targets[0];
            if(target.transfer(creep,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
};

module.exports = roleUpgrader;