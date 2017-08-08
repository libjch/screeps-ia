var constants = require('global.variables');
var direction = require('util.direction');
var logger = require('logger');
var classname = 'RoleBuilder';

Creep.prototype.workBuildRampart = function(){
    if(this.memory.working && this.carry.energy == 0) {
        this.memory.working = false;
        this.memory.role_override = undefined;
        this.findSourceInRoom();
        return;
    }

    if(this.room.controller && this.room.controller.my){
        if(this.pos.x == 49 || this.pos.y==49 || this.pos.x ==0 || this.pos.x ==49){
            this.moveTo(this.room.controller);
            return;
        }
        var targets = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_RAMPART)  && structure.hits < 5000);
            }
        });

        if(targets.length) {
            var target = targets[0];
            if (this.repair(target) == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            }
            this.memory.lastRepairId = target.id;
        } else{
            this.memory.role_override = undefined;
            return;
        }
    }
    else {
        this.memory.role_override = undefined;
        this.findSourceInRoom();
    }
};