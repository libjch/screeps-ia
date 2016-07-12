var constants = require('global.variables');


module.exports = {
    moveToRoom: moveToRoom,
};


function moveToRoom(creep,targetRoom){
    var targetPos = undefined;
    if(creep.room.name == 'E42S38'){
        if(targetRoom == 'E43S38'){
            targetPos = creep.room.getPositionAt(49,14);
        }else if(targetRoom == 'E42S39'){
            targetPos = creep.room.getPositionAt(26,49);
        }else if(targetRoo = 'E41S38'){
            targetPos = creep.room.getPositionAt(0,18);
        }
    }else if(creep.room.name == 'E43S38'){
        if(targetRoom == 'E42S38'){
            console.log('ici');
            targetPos = creep.room.getPositionAt(0,16);
        }
    }else if(creep.room.name == 'E41S38'){
        if(targetRoom == 'E42S38'){
            targetPos = creep.room.getPositionAt(49,18);
        }
    }else if(creep.room.name == 'E42S39'){
        if(targetRoom == 'E42S38'){
            targetPos = creep.room.getPositionAt(28,0);
        }
    }
    console.log(targetPos+' '+creep.room.name+' '+targetRoom);
    if(targetPos != undefined){
        console.log(creep.moveTo(targetPos),' '+targetPos);
    }else{
        var exitDir = creep.room.findExitTo(constants.rooms().others[creep.memory.externRoom]);
        var exit = creep.pos.findClosestByPath(exitDir);
        console.log(creep.moveTo(exit));
    }
}