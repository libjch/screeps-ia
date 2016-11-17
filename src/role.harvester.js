var constants = require('global.variables');
var direction = require('util.direction');
var logger = require('logger');
var classname = 'RoleHarvester';


var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }
        if(creep.memory.working) {
            if(creep.memory.lastHarvestId){
                var target = Game.getObjectById(creep.memory.lastHarvestId);
                if(target && target.room.name == creep.room.name) {
                    if (target.structureType == STRUCTURE_EXTENSION || target.structureType == STRUCTURE_SPAWN || target.structureType == STRUCTURE_TOWER) {
                        if (target.energy < target.energyCapacity) {
                            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveToFatigue(target);
                            }
                            return;
                        } else {
                            creep.memory.lastHarvestId = undefined;
                        }
                    } else if (target.structureType == STRUCTURE_CONTAINER || target.structureType == STRUCTURE_STORAGE) {
                        if (target.store[RESOURCE_ENERGY] < target.storeCapacity) {
                            if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveToFatigue(creep.room.storage);
                            }
                            return;
                        } else {
                            creep.memory.lastHarvestId = undefined;
                        }
                    }
                } else{
                        creep.memory.lastHarvestId = undefined;
                }
            }

            if(creep.room.controller.my){
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity &&
                            (structure.structureType != STRUCTURE_TOWER || structure.energy < structure.energyCapacity*0.8);
                    }
                });
                var priorities = {tower:1,extension:2,spawn:2,container:4};
                targets.sort(function(a,b){
                    var pA = priorities[a.structureType];
                    var pB = priorities[b.structureType];
                    if(pA == pB){
                        return (creep.pos.getRangeTo(a)) - (creep.pos.getRangeTo(b));
                    }else{
                        return pA - pB;
                    }
                });

                logger.info('Targets '+targets,classname);

                if(targets.length > 0) {
                    logger.log('    target: '+targets[0].structureType + ' ' + creep.pos.getRangeTo(targets[0]) +' '+ targets[0].pos+ ' '+ creep.pos,classname);
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveToFatigue(targets[0]);
                    }
                    creep.memory.lastHarvestId = targets[0].id;
                }else{
                    var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] < structure.storeCapacity
                             && !Memory.containers[structure.id])
                        }
                    });

                    targets.sort(function(a,b){
                        return (creep.pos.getRangeTo(a)) - (creep.pos.getRangeTo(b));
                    });

                    if(targets.length > 0) {
                        logger.log('    target: '+targets[0].structureType + ' ' + creep.pos.getRangeTo(targets[0]),classname);
                        if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveToFatigue(targets[0]);
                        }
                        creep.memory.lastHarvestId = targets[0].id;
                    }else{
                        if(creep.room.name != creep.memory.mainroom){
                            direction.moveToRoom(creep,creep.memory.mainroom);
                        }else {
                            if (creep.room.storage) {
                                if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                    creep.moveToFatigue(creep.room.storage);
                                }
                                creep.memory.lastHarvestId = targets[0].id;
                            }else{
                                logger.debug('No target',classname);
                                creep.memory.role_override = 'upgrader';
                                creep.memory.role_override_time = Game.time + 100;
                                return;
                            }
                        }
                    }
                }
            }
            else{
                //NOT in current room
                direction.moveToRoom(creep,creep.memory.mainroom);
            }
        }
        else{ //NOT harvesting
            direction.findSourceInRoom(creep);
        }
    }
};

module.exports = roleHarvester;
