var constants = require('global.variables');
var logger = require('logger');

var classname = 'DirectionUtil';

module.exports = {
    moveToRoom: moveToRoom,
    findSourceInRoom: findSourceInRoom
};


Creep.prototype.moveToFatigue = function(obj){
        if(!this.fatigue){
            this.moveTo(obj);
        }
}

Creep.prototype.moveToFatigue = function(x,y){
    if(!this.fatigue){
        this.moveTo(x,y);
    }
}



function moveToRoom(creep,targetRoom){
    logger.info('Move from '+creep.room.name+' to '+targetRoom,classname);
    var exitDir = creep.room.findExitTo(targetRoom);
    var exit = creep.pos.findClosestByPath(exitDir);
    logger.debug('Change room other: '+ creep.moveTo(exit)+' '+targetRoom+' from '+creep.room.name,classname);
}

function findSourceInRoom(creep){
    logger.info("FindSourceInRange",classname);

    if(creep.room.controller.my){
        if(!creep.room.memory.sources){
            creep.room.memory.sources = [];
            for(let source of creep.room.find(FIND_SOURCES)){
                creep.room.memory.sources.push(source.id);
            }
        }

        var targetContainer = undefined;
        var targetContainerScore = 0;

        for(let sourceId of creep.room.memory.sources){
            var source = Game.getObjectById(sourceId);
            //logger.debug('Source : '+source.id+' '+Memory.extractors[source.id]+' '+Memory.extractors[source.id].creep,classname);

            if(!Memory.extractors[source.id]){
                logger.error('Unknow source: '+source.id,classname);
            }
            else if(Memory.extractors[source.id].container){
                //get resource from container:
                var container = Game.getObjectById(Memory.extractors[source.id].container);

                var score = container.store[RESOURCE_ENERGY] - 15 * creep.pos.getRangeTo(container);
                //logger.info('Score :'+score+' '+container.store[RESOURCE_ENERGY]+'  '+creep.pos.getRangeTo(container));
                if(score > targetContainerScore){
                    targetContainerScore = score;
                    targetContainer = container;
                }
            }
        }
        if(targetContainer && targetContainerScore > 0){
            if(creep.withdraw(targetContainer,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveToFatigue(targetContainer);
            }
            return;
        }
        if(creep.room.storage){
            if(creep.room.storage.store[RESOURCE_ENERGY] > 1000){
                if(creep.withdraw(creep.room.storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
                return;
            }
        }
    }
    logger.warn('No sources from extractor',classname);

    if(!creep.room.controller.my && creep.room.controller.owner) {
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0);
            }
        });
        if(targets){
            var targetContainer = targets[0];
            if(targetContainer.transfer(creep,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveToFatigue(targetContainer);
            }
            return;
        }
    }

    var sources = creep.room.find(FIND_SOURCES,{filter: (source) => { return source.energy > 0}});//Memory.extractors[source.id].creep == undefined}});
    if(sources.length){
        var sourceNumber = creep.memory.number % sources.length;
        var source = sources[sourceNumber];
        logger.info('SourceNumber: '+sourceNumber+' '+source+' '+sources+' '+creep.memory.number+' '+sources.length,classname);
        if(source.energy < source.energyCapacity * 0.4  && source.pos.getRangeTo(creep.pos) > 4){
            sourceNumber = (sourceNumber + 1) % sources.length;
        }
        var res = creep.harvest(sources[sourceNumber]);
        logger.log('source:'+sources[sourceNumber]+' '+res+' '+(res == -1),classname);
        if(res == ERR_NOT_IN_RANGE) {
            creep.moveToFatigue(sources[sourceNumber]);
        }
    }
}