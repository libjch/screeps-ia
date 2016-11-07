/**
 * Created by libjch on 12/07/16.
 */
var constants = require('global.variables');
var logger = require('logger');
var classname = 'RoleClaimer';

module.exports = {
    run: run
};

function run (creep) {
    //spawn claimer:
    // Game.spawns.Spawn1.createCreep([CLAIM,MOVE,MOVE], 'Claimer', {role: 'claimer', extern: true});


    var targetRoom = Game.rooms['E14N18'];

    if(creep.room.name !== targetRoom.name){
        var exitDir = creep.room.findExitTo(targetRoom);
        var exit = creep.pos.findClosestByRange(exitDir);
        logger.log(creep.moveTo(exit),classname);
        return true;
    }

    if(creep.room.name == targetRoom.name){
        logger.log('a '+creep.room.controller,classname);
        creep.moveTo(creep.room.controller);
        if(creep.room.controller) {
            var res = creep.claimController(creep.room.controller);
            logger.log('b '+res,classname)
            if(res == ERR_NOT_IN_RANGE) {

                return true;
            }
        }
    }

    return false;
}
