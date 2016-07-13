var constants = require('global.variables');
var directionUtil = require('direction.util');
var logger = require('logger');



module.exports = {
    run: run
};


function findEnemyCreep(creep){
    var targets = creep.room.find(FIND_HOSTILE_CREEPS);
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


function findWall (creep) {
    var targets = creep.room.find(FIND_STRUCTURES, {
        filter: function(object) {
            if (object.my) {
                return false;
            }
            if ( object.structureType !== STRUCTURE_WALL) {
                return false;
            }
            return true;
        }
    });
    if(targets){
        return creep.pos.findClosestByPath(targets);
    }
}
/*
function findEnemy (creep) {
    var targets = creep.room.find(FIND_HOSTILE_CREEPS);
    if (!targets.length) {
        targets = creep.room.find(FIND_STRUCTURES, {
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
    }
    //console.log(targets);
    return creep.pos.findClosestByPath(targets);
}*/

function run (creep) {
    var target = undefined;
    if(creep.room.name == constants.rooms().main){
        target = findEnemyCreep(creep);
        if(!target){
            var exitDir = creep.room.findExitTo(constants.rooms().targets[0]);
            var exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit);
            logger.log("No creep main room");
            return;
        }
    }
    if(creep.room.name == constants.rooms().targets[0]){
        target = findEnemyCreep(creep);
        if(!target){
            var exitDir = creep.room.findExitTo(constants.rooms().targets[1]);
            var exit = creep.pos.findClosestByRange(exitDir);
            logger.log("No creep interm room");
            creep.moveTo(exit);
            return;
        }
    }
    logger.log(creep.room.name+" "+constants.rooms().targets[1]);
    if(creep.room.name == constants.rooms().targets[1]){
        logger.log("Target room",1);
        target = findEnemyStructure(creep);
        logger.log("Enemy structure: "+target,1);
        if(!target){
            target = findEnemyCreep(creep);
            logger.log("Enemy creep: "+target,1);
        }
        if(!target){
            target = findWall(creep);
            logger.log("Enemy wall: "+target,1);
        }
    }
    logger.log("Target : "+target,2);

    if (!creep.pos.isNearTo(target)) {
        logger.log("Move "+creep.moveTo(target),1);
        logger.log("Attack "+creep.attack(target),1);
    } else {
        logger.log("Atack "+creep.attack(target),1);
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

