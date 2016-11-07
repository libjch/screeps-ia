var constants = require('global.variables');
var directionUtil = require('direction.util');
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

    var priorities = {tower:1,extension:2,spawn:3};
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
            if(object.room.name == 'E14N18'){
                if(object.pos.x < 3) {
                    return false;
                }
                if(object.pos.y < 3) {
                    return false;
                }
                if(object.pos.x < 46) {
                    return false;
                }
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
        logger.info("Enemy structure: "+target,classname);
        if(!target){
            target = findEnemyCreep(creep);
            logger.info("Enemy creep: "+target,classname);
        }
        if(!target){
            target = findWall(creep);
            logger.info("Enemy wall: "+target,classname);
        }
        if(!target) {
            target = findConstructionSite(creep);
            logger.info("Enemy Construction site: " + target,classname);
            if (target) {
                creep.moveTo(target);
                return;
            }
        }
    }
    logger.debug("Target : "+target+' '+target.pos,classname);

    if (!creep.pos.isNearTo(target)) {
        logger.info("Move "+creep.moveTo(target),classname);
        logger.info("Attack "+creep.attack(target),classname);
    } else {
        logger.info("Atack "+creep.attack(target),classname);
    }
}


/*
function containsEnnemyStructure(creep){
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
    return targets.length > 0;
}*/

