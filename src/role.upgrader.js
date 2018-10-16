/**
 * Created by libjch on 12/07/16.
 */
var direction = require('util.direction');
var logger = require('logger');
var classname = 'RoleUpgrader';


Creep.prototype.workUpgrade = function(){
    if(this.memory.working && this.carry.energy == 0) {
        this.memory.working = false;
    }
    if(!this.memory.working && this.carry.energy == this.carryCapacity) {
        this.memory.working = true;
    }

    if(this.memory.working) {
        if(this.room.controller && this.room.controller.my && this.memory.mainroom == this.room.name){
            if(this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
                this.moveTo(this.room.controller);
            }
        }else{
            this.moveToRoom(this.memory.mainroom);
        }
    }
    else {
        if(this.room.storage && this.room.storage.store[RESOURCE_ENERGY] >= 50000) {
            if (this.withdraw(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(this.room.storage);
            }
            return;
        }
        this.findSourceInRoom();
    }
};