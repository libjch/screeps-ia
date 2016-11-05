var constants = require('global.variables');
var direction = require('direction.util');
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
            logger.info('Harvseting',classname);
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
                        var res = logger.log('g '+creep.moveTo(targets[0]),classname);
                        if(res == -2){
                            logger.log('a '+creep.moveTo(7,45),classname);
                        }
                    }
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
                            logger.log('b '+creep.moveTo(targets[0]),classname);
                        }
                    }else{
                        if(creep.room.name != creep.memory.mainroom){
                            direction.moveToRoom(creep,creep.memory.mainroom);
                        }else {
                            //if(creep.room.name == 'E43S38'){
                            //    creep.memory.role = 'builder';
                            //}
                            if (creep.room.storage) {
                                if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                    logger.log('s ' + creep.moveTo(creep.room.storage),classname);
                                }
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
            if(creep.memory.extern && creep.room.name == creep.memory.mainroom){
                logger.info(creep.memory.mainroom+" "+creep.memory.externRoom+" "+(constants.rooms().others[creep.memory.mainroom])+" "+(constants.rooms().others[creep.memory.mainroom])[creep.memory.externRoom],classname);
                direction.moveToRoom(creep,(constants.rooms().others[creep.memory.mainroom])[creep.memory.externRoom]);
            }else{
                direction.findSourceInRoom(creep);
            }
        }
    }
};

module.exports = roleHarvester;
