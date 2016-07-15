var constants = require('global.variables');
var logger = require('logger');

module.exports = {
    moveToRoom: moveToRoom,
    findSourceInRoom: findSourceInRoom
};


function moveToRoom(creep,targetRoom){
    logger.info('Move from '+creep.room.name+' to '+targetRoom);

    var targetPos = undefined;
    if(creep.room.name == 'E42S38'){
        if(targetRoom == 'E43S38'){
            targetPos = creep.room.getPositionAt(49,14);
        }else if(targetRoom == 'E42S39'){
            targetPos = creep.room.getPositionAt(26,49);
        }else if(targetRoom == 'E41S38'){
            targetPos = creep.room.getPositionAt(0,15);
        }else if(targetRoom == 'E43S37'){
            targetPos = creep.room.getPositionAt(49,14);
        }
    }else if(creep.room.name == 'E43S38'){
        if(targetRoom == 'E42S38'){
            targetPos = creep.room.getPositionAt(0,16);
        }else if(targetRoom == 'E43S37'){
            targetPos = creep.room.getPositionAt(31,0);
        }else if(targetRoom == 'E44S38'){
            targetPos = creep.room.getPositionAt(49,30);
        }
    }else if(creep.room.name == 'E41S38'){
        if(targetRoom == 'E42S38'){
            targetPos = creep.room.getPositionAt(49,18);
        }
    }else if(creep.room.name == 'E42S39'){
        if(targetRoom == 'E42S38'){
            targetPos = creep.room.getPositionAt(28,0);
        }
    }else if(creep.room.name == 'E43S37'){
        if(targetRoom == 'E42S38'){
            targetPos = creep.room.getPositionAt(31,49);
        }else if(targetRoom == 'E43S38'){
            targetPos = creep.room.getPositionAt(31,49);
        }else if(targetRoom == 'E44S38'){
            targetPos = creep.room.getPositionAt(31,49);
        }
    }else if(creep.room.name == 'E44S38'){
        if(targetRoom == 'E42S38'){
            targetPos = creep.room.getPositionAt(0,30);
        }else if(targetRoom == 'E43S38'){
            targetPos = creep.room.getPositionAt(0,30);
        }else if(targetRoom == 'E43S37'){
            targetPos = creep.room.getPositionAt(0,30);
        }
    }
    console.log(targetPos+' '+creep.room.name+' '+targetRoom);
    if(targetPos != undefined){
        logger.debug('Change room '+creep.moveTo(targetPos)+' '+targetPos+' from '+creep.room.name);
    }else{
        var exitDir = creep.room.findExitTo(constants.rooms().others[creep.memory.mainroom][creep.memory.externRoom]);
        var exit = creep.pos.findClosestByPath(exitDir);
        logger.debug('Change room other: '+ creep.moveTo(exit)+' '+targetPos+' from '+creep.room.name);
    }
}

function findSourceInRoom(creep){
    logger.info("FindSourceInRange");
    var sources = creep.room.find(FIND_SOURCES,{filter: (source) => { return source.energy > 0}});


    var sourceNumber = creep.memory.number % sources.length;
    var source = sources[sourceNumber];

    logger.info('SourceNumber: '+sourceNumber+' '+source+' '+sources+' '+creep.memory.number+' '+sources.length);
    if(source.energy < source.energyCapacity * 0.4  && source.pos.getRangeTo(creep.pos) > 4){
        sourceNumber = (sourceNumber + 1) % sources.length;
    }

    //console.log('x ' + sources + ' ' + sources[creep.memory.number % sources.length]);
    if(creep.harvest(sources[sourceNumber]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[sourceNumber]);
    }
}