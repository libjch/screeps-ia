var constants = require('global.variables');
var direction = require('direction.util');
var logger = require('logger');

var roleExtractor = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }
        if(creep.memory.working) {
            //Transfer to closest container

            if(creep.room.controller.my){
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] < structure.storeCapacity && creep.pos.getRangeTo(structure) < 5)
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
                direction.moveToRoom(creep,(constants.rooms().others[creep.memory.mainroom])[creep.memory.externRoom]);
            }else{
                if(!creep.memory.extractor){
                    creep.memory.extractor = {};
                }

                if(!creep.memory.extractor.sourceId){

                    var sources = creep.room.find(FIND_SOURCES,{filter: (source) => { return Memory.extractors[source.id].creep == undefined}});
                    if(sources.length){
                        var source = sources[0];
                        Memory.extractors[source.id] = creep.id;
                        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(source);
                        }
                    }
                }else{
                    var source = Game.getObjectById(creep.memory.extractor.sourceId);
                    if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source);
                    }
                }
                //direction.findSourceInRoom(creep);
            }
        }
    },

    cleanExtractors: function(){
        for(var roomName in Game.rooms){
            var room = Game.rooms[roomName];
            if(room.controller.my){
                var sources = room.find(FIND_SOURCES);
                for(let source of sources) {
                    if (!Memory.extractors[source.id]) {
                        Memory.extractors[source.id] = {};
                    }
                    if (Memory.extractors[source.id].creep) {
                        if (!Game.getObjectById(Memory.extractors[source.id].creep)) {
                            Memory.extractors[source.id].creep = undefined;
                        }
                    }
                    if (!Memory.extractors[source.id].container || !Game.getObjectById(Memory.extractors[source.id].container)) {
                        var containers = source.pos.findInRange(FIND_STRUCTURES,5, {
                            filter: { structureType: STRUCTURE_CONTAINER }
                        });

                        if(containers.length){
                            containers.sort(function(a,b){
                                return (source.pos.getRangeTo(a)) - (source.pos.getRangeTo(b));
                            });
                            var container = containers[0];
                            Memory.extractors[source.id].container = container.id;
                        }
                    }

                }
            }
        }
    }
};

module.exports = roleExtractor;
