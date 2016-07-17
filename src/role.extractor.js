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


            if(creep.room.controller.my) {
                var target = Game.getObjectById(creep.memory.extractor.containerId);
                logger.debug('Container : '+target);
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    logger.error('extractor  move ' + creep.moveTo(target) + ' ' + creep.pos + ' ' + target.pos);
                }
            }else {
                if (creep.room.name != creep.memory.mainroom) {
                    direction.moveToRoom(creep, creep.memory.mainroom);
                }
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

                        creep.memory.extractor.sourceId = source.id;
                        creep.memory.extractor.containerId = Memory.extractors[source.id].container;

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
