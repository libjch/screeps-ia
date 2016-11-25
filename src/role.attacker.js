var constants = require('global.variables');
var directionUtil = require('util.direction');
var logger = require('logger');
var classname = 'RoleAttacker';

Creep.prototype.findEnemyCreep = function(){
    var targets = this.room.find(FIND_HOSTILE_CREEPS);//, {filter: function(enemy){!enemy.my}});
    if(targets){
        return this.pos.findClosestByPath(targets);
    }
    return undefined;
};

Creep.prototype.findEnemyStructure = function(){
    var targets = this.room.find(FIND_STRUCTURES, {
        filter: function(object) {
            if (object.my) {
                return false;
            }
            if (object.structureType !== STRUCTURE_TOWER && object.structureType !== STRUCTURE_SPAWN && object.structureType !== STRUCTURE_EXTENSION) {
                return false;
            }
            return true;
        }
    });

    //1 try with towers:
    for(let structType of [STRUCTURE_TOWER,STRUCTURE_SPAWN,STRUCTURE_EXTENSION]){
        var targs = _.filter(targets, (t) => t.structureType == structType);
        var best = this.pos.findClosestByPath(targs);
        if(best){
            return best;
        }
    }
    logger.warn("No eney struct found: "+targets+' / '+ _.filter(targets, (t) => t.structureType == 'tower'));
    return undefined;
};

Creep.prototype.findEnemyConstructionSite = function(){
    var targets = this.room.find(FIND_HOSTILE_CONSTRUCTION_SITES);

    logger.warn('targets '+targets+' '+this,classname);
    if(targets){
        return this.pos.findClosestByPath(targets);
    }
    return undefined;
};
Creep.prototype.findEnemyWall  = function() {
    var targets = this.room.find(FIND_STRUCTURES, {
        filter: function(object) {
            if (object.my) {
                return false;
            }
            if ( object.structureType !== STRUCTURE_WALL && object.structureType !== STRUCTURE_RAMPART) {
                return false;
            }
            return true;
        }
    });
    if(targets){
        return this.pos.findClosestByPath(targets);
    }
};


Creep.prototype.workAttack = function(){
    var target = undefined;
    if(this.room.name == this.memory.mainroom && this.room.name != this.memory.targetRoom ){
        target = this.findEnemyCreep();
        if(!target){
            var exitDir = this.room.findExitTo(this.memory.targetRoom);
            var exit = this.pos.findClosestByRange(exitDir);
            this.moveToFatigue(exit);
            logger.log("No creep main room "+exit,classname);
            return;
        }
    }

    if(this.room.name != this.memory.targetRoom ){
        var exitDir = this.room.findExitTo(this.memory.targetRoom);
        var exit = this.pos.findClosestByRange(exitDir);
        this.moveToFatigue(exit);
        logger.log("No creep main room "+exit,classname);
        return;
    }

    if(this.room.name == this.memory.targetRoom){
        target = this.findEnemyStructure();
        logger.debug("Enemy structure: "+target,classname);
        if(!target){
            target = this.findEnemyCreep();
            logger.debug("Enemy creep: "+target,classname);
        }
        if(!target) {
            target = this.findEnemyConstructionSite();
            logger.debug("Enemy Construction site: " + target, classname);
        }
        if(!target){
            target = this.findEnemyWall();
            logger.debug("Enemy wall: "+target,classname);
        }
    }
    logger.debug("Target : "+target+' '+target.pos,classname);

    if (!this.pos.isNearTo(target)) {
        logger.info("Move "+this.moveToFatigue(target),classname);
        logger.info("Attack "+this.attack(target),classname);
    } else {
        logger.info("Attack "+this.attack(target),classname);
    }
};
