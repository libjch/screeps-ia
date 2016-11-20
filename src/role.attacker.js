var constants = require('global.variables');
var directionUtil = require('util.direction');
var logger = require('logger');
var classname = 'RoleAttacker';


module.exports = {
    run: run
};


function findEnemyCreep(creep){
    var targets = creep.room.find(FIND_HOSTILE_CREEPS);//, {filter: function(enemy){!enemy.my}});
    if(targets){
        return creep.pos.findClosestByPath(targets);
    }
    return undefined;
}

function findEnemyStructure(creep){
    var targets = creep.room.find(FIND_STRUCTURES, {
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

    var priorities = {STRUCTURE_TOWER:1,STRUCTURE_EXTENSION:3,STRUCTURE_SPAWN:2};
    targets.sort(function(a,b){
        var pA = priorities[a.structureType];
        var pB = priorities[b.structureType];
        if(pA == pB){
            return (creep.pos.getRangeTo(a)) - (creep.pos.getRangeTo(b));
        }else{
            return pA - pB;
        }
    });
    if(targets){
        return creep.pos.findClosestByPath(targets);
    }
    return undefined;
}

function findConstructionSite(creep){
    var targets = creep.room.find(FIND_HOSTILE_CONSTRUCTION_SITES);

    logger.warn('targets '+targets+' '+creep,classname);
    if(targets){
        return creep.pos.findClosestByPath(targets);
    }
    return undefined;
}
function findWall (creep) {
    var targets = creep.room.find(FIND_STRUCTURES, {
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
        return creep.pos.findClosestByPath(targets);
    }
}


function run (creep) {
    var target = undefined;
    if(creep.room.name == creep.memory.mainroom && creep.room.name != creep.memory.targetRoom ){
        target = findEnemyCreep(creep);
        if(!target){
            var exitDir = creep.room.findExitTo(creep.memory.targetRoom);
            var exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit);
            logger.log("No creep main room "+exit,classname);
            return;
        }
    }

    if(creep.room.name != creep.memory.targetRoom ){
        var exitDir = creep.room.findExitTo(creep.memory.targetRoom);
        var exit = creep.pos.findClosestByRange(exitDir);
        creep.moveTo(exit);
        logger.log("No creep main room "+exit,classname);
        return;
    }

    if(creep.room.name == creep.memory.targetRoom){
        target = findEnemyStructure(creep);
        logger.debug("Enemy structure: "+target,classname);
        if(!target){
            target = findEnemyCreep(creep);
            logger.debug("Enemy creep: "+target,classname);
        }
        if(!target) {
            target = findConstructionSite(creep);
            logger.debug("Enemy Construction site: " + target, classname);
            if (target) {
                creep.moveTo(target);
                return;
            }
        }
        if(!target){
            target = findWall(creep);
            logger.debug("Enemy wall: "+target,classname);
        }
    }
    logger.debug("Target : "+target+' '+target.pos,classname);

    if (!creep.pos.isNearTo(target)) {
        logger.info("Move "+creep.moveTo(target),classname);
        logger.info("Attack "+creep.attack(target),classname);
    } else {
        logger.info("Attack "+creep.attack(target),classname);
    }
}
