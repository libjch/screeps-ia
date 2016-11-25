var logger = require('logger');
var classname = 'DirectionUtil';

Creep.prototype.moveToFatigue = function(obj){
        if(!this.fatigue){
            this.moveTo(obj,{reusePath: 10});
        }
}

Creep.prototype.moveToFatigue = function(x,y){
    if(!this.fatigue){
        return this.moveTo(x,y,{reusePath: 10});
    }else{
        return ERR_TIRED;
    }
}


Creep.prototype.moveToRoom = function(targetRoom){
    logger.info('Move from '+this.room.name+' to '+targetRoom,classname);
    var exitDir = this.room.findExitTo(targetRoom);
    var exit = this.pos.findClosestByPath(exitDir);
    logger.debug('Change room other: '+ this.moveToFatigue(exit)+' '+targetRoom+' from '+this.room.name,classname);
}

Creep.prototype.findSourceInRoom = function(){
    if(this.room.controller.my){
        if(!this.room.memory.sources){
            this.room.memory.sources = [];
            for(let source of this.room.find(FIND_SOURCES)){
                this.room.memory.sources.push(source.id);
            }
        }

        var targetContainer = undefined;
        var targetContainerScore = 0;

        for(let sourceId of this.room.memory.sources){
            var source = Game.getObjectById(sourceId);
            //logger.debug('Source : '+source.id+' '+Memory.extractors[source.id]+' '+Memory.extractors[source.id].creep,classname);

            if(!Memory.extractors[source.id]){
                logger.error('Unknow source: '+source.id,classname);
            }
            else if(Memory.extractors[source.id].container){
                //get resource from container:
                var container = Game.getObjectById(Memory.extractors[source.id].container);

                var score = container.store[RESOURCE_ENERGY] - 15 * this.pos.getRangeTo(container);
                //logger.info('Score :'+score+' '+container.store[RESOURCE_ENERGY]+'  '+this.pos.getRangeTo(container));
                if(score > targetContainerScore){
                    targetContainerScore = score;
                    targetContainer = container;
                }
            }
        }
        if(targetContainer && targetContainerScore > 0){
            if(this.withdraw(targetContainer,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveToFatigue(targetContainer);
            }
            return;
        }
        if(this.room.storage){
            if(this.room.storage.store[RESOURCE_ENERGY] > 100000){
                if(this.withdraw(this.room.storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(this.room.storage);
                }
                return;
            }
        }
    }
    logger.warn('No sources from extractor',classname);

    if(!this.room.controller.my && this.room.controller.owner) {
        var targets = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0);
            }
        });
        if(targets){
            var targetContainer = targets[0];
            if(targetContainer.transfer(creep,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveToFatigue(targetContainer);
            }
            return;
        }
    }

    var sources = this.room.find(FIND_SOURCES,{filter: (source) => { return source.energy > 0}});//Memory.extractors[source.id].creep == undefined}});
    if(sources.length){
        var sourceNumber = this.memory.number % sources.length;
        var source = sources[sourceNumber];
        logger.info('SourceNumber: '+sourceNumber+' '+source+' '+sources+' '+this.memory.number+' '+sources.length,classname);
        if(source.energy < source.energyCapacity * 0.4  && source.pos.getRangeTo(this.pos) > 4){
            sourceNumber = (sourceNumber + 1) % sources.length;
        }
        var res = this.harvest(sources[sourceNumber]);
        logger.log('source:'+sources[sourceNumber]+' '+res+' '+(res == -1),classname);
        if(res == ERR_NOT_IN_RANGE) {
            this.moveToFatigue(sources[sourceNumber]);
        }
    }
}