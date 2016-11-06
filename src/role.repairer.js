var constants = require('global.variables');
var direction = require('direction.util');
var logger = require('logger');
var classname = 'RoleRepairer';

function getSortedKeys(obj) {
    var keys = []; for(var key in obj) keys.push(key);
    return keys.sort(function(a,b){return obj[b]-obj[a]});
}

function contains(list, obj) {
    for (var i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }
    return false;
}

function repairRoads(creep,filterTops){
    //var targets = [];
    var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return ((structure.structureType == STRUCTURE_ROAD || structure.structureType == STRUCTURE_CONTAINER)  && structure.hits > 0 && structure.hits < (structure.hitsMax * 0.5));
        }
    });

    /*if(filterTops) {
        var topRoads = getSortedKeys(Memory.roadPlaces);

        if (topRoads.length > 400) {
            topRoads = topRoads.slice(0, 400);
        }


        for (var target of targetRoads) {
            var place = target.room.name + '-' + target.pos.x + '-' + target.pos.y;
            if (contains(topRoads, place)) {
                targets.push(target);
            }
        }
    }else{
        targets = targetRoads;
    }*/

    if(targets.length != 0){
        targets.sort(function(a,b){
            return (a.hits  + 50 * creep.pos.getRangeTo(a)) - (b.hits + 50 * creep.pos.getRangeTo(b));
        });

        var target = targets[0];
        var place = target.room.name+'-'+target.pos.x+'-'+target.pos.y;
        logger.log('    target: '+target.pos+' ' + target.hits + '/' + target.hitsMax+ ' '+ creep.pos.getRangeTo(target)+' '+Memory.roadPlaces[place],classname);
        if(creep.repair(target) == ERR_NOT_IN_RANGE){
            creep.moveTo(target);
        }else{
            creep.memory.lastRepairId = target.id;
        }
        return true;
    }
    return false;
}

var roleRepairer = {
    run: function(creep) {
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if(creep.memory.working) {
            //0 continue repair
            if(creep.memory.lastRepairId){
                var target = Game.getObjectById(creep.memory.lastRepairId);
                if(target && target.room.name == creep.room.name){
                    if(target && target.hits < target.hitsMax){
                        if(creep.repair(target) == ERR_NOT_IN_RANGE){
                            creep.memory.lastRepairId = undefined;
                            logger.warn('Repair not in range',classname);
                        }else{
                            logger.log('Continue repairing : '+target,classname);
                            return ;
                        }
                    }
                }else{
                    creep.memory.lastRepairId = undefined;
                }
            }


            //1 Fix strucures with less than 10k
            if(creep.room.controller && creep.room.controller.my){
                if(creep.pos.x == 49 || creep.pos.y==49 || creep.pos.x ==0 || creep.pos.x ==49){
                    creep.moveTo(30+(creep.memory.number%15),6);
                    return;
                }

                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.hits < 10000) && (structure.hits > 0) && structure.hits < (structure.hitsMax*0.8) && structure.structureType != STRUCTURE_ROAD)
                    }
                });

                if(targets.length == 0){
                    //2 fix top roads with less than 50%
                    if(!repairRoads(creep,true)){
                        //3 Fix structures according to priority and hitpoints %
                        targets = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.hits > 0 && structure.hits < (structure.hitsMax * 0.8) && structure.structureType != STRUCTURE_ROAD)
                            }
                        });

                        var priorities = {tower:1.0,extension:1.0,constructedWall:5,rampart:4.5,road:2,container:3};

                        targets.sort(function(a,b){
                            return (priorities[a.structureType] * (a.hits + 200 * creep.pos.getRangeTo(a))) - (priorities[b.structureType] * (b.hits + 200 * creep.pos.getRangeTo(b)));
                        });


                        var target = targets[0];

                        if(target){
                            logger.log('    target: '+target+' ' + target.hits + ' ' + (target.hits + 200 * creep.pos.getRangeTo(target)) + ' '+ creep.pos.getRangeTo(target),classname);

                            if(creep.pos.x == 49){
                                creep.moveTo(30+creep.memory.number,6);
                            }
                            else if(creep.repair(target) == ERR_NOT_IN_RANGE){
                                creep.moveTo(target);
                            }else{
                                creep.memory.lastRepairId = target.id;
                            }
                        }else{
                            logger.debug('No target',classname);
                            creep.memory.role_override = 'upgrader';
                            creep.memory.role_override_time = Game.time + 300;
                            return;
                        }
                    }
                }else{ //repair targets
                    targets.sort(function(a,b){
                        return (a.hits  + 200 * creep.pos.getRangeTo(a)) - (b.hits + 200 * creep.pos.getRangeTo(b));
                    })

                    var target = targets[0];
                    logger.log('    target: '+target+' ' + target.hits + ' ' + target.hitsMax+ ' '+ creep.pos.getRangeTo(target),classname);

                    if(creep.repair(target) == ERR_NOT_IN_RANGE){
                        creep.moveTo(target);
                    }else{
                        creep.memory.lastRepairId = target.id;
                    }
                }
            }else{
                //NOT in current room
                if(!repairRoads(creep,false)){
                    direction.moveToRoom(creep,creep.memory.mainroom);
                }
            }
        }
        else {
            //console.log(constants.rooms().others[creep.memory.externRoom]);
            if(creep.memory.extern && creep.room.name == creep.memory.mainroom){
                direction.moveToRoom(creep,constants.rooms().others[creep.memory.mainroom][creep.memory.externRoom]);
            }else{
                direction.findSourceInRoom(creep);
            }
        }
    }
}

module.exports = roleRepairer;