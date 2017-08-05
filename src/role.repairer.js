var constants = require('global.variables');
var direction = require('util.direction');
var logger = require('logger');
var classname = 'RoleRepairer';


Creep.prototype.repairRoads = function(){
    var targets = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return ((structure.structureType == STRUCTURE_ROAD || structure.structureType == STRUCTURE_CONTAINER)  && structure.hits > 0 && structure.hits < (structure.hitsMax * 0.5));
        }
    });

    if(targets.length > 0){
        var _this = this;
        targets.sort(function(a,b){
            return (a.hits  + 50 * _this.pos.getRangeTo(a)) - (b.hits + 50 * _this.pos.getRangeTo(b));
        });

        var target = targets[0];
        var place = target.room.name+'-'+target.pos.x+'-'+target.pos.y;
        logger.log('    target: '+target.pos+' ' + target.hits + '/' + target.hitsMax+ ' '+ this.pos.getRangeTo(target),classname);
        if(this.repair(target) == ERR_NOT_IN_RANGE){
            this.moveTo(target);
        }
        this.memory.lastRepairId = target.id;
        return true;
    }
    return false;
}


Creep.prototype.workRepair =function(){
    if(this.memory.working && this.carry.energy == 0) {
        this.memory.working = false;
    }
    if(!this.memory.working && this.carry.energy == this.carryCapacity) {
        this.memory.working = true;
    }

    if(this.memory.working) {
        //0 continue repair
        if(this.memory.lastRepairId){
            var target = Game.getObjectById(this.memory.lastRepairId);
            if(target && target.room.name == this.room.name){
                if(target && target.hits < target.hitsMax){
                    if(this.repair(target) == ERR_NOT_IN_RANGE){
                        this.moveTo(target);
                    }
                    return ;
                }else{
                    this.memory.lastRepairId = undefined;
                }
            }else{
                this.memory.lastRepairId = undefined;
            }
        }


        //1 Fix strucures with less than 10k
        if(this.room.controller && this.room.controller.my){
            if(this.pos.x == 49 || this.pos.y==49 || this.pos.x ==0 || this.pos.x ==49){
                this.moveTo(this.room.controller);
                return;
            }

            var targets = this.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.hits < 10000) && (structure.hits > 0) && structure.hits < (structure.hitsMax*0.8) && structure.structureType != STRUCTURE_ROAD)
                }
            });

            if(targets.length == 0){
                //2 fix top roads with less than 50%
                if(!this.repairRoads()){
                    //3 Fix structures according to priority and hitpoints %
                    targets = this.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.hits > 0 && structure.hits < (structure.hitsMax * 0.8) && structure.structureType != STRUCTURE_ROAD)
                        }
                    });

                    var priorities = {tower:1.0,extension:1.0,constructedWall:5,rampart:4.5,road:2,container:3};
                    var _this = this;
                    targets.sort(function(a,b){
                        return (priorities[a.structureType] * (a.hits + 200 * _this.pos.getRangeTo(a))) - (priorities[b.structureType] * (b.hits + 200 * _this.pos.getRangeTo(b)));
                    });


                    var target = targets[0];

                    if(target){
                        logger.log('    target: '+target+' ' + target.hits + ' ' + (target.hits + 200 * this.pos.getRangeTo(target)) + ' '+ this.pos.getRangeTo(target),classname);
                        if(this.repair(target) == ERR_NOT_IN_RANGE){
                            this.moveTo(target);
                        }
                        this.memory.lastRepairId = target.id;
                    }else{
                        logger.debug('No target',classname);
                        this.memory.role_override = 'builder';
                        this.memory.role_override_time = Game.time + 300;
                        return;
                    }
                }
            }else{ //repair targets
                var _this = this;
                targets.sort(function(a,b){
                    return (a.hits  + 200 * _this.pos.getRangeTo(a)) - (b.hits + 200 * _this.pos.getRangeTo(b));
                });

                var target = targets[0];
                logger.log('    target: '+target+' ' + target.hits + ' ' + target.hitsMax+ ' '+ this.pos.getRangeTo(target),classname);

                if(this.repair(target) == ERR_NOT_IN_RANGE){
                    this.moveTo(target);
                }
                this.memory.lastRepairId = target.id;
            }
        }else{
            //NOT in current room
            if(!this.repairRoads()){
                this.moveToRoom(this.memory.mainroom);
            }
        }
    }
    else {
        this.memory.lastRepairId = undefined;
        //TODO NOT IMPLEMENTED
        /*if(this.memory.extern && this.room.name == this.memory.mainroom){
         direction.moveToRoom(creep,constants.rooms().others[this.memory.mainroom][this.memory.externRoom]);
         }else{
         direction.findSourceInRoom(creep);
         }*/
        this.findSourceInRoom();
    }
};