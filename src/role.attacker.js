var constants = require('global.variables');
var directionUtil = require('direction.util');

module.exports = {
    findEnemy: findEnemy,
    run: run
};


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
}

function run (creep) {
    if(creep.room.name == constants.rooms().main){
        var exitDir = creep.room.findExitTo(constants.rooms().targets[0]);
        var exit = creep.pos.findClosestByRange(exitDir);
        console.log(creep.moveTo(exit));
        return;
    }
    var target = undefined;
    if(creep.room.name == constants.rooms().targets[0]){
        target = findEnemy(creep);
        if(!target){
            var exitDir = creep.room.findExitTo(constants.rooms().targets[1]);
            var exit = creep.pos.findClosestByRange(exitDir);
            console.log(creep.moveTo(exit));
            return;
        }
    }
    if(target == undefined){
        target = findEnemy(creep);
        console.log('a '+target);
    }

    if(!target){
        if(false && creep.room.controller && !creep.room.controller.my) {
            console.log('b '+creep.attackController(creep.room.controller))
            if(creep.attackController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else{
            if(containsEnnemyStructure(creep)){
                target = findWall(creep);

                if (!target) {
                    return false;
                }
                // getDirectionTo
                if (!creep.pos.isNearTo(target)) {
                    return creep.moveTo(target);
                } else {
                    creep.attack(target);
                }
                var direction = creep.pos.getDirectionTo(target);
                creep.memory.wallDirection = direction;
                return true;
            }else{
                console.log('no structure');

                target = findWall(creep);

                if (!target) {
                    directionUtil.moveToRoom(creep,constants.rooms().targets[0]);
                    return;
                }
                // getDirectionTo
                if (!creep.pos.isNearTo(target)) {
                    return creep.moveTo(target);
                } else {
                    creep.attack(target);
                }
            }
        }
    } else {
        creep.moveTo(target);
        creep.attack(target);
        return true;
    }
    return false;
}

function containsEnnemyStructure(creep){
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
    return targets.length > 0;
}

function findWall (creep) {
    var targets = creep.room.find(FIND_STRUCTURES, {
        filter: function(object) {
            if (object.my) {
                return false;
            }
            if (object.structureType !== STRUCTURE_TOWER && object.structureType !== STRUCTURE_WALL) {
                return false;
            }
            return true;
        }
    });
    return creep.pos.findClosestByPath(targets);
}