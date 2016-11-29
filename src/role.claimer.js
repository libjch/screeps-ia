/**
 * Created by libjch on 12/07/16.
 */
var constants = require('global.variables');
var logger = require('logger');
var classname = 'RoleClaimer';


Creep.prototype.workClaim = function(){
    //spawn claimer:
    // Game.spawns.Spawn1.createCreep([CLAIM,MOVE,MOVE], 'Claimer', {role: 'claimer', extern: true, claimroom: 'E14N18' });

    //Clean the room:
    //Game.rooms['W68S3X'].find(FIND_STRUCTURES).forEach((s) => s.destroy());

    //Add builder helper by defining: Memory.spawner.target

    var targetRoom = Game.rooms[this.memory.claimroom];

    if(!targetRoom || this.room.name !== targetRoom.name){
        this.moveToRoom(this.memory.claimroom);
        return true;
    }

    if(this.room.name == targetRoom.name){
        this.moveTo(this.room.controller);
        if(this.room.controller) {
            var res = this.claimController(this.room.controller);
            if(res == ERR_NOT_IN_RANGE) {
                return true;
            }
        }
    }
    return false;
}
