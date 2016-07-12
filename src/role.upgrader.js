/**
 * Created by libjch on 12/07/16.
 */
var constants = require('global.variables');
var direction = require('direction.util');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        /*if(creep.room.name == constants.rooms().main){
         //Detect if must add road here
         //var place = creep.room.name+'-'+creep.pos.x+'-'+creep.pos.y;
         if(creep.room.createConstructionSite(creep.pos.x,creep.pos.y, STRUCTURE_ROAD) == 0){
         console.log('Added road');
         }
         }*/

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        console.log("Upgrading: "+creep.carry.energy == creep.carryCapacity+" "+creep.carry.energy +"/"+creep.carryCapacity)
        if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
        }

        if(creep.memory.upgrading) {
            if(creep.room.name == 'E42S38'){
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }else{
                //NOT in current room
                direction.moveToRoom(creep,constants.rooms().main);
            }
        }
        else {
            if(creep.memory.extern && creep.room.name == constants.rooms().main){
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