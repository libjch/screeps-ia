var constants = require('global.variables');
var directionUtil = require('direction.util');
var logger = require('logger');



module.exports = {
    run: run
};


function findEnemyCreep(creep){
    var targets = creep.room.find(FIND_HOSTILE_CREEPS, {filter: function(enemy){enemy.owner.username !== 'Source Keeper'}});
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
    if(creep.room.name == creep.memory.mainroom && creep.room.name != constants.rooms().targets_path[0] ){
        target = findEnemyCreep(creep);
        if(!target){
            var exitDir = creep.room.findExitTo(constants.rooms().targets_path[0]);
            var exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit);
            logger.log("No creep main room "+exit);
            return;
        }
    }

    for(var targetI in constants.rooms().targets_path){
        if(targetI < constants.rooms().targets_path.length - 1){
            if(creep.room.name = constants.rooms().targets_path[targetI]){
                var exitDir = creep.room.findExitTo(constants.rooms().targets_path[targetI+1]);
                var exit = creep.pos.findClosestByRange(exitDir);
                logger.debug('move exit: '+creep.moveTo(exit)+'  '+creep.room.name+' '+constants.rooms().targets_path[targetI+1]+' '+(targetI+1));
                return;
            }
        }else{
            var exitDir = creep.room.findExitTo(constants.rooms().targets_final);
            var exit = creep.pos.findClosestByRange(exitDir);
            logger.debug('move exit last '+creep.moveTo(exit));
            return;
        }
    }
    if(creep.room.name == constants.rooms().targets_final){
        target = findEnemyStructure(creep);
        logger.info("Enemy structure: "+target);
        if(!target){
            target = findEnemyCreep(creep);
            logger.info("Enemy creep: "+target);
        }
        if(!target){
            target = findWall(creep);
            logger.info("Enemy wall: "+target);
        }
    }
    logger.debug("Target : "+target);

    if (!creep.pos.isNearTo(target)) {
        logger.info("Move "+creep.moveTo(target));
        logger.info("Attack "+creep.attack(target));
    } else {
        logger.info("Atack "+creep.attack(target));
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

