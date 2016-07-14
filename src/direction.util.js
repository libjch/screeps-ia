var constants = require('global.variables');
var logger = require('logger');

module.exports = {
    moveToRoom: moveToRoom,
};


function moveToRoom(creep,targetRoom){
    logger.info('Move from '+creep.room.name+' to '+targetRoom);

    var targetPos = undefined;
    if(creep.room.name == 'E42S38'){
        if(targetRoom == 'E43S38'){
            targetPos = creep.room.getPositionAt(49,14);
        }else if(targetRoom == 'E42S39'){
            targetPos = creep.room.getPositionAt(26,49);
        }else if(targetRoom = 'E41S38'){
            targetPos = creep.room.getPositionAt(0,18);
        }else if(targetRoom = 'E43S37'){
            targetPos = creep.room.getPositionAt(49,14);
        }
    }else if(creep.room.name == 'E43S38'){
        if(targetRoom == 'E42S38'){
            targetPos = creep.room.getPositionAt(0,16);
        }else if(targetRoom = 'E43S37'){
            targetPos = creep.room.getPositionAt(26,0);
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
            targetPos = creep.room.getPositionAt(26,49);
        }else if(targetRoom = 'E43S38'){
            targetPos = creep.room.getPositionAt(26,49);
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