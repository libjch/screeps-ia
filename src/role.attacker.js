var constants = require('global.variables');
var directionUtil = require('direction.util');
var logger = require('logger');



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
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: function(object) {
            if (object.my) {
                return false;
            }
            return true;
        }
    });

    logger.warn('targets '+targets+' '+creep);
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
            if(object.room.name == 'E44S37' && object.pos.y < 20){
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

    for (var i = 0; i < constants.rooms().targets_path.length-1; i++) {
        if(i < constants.rooms().targets_path.length - 1){
            if(creep.room.name == constants.rooms().targets_path[i]){
                directionUtil.moveToRoom(creep,constants.rooms().targets_path[i+1]);
                logger.debug('move exit: '+creep.moveTo(exit)+'  '+creep.room.name+' '+ (constants.rooms().targets_path[(i+1)])+' '+(i+1));
                return;
            }
        }else{
            directionUtil.moveToRoom(creep,constants.rooms().targets_final);
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
        if(!target){
            target = findConstructionSite(creep);
            logger.info("Enemy Construction site: "+target);
        }
    }
    logger.debug("Target : "+target+' '+target.pos);

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

