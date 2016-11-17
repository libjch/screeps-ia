/**
 * Created by libjch on 12/07/16.
 */
var direction = require('util.direction');
var logger = require('logger');
var classname = 'RoleUpgrader';

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if(creep.memory.working) {
            if(creep.room.controller.my && creep.memory.mainroom == creep.room.name){
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveToFatigue(creep.room.controller);
                }
            }else{
                direction.moveToRoom(creep,creep.memory.mainroom);
            }
        }
        else {
            if(creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] >= 50000) {
                if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveToFatigue(creep.room.storage);
                }
                return;
            }
            direction.findSourceInRoom(creep);
        }
    }
};

module.exports = roleUpgrader;