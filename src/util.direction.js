var logger = require('logger');
var classname = 'DirectionUtil';


Creep.prototype._moveTo = Creep.prototype.moveTo;


Creep.prototype.moveTo = function(obj){
        if(!this.fatigue){
            this._moveTo(obj,{reusePath: 10});
        }
}

Creep.prototype.moveTo = function(x,y){
    if(!this.fatigue){
        return this._moveTo(x,y,{reusePath: 10});
    }else{
        return ERR_TIRED;
    }
}

Creep.prototype.moveToIgnoreCreeps = function (x,y) {
    if(!this.fatigue){
        return this._moveTo(x,y,{reusePath: 3,ignoreCreeps: true});
    }else{
        return ERR_TIRED;
    }
}


Room.prototype.findExitTo2 = function(target){
    if(target == 'E2S9' && this.name == 'E3S9' ){
        return this.getPositionAt(13,49);
    }
    if(target == 'E2S9' && this.name == 'E3S10' ){
        return this.getPositionAt(0,22);
    }
    return this.findExitTo(target);
}

Creep.prototype.moveToRoom = function(targetRoom){
    logger.log('Move from '+this.room.name+' to '+targetRoom,this.name);

    if(targetRoom == 'E2S6'){
        if(this.room.name == 'E3S8'){
            this.moveToRoom('E4S8');
            return;
        }
        if(this.room.name == 'E4S7'){
            this.moveToRoom('E4S6');
            return;
        }
        if(this.room.name == 'E3S7'){
            this.moveToRoom('E4S7');
            return;
        }
        if(this.room.name ==  'E4S8'){
            this.moveToRoom('E4S7');
            return;
        }
    } else if(targetRoom == 'E3S8'){
        if(this.room.name == 'E3S9'){
            this.moveTo(Game.rooms['E3S8'].getPositionAt(3,21));
            return;
        }
    } else if(targetRoom =='E2S9'){
        if(this.room.name == 'E3S9'){
            this.moveTo(Game.rooms['E3S10'].getPositionAt(3,21));
            return;
        }
        if(this.room.name == 'E3S10') {
            this.moveTo(Game.rooms['E2S10'].getPositionAt(3, 21));
            return;
        }
        if(this.room.name == 'E3S10' && this.pos.y == 0){
            this.move(BOTTOM);
            return;
        }
        if(this.room.name == 'E2S10'){
            this.moveTo(Game.rooms[targetRoom].controller);
            return;
        }
    }
        if(Game.rooms[targetRoom] && Game.rooms[targetRoom].controller){
            logger.debug('Change room other: '+ this.moveTo(Game.rooms[targetRoom].controller)+' '+targetRoom+' from '+this.room.name,this.name);
        }else{
            var exitDir = this.room.findExitTo2(targetRoom);
            var exit = this.pos.findClosestByPath(exitDir);
            logger.debug('Change room other: '+ this.moveTo(exit)+' '+targetRoom+' from '+this.room.name+" exitDir: "+exitDir+" exit:"+exit,this.name);
        }
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
                logger.error('Unknow source: '+source.id,this.name);
            }
            else if(Memory.extractors[source.id].container){
                //get resource from container:
                var container = Game.getObjectById(Memory.extractors[source.id].container);
                if(container) {
                    var score = container.store[RESOURCE_ENERGY] - 15 * this.pos.getRangeTo(container);
                    //logger.info('Score :'+score+' '+container.store[RESOURCE_ENERGY]+'  '+this.pos.getRangeTo(container));
                    if (score > targetContainerScore) {
                        targetContainerScore = score;
                        targetContainer = container;
                    }
                }else{
                    logger.warn('Extractor container is not available anymore')
                    Memory.extractors[source.id].container = undefined;
                }
            }
        }
        if(targetContainer && targetContainerScore > 0){
            if(this.withdraw(targetContainer,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(targetContainer);
            }
            return;
        }
        if(this.room.storage){
            if(this.room.storage.store[RESOURCE_ENERGY] > 100000 || Memory.attacker.target){
                if(this.withdraw(this.room.storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(this.room.storage);
                }
                return;
            }
        }
    }
    logger.warn('No sources from extractor',this.name);

    if(!this.room.controller.my && this.room.controller.owner) {
        var targets = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0);
            }
        });
        if(targets){
            var targetContainer = targets[0];
            if(targetContainer.transfer(creep,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(targetContainer);
            }
            return;
        }
    }

    var sources = this.room.find(FIND_SOURCES,{filter: (source) => { return source.energy > 0}});

    logger.warn('Sources' +sources);
    if(sources.length){
        var sourceNumber = this.memory.number % sources.length;
        var source = sources[sourceNumber];
        logger.warn('SourceNumber: '+sourceNumber+' '+source+' '+sources+' '+this.memory.number+' '+sources.length,this.name);
        if(source.energy < source.energyCapacity * 0.4  && source.pos.getRangeTo(this.pos) > 4){
            sourceNumber = (sourceNumber + 1) % sources.length;
        }
        if(this.harvest(sources[sourceNumber]) == ERR_NOT_IN_RANGE) {
            this.moveTo(sources[sourceNumber]);
        }
    }
}
