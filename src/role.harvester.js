var constants = require('global.variables');
var direction = require('direction.util');
var logger = require('logger');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = false;
        }
        if(!creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = true;
        }
        if(creep.memory.harvesting) {
            logger.info('Harvseting');
            if(creep.room.controller.my){

                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
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

                logger.info('Targets '+targets);

                if(targets.length > 0) {
                    console.log('    target: '+targets[0].structureType + ' ' + creep.pos.getRangeTo(targets[0]) +' '+ targets[0].pos+ ' '+ creep.pos);

                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        var res = console.log('g '+creep.moveTo(targets[0]));
                        if(res == -2){
                            console.log('a '+creep.moveTo(7,45));
                        }
                    }
                }else{

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
                            console.log('b '+creep.moveTo(targets[0]));
                        }
                    }else{
                        if(creep.room.name != creep.memory.mainroom){
                            direction.moveToRoom(creep,creep.memory.mainroom);
                        }else{
                            //if(creep.room.name == 'E43S38'){
                            //    creep.memory.role = 'builder';
                            //}

                            console.log('c '+creep.moveTo(30+creep.memory.number % 11,6));
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
                logger.info(creep.memory.mainroom+" "+creep.memory.externRoom+" "+(constants.rooms().others[creep.memory.mainroom])+" "+(constants.rooms().others[creep.memory.mainroom])[creep.memory.externRoom]);

                direction.moveToRoom(creep,(constants.rooms().others[creep.memory.mainroom])[creep.memory.externRoom]);
            }else{
                var sources = creep.room.find(FIND_SOURCES,{filter: (source) => { return source.energy > 0}});
                console.log('x ' + sources + ' ' + sources[creep.memory.number % sources.length]);
                if(creep.harvest(sources[creep.memory.number % sources.length]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[creep.memory.number % sources.length]);
                }
            }
        }
    }
};

module.exports = roleHarvester;
