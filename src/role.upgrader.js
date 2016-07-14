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
            if(creep.memory.extern && creep.room.name == creep.memory.mainroom){
                direction.moveToRoom(creep,constants.rooms().others[creep.memory.externRoom]);
            }else{
                var sources = creep.room.find(FIND_SOURCES,{filter: (source) => { return source.energy > 0}});
                if(creep.harvest(sources[creep.memory.number % sources.length]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[creep.memory.number % sources.length]);
                }
            }
        }
    }
};

module.exports = roleUpgrader;