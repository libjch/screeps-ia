var constants = require('global.variables');
var direction = require('util.direction');
var logger = require('logger');
var classname = 'RoleHarvester';


Creep.prototype.workHarvest = function(){
    if(this.memory.working && this.carry.energy == 0) {
        this.memory.working = false;
    }
    if(!this.memory.working && this.carry.energy == this.carryCapacity) {
        this.memory.working = true;
    }
    if(this.memory.working) {
        if(this.memory.lastHarvestId){
            var target = Game.getObjectById(this.memory.lastHarvestId);
            if(target && target.room.name == this.room.name) {
                if (target.structureType == STRUCTURE_EXTENSION || target.structureType == STRUCTURE_SPAWN || target.structureType == STRUCTURE_TOWER) {
                    logger.log("Going to the same place");
                    if (target.energy < target.energyCapacity) {
                        if (this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            this.moveTo(target);
                        }
                        return;
                    } else {
                        logger.log("Previous target already full");
                        this.memory.lastHarvestId = undefined;
                    }
                } else if (target.structureType == STRUCTURE_CONTAINER || target.structureType == STRUCTURE_STORAGE) {
                    if (target.store[RESOURCE_ENERGY] < target.storeCapacity) {
                        logger.log("Going to the same place 2");
                        if (this.transfer(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            this.moveTo(this.room.storage);
                        }
                        return;
                    } else {
                        logger.log("Previous target already full 2");
                        this.memory.lastHarvestId = undefined;
                    }
                }
            } else{
                logger.log("Previous target not in room");
                this.memory.lastHarvestId = undefined;
            }
        }

        if(this.room.controller.my){
            var targets = this.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity &&
                        (structure.structureType != STRUCTURE_TOWER || structure.energy < structure.energyCapacity*0.8);
                }
            });
            var priorities = {tower:1,extension:2,spawn:2,container:4};
            var _this = this;
            targets.sort(function(a,b){
                var pA = priorities[a.structureType];
                var pB = priorities[b.structureType];
                if(pA == pB){
                    return (_this.pos.getRangeTo(a)) - (_this.pos.getRangeTo(b));
                }else{
                    return pA - pB;
                }
            });

            logger.info('Targets '+targets,classname);

            if(targets.length > 0) {
                logger.log('    target: '+targets[0].structureType + ' ' + this.pos.getRangeTo(targets[0]) +' '+ targets[0].pos+ ' '+ this.pos,classname);
                if(this.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(targets[0]);
                }
                this.memory.lastHarvestId = targets[0].id;
            }else{
                var targets = this.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] < structure.storeCapacity
                        && !Memory.containers[structure.id])
                    }
                });
                var _this = this;
                targets.sort(function(a,b){
                    return (_this.pos.getRangeTo(a)) - (_this.pos.getRangeTo(b));
                });

                if(targets.length > 0) {
                    logger.log('    target: '+targets[0].structureType + ' ' + this.pos.getRangeTo(targets[0]),classname);
                    if(this.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        this.moveTo(targets[0]);
                    }
                    this.memory.lastHarvestId = targets[0].id;
                }else{
                    if(this.room.name != this.memory.mainroom){
                        this.moveToRoom(this.memory.mainroom);
                    }else {
                        if (this.room.storage) {
                            if (this.transfer(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                this.moveTo(this.room.storage);
                            }
                            this.memory.lastHarvestId = this.room.storage.id;
                        }else{
                            logger.debug('No target',classname);
                            this.memory.role_override = 'upgrader';
                            this.memory.role_override_time = Game.time + 100;
                            return;
                        }
                    }
                }
            }
        }
        else{
            //NOT in current room
            this.moveToRoom(this.memory.mainroom);
        }
    }
    else{ //NOT harvesting
        logger.log("Need to refill");
        if(this.memory.lastHarvestId)
            this.memory.lastHarvestId = undefined;

        if(this.room.storage && this.room.storage.store[RESOURCE_ENERGY] > 100 &&  ((this.room.storage.store[RESOURCE_ENERGY] >= 5000 && this.body.length < 14) || (Memory.attacker.target && this.room.energyAvailable < this.room.energyCapacityAvailable))) {
            if (this.withdraw(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(this.room.storage);
            }
            return;
        }
        this.findSourceInRoom();
    }
};

