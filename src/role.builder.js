var constants = require('global.variables');
var direction = require('util.direction');
var logger = require('logger');
var classname = 'RoleBuilder';

Creep.prototype.workBuild = function(){
    if(this.memory.working && this.carry.energy == 0) {
        this.memory.working = false;
    }
    if(!this.memory.working && this.carry.energy == this.carryCapacity) {
        this.memory.working = true;
    }

    if(this.memory.working) {
        if( this.pos.x == 49 || this.pos.y==49 || this.pos.x ==0 || this.pos.y==0){
            logger.log('escape '+this.moveTo(this.room.controller),classname);
            return;
        }

        if(this.memory.lastBuildId){
            var target = Game.getObjectById(this.memory.lastBuildId);
            if(target && target.progress){
                if(this.build(target) == ERR_NOT_IN_RANGE){
                    this.moveTo(target);
                }
                return ;
            }else{
                this.memory.lastBuildId = undefined;
            }
        }

        if(this.room.name == this.memory.mainroom) {
            var targets = this.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (constructionSite) => {
                    return constructionSite.my > 0
                }
            });
            var priorities = {
                spawn: 1,
                tower: 1,
                extension: 2,
                constructedWall: 3,
                rampart: 4,
                road: 8,
                container: 6,
                storage: 9
            };

            if (targets.length == 0) {
                this.memory.role_override = 'upgrader';
                this.memory.role_override_time = Game.time + 300;
                return;
            } else {
                var _this = this;
                targets.sort(function (a, b) {
                    var pA = priorities[a.structureType];
                    var pB = priorities[b.structureType];
                    if (pA == pB) {
                        return (_this.pos.getRangeTo(a)) - (_this.pos.getRangeTo(b));
                    } else {
                        return pA - pB;
                    }
                });

                if (targets.length) {
                    var target = targets[0];
                    var res = this.build(target);

                    if(target.structureType == STRUCTURE_RAMPART && res == OK){
                        this.memory.role_override = 'repairer';
                        this.memory.role_override_time = Game.time + 10;
                        logger.warn('Building rampart for 10 ticks!');
                    }

                    if (res == ERR_NOT_IN_RANGE) {
                        this.moveTo(target);
                    } else {
                        logger.warn('Cant build: ' + target + " with res:" + res, classname);
                    }
                    this.memory.lastBuildId = target.id;
                }
            }
        }else{
            //NOT in current room
            logger.log('get back',classname);
            this.moveToRoom(this.memory.mainroom);
        }
    }
    else {
        this.memory.lastBuildId = undefined;
        this.findSourceInRoom();
    }
};