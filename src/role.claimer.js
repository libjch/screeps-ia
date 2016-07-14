/**
 * Created by libjch on 12/07/16.
 */
var constants = require('global.variables');


module.exports = {
    run: run
};

function run (creep) {
    //spawn claimer:
    // Game.spawns.Spawn1.createCreep([CLAIM,MOVE,MOVE], 'Claimer', {role: 'role'claimer', extern: true});


    var targetRoom = Game.rooms['E43S38'];

    if(creep.room.name == creep.memory.mainroom){
        var exitDir = creep.room.findExitTo(targetRoom);
        var exit = creep.pos.findClosestByRange(exitDir);
        console.log(creep.moveTo(exit));
        return true;
    }

    if(creep.room.name == targetRoom.name){
        console.log('a '+creep.room.controller);
        creep.moveTo(creep.room.controller);
        if(creep.room.controller) {
            var res = creep.claimController(creep.room.controller);
            console.log('b '+res)
            if(res == ERR_NOT_IN_RANGE) {

                return true;
            }
        }
    }

    return false;
}
