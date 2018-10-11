//var constants = require('global.variables');
var direction = require('util.direction');
var logger = require('logger');
var classname = 'RoleExtractor';

/** @param {Creep} creep **/

Creep.prototype.workExtract = function(){
    if(this.memory.working && this.carry.energy == 0) {
        this.memory.working = false;
    }
    if(!this.memory.working && this.carry.energy == this.carryCapacity) {
        this.memory.working = true;
    }
    if(this.memory.working && this.memory.extractor ) {
        //Transfer to closest container
        if(this.room.name == this.memory.mainroom) {
            var target = Game.getObjectById(this.memory.extractor.containerId);
            var sourceId = this.memory.extractor.sourceId;
            if(target == undefined && Memory.extractors[sourceId].containerCS){
                target = Game.getObjectById(Memory.extractors[sourceId].containerCS);
                if(this.build(target) == ERR_NOT_IN_RANGE) {
                    this.moveTo(target);
                }
                logger.log('Extrator building container '+target);
                return;
            }
            if (this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                logger.error('extractor  move ' + this.moveTo(target) + ' ' + this.pos + ' ' + target.pos,classname);
            }
        }else {
            if (this.room.name != this.memory.mainroom) {
                this.moveToRoom(this.memory.mainroom);
            }
        }
    }
    else{ //NOT buidling/transfering
        if(this.memory.extern && this.room.name == this.memory.mainroom){
            this.moveToRoom(this.memory.externRoom);
        }else{
            if(!this.memory.extractor){
                this.memory.extractor = {};
            }
            if(!this.memory.extractor.sourceId){
                logger.warn('Assigning source to extractor');
                var sources = this.room.find(FIND_SOURCES,{filter: (source) => { return Memory.extractors[source.id].creep == undefined}});
                if(sources.length){
                    var source = sources[0];
                    Memory.extractors[source.id].creep = this.id;
                    this.memory.extractor.sourceId = source.id;
                    this.memory.extractor.containerId = Memory.extractors[source.id].container;
                    if(this.harvest(source) == ERR_NOT_IN_RANGE) {
                        this.moveTo(source);
                    }
                }
            }else{
                var source = Game.getObjectById(this.memory.extractor.sourceId);
                Memory.extractors[source.id].creep = this.id;
                if(this.harvest(source) == ERR_NOT_IN_RANGE) {
                    this.moveTo(source);
                }
            }
        }
    }
};

Room.prototype.cleanExtractors = function(){
    logger.error('CLEAN EXTRACTOR',classname);
    if(this.controller && this.controller.my){
        var sources = this.find(FIND_SOURCES);
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
                        logger.info("Building container for source: "+source.id);
                        //Find construction site position:
                        var path = this.findPath(source.pos, this.controller.pos,{ignoreCreeps:true});

                        for(let i = 1;i<4;i++){
                            if(this.createConstructionSite(path[i].x,path[i].y,STRUCTURE_CONTAINER) == OK){
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
};