/**
 * Created by libjch on 12/07/16.
 */
var direction = require('util.direction');
var logger = require('logger');
var classname = 'RoleHealer';


Creep.prototype.workHeal = function(){
    var damagedCreep = this.pos.findNearest(Game.MY_CREEPS, {
        filter: function(object) {
            return object !== this && object.hits < object.hitsMax;
        }
    });
    if (this.hits < this.hitsMax - 100 /* no more heal */) {
        this.moveTo(Game.spawns.Spawn1);
        this.heal(damagedCreep);
        return;
    }

    if(damagedCreep) {
        this.moveTo(damagedCreep);
        this.heal(damagedCreep);
        return;
    }

    if(Memory.attacker.ready){
        if(this.room.name != this.memory.targetRoom){
            var exitDir = this.room.findExitTo(this.memory.targetRoom);
            var exit = this.pos.findClosestByRange(exitDir);
            this.moveTo(exit);
            logger.log("No creep main room "+exit,classname);
            return;
        }
    }else{
        this.moveTo(Game.flags['attack-meeting']);
    }

};