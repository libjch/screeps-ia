//var constants = require('global.variables');
var direction = require('util.direction');
var logger = require('logger');
var classname = 'RoleExtractor';

var roleExtractor = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }
        if(creep.memory.working && creep.memory.extractor ) {
            //Transfer to closest container
            if(creep.room.name == creep.memory.mainroom) {
                var target = Game.getObjectById(creep.memory.extractor.containerId);
                var sourceId = creep.memory.extractor.sourceId;
                if(target == undefined && Memory.extractors[sourceId].containerCS){
                    target = Game.getObjectById(Memory.extractors[sourceId].containerCS);
                    if(creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveToFatigue(target);
                    }
                    logger.log('Extrator building container '+target);
                    return;
                }
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    logger.error('extractor  move ' + creep.moveToFatigue(target) + ' ' + creep.pos + ' ' + target.pos,classname);
                }
            }else {
                if (creep.room.name != creep.memory.mainroom) {
                    direction.moveToRoom(creep, creep.memory.mainroom);
                }
            }
        }
        else{ //NOT buidling/transfering
            if(creep.memory.extern && creep.room.name == creep.memory.mainroom){
                direction.moveToRoom(creep,creep.memory.externRoom);
            }else{
                if(!creep.memory.extractor){
                    creep.memory.extractor = {};
                }
                if(!creep.memory.extractor.sourceId){
                    logger.warn('Assigning source to extractor');
                    var sources = creep.room.find(FIND_SOURCES,{filter: (source) => { return Memory.extractors[source.id].creep == undefined}});
                    if(sources.length){
                        var source = sources[0];
                        Memory.extractors[source.id].creep = creep.id;
                        creep.memory.extractor.sourceId = source.id;
                        creep.memory.extractor.containerId = Memory.extractors[source.id].container;
                        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                            creep.moveToFatigue(source);
                        }
                    }
                }else{
                    var source = Game.getObjectById(creep.memory.extractor.sourceId);
                    Memory.extractors[source.id].creep = creep.id;
                    if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveToFatigue(source);
                    }
                }
            }
        }
    },

    cleanExtractors: function(){

        logger.error('CLEAN EXTRACTOR',classname);
        Memory.containers = {};

        for(var roomName in Game.rooms){
            var room = Game.rooms[roomName];
            if(room.controller && room.controller.my){
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
                        var containers = source.pos.findInRange(FIND_STRUCTURES,3, {
                            filter: { structureType: STRUCTURE_CONTAINER }
                        });

                        if(containers.length){
                            containers.sort(function(a,b){
                                return (source.pos.getRangeTo(a)) - (source.pos.getRangeTo(b));
                            });
                            var container = containers[0];
                            Memory.extractors[source.id].container = container.id;
                        }else{
                            containers = source.pos.findInRange(FIND_CONSTRUCTION_SITES,3, {
                                filter: { structureType: STRUCTURE_CONTAINER }
                            });
                            if(containers.length) {
                                containers.sort(function (a, b) {
                                    return (source.pos.getRangeTo(a)) - (source.pos.getRangeTo(b));
                                });
                                var container = containers[0];
                                Memory.extractors[source.id].containerCS = container.id;
                            }else{
                                //Build Container!

                                //Find construction site position:
                                var path = room.findPath(source.pos, room.controller.pos,{ignoreCreeps:true});

                                for(let i = 1;i<4;i++){
                                    if(room.createConstructionSite(path[i].x,path[i].y,STRUCTURE_CONTAINER) == OK){
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    if(Memory.extractors[source.id].container){
                        Memory.containers[Memory.extractors[source.id].container] = true;
                    }

                }
            }
        }
    }
};

module.exports = roleExtractor;
