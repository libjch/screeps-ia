var constants = require('global.variables');
var direction = require('direction.util');


var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        /*if(creep.room.name == constants.rooms().main){
            //Detect if must add road here
            /if(creep.room.createConstructionSite(creep.pos.x,creep.pos.y, STRUCTURE_ROAD) == 0){
                console.log('Added road');
            }
        }*/

        if(creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = false;
        }
        if(!creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = true;
        }
        if(creep.memory.harvesting) {

            if(creep.room.name == constants.rooms().main){
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
                });
                var priorities = {tower:1,extension:2,spawn:3};

                targets.sort(function(a,b){
                    var pA = priorities[a.structureType];
                    var pB = priorities[b.structureType];
                    if(pA == pB){
                        return (creep.pos.getRangeTo(a)) - (creep.pos.getRangeTo(b));
                    }else{
                        return pA - pB;
                    }
                });


                if(targets.length > 0) {
                    console.log('    target: '+targets[0].structureType + ' ' + creep.pos.getRangeTo(targets[0]));

                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }else{
                    creep.moveTo(30+creep.memory.number,6);

                    /*
                     var targets = creep.room.find(FIND_STRUCTURES, {
                     filter: (structure) => {
                     return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] < structure.storeCapacity)
                     }
                     });
                     targets.sort(function(a,b){
                     return (creep.pos.getRangeTo(a)) - (creep.pos.getRangeTo(b));
                     });

                     if(targets.length > 0) {
                     console.log('    target: '+targets[0].structureType + ' ' + creep.pos.getRangeTo(targets[0]));

                     if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                     creep.moveTo(targets[0]);
                     }
                     }else{
                     creep.moveTo(30+creep.memory.number,6);
                     }*/
                }
            }
            else{
                //NOT in current room
                direction.moveToRoom(creep,constants.rooms().main);
            }
        }
        else{
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] >= 50)
                }
            });
            var target = targets[0];

            console.log('Container targers:'+ target);
            if(target.transfer(creep,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    }
};

module.exports = roleHarvester;
