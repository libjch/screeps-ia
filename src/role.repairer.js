var constants = require('global.variables');
var direction = require('direction.util');

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

function repairRoads(creep){
    var targets = [];
    var targetRoads = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
            return (structure.structureType == STRUCTURE_ROAD && structure.hits > 0 && structure.hits < (structure.hitsMax * 0.5));
}
});
var topRoads = getSortedKeys(Memory.roadPlaces);

/*for(var i = 0; i< topRoads.length ; i+=100){
 console.log(i+' '+Memory.roadPlaces[topRoads[i]]);
 }*/
if(topRoads.length > 400){
    topRoads = topRoads.slice(0,400);
}


for(var target of targetRoads){
    var place = target.room.name+'-'+target.pos.x+'-'+target.pos.y;
    if(contains(topRoads,place)){
        targets.push(target);
    }
}

if(targets.length != 0){
    targets.sort(function(a,b){
        return (a.hits  + 50 * creep.pos.getRangeTo(a)) - (b.hits + 50 * creep.pos.getRangeTo(b));
    });

    var target = targets[0];
    var place = target.room.name+'-'+target.pos.x+'-'+target.pos.y;
    console.log('    target: '+target.pos+' ' + target.hits + '/' + target.hitsMax+ ' '+ creep.pos.getRangeTo(target)+' '+Memory.roadPlaces[place]);
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
        if(creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
        }
        if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
            creep.memory.repairing = true;
        }

        if(creep.memory.repairing) {
            //1 Fix strucures with less than 10k
            if(creep.room.name == constants.rooms().main){
                if(creep.pos.x == 49 || creep.pos.y==49 || creep.pos.x ==0){
                    creep.moveTo(30+(creep.memory.number%15),6);
                    return;
                }

                if(creep.memory.lastRepairId){
                    var target = Game.getObjectById(creep.memory.lastRepairId);
                    if(target && target.hits < target.hitsMax){
                        if(creep.repair(target) == ERR_NOT_IN_RANGE){
                            creep.memory.lastRepairId = undefined;
                        }else{
                            console.log('Continue repairing : '+target);
                            return ;
                        }
                    }

                }

                var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                        return ((structure.hits < 10000) && (structure.hits > 0) && structure.hits < (structure.hitsMax*0.8) && structure.structureType != STRUCTURE_ROAD)
                    }
            });

            if(targets.length == 0){
                //2 fix top roads with less than 50%
                if(!repairRoads(creep)){
                    //3 Fix structures according to priority and hitpoints %
                    targets = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                            return (structure.hits > 0 && structure.hits < (structure.hitsMax * 0.8) && structure.structureType != STRUCTURE_ROAD)
                        }
                });

                var priorities = {tower:1.0,extension:1.0,constructedWall:5,rampart:5,road:2,container:3};

                targets.sort(function(a,b){
                    return (priorities[a.structureType] * (a.hits + 200 * creep.pos.getRangeTo(a))) - (priorities[b.structureType] * (b.hits + 200 * creep.pos.getRangeTo(b)));
                })
                var target = targets[0];
                console.log('    target: '+target+' ' + target.hits + ' ' + (target.hits + 200 * creep.pos.getRangeTo(target)) + ' '+ creep.pos.getRangeTo(target));

                if(creep.pos.x == 49){
                    creep.moveTo(30+creep.memory.number,6);
                }
                else if(creep.repair(target) == ERR_NOT_IN_RANGE){
                    creep.moveTo(target);
                }else{
                    creep.memory.lastRepairId = target.id;
                }
            }
        }else{
            targets.sort(function(a,b){
                return (a.hits  + 200 * creep.pos.getRangeTo(a)) - (b.hits + 200 * creep.pos.getRangeTo(b));
            })

            var target = targets[0];
            console.log('    target: '+target+' ' + target.hits + ' ' + target.hitsMax+ ' '+ creep.pos.getRangeTo(target));

            if(creep.pos.x == 49){
                creep.moveTo(30+creep.memory.number,6);
            }else if(creep.repair(target) == ERR_NOT_IN_RANGE){
                creep.moveTo(target);
            }else{
                creep.memory.lastRepairId = target.id;
            }
        }
    }else{
        //NOT in current room
        if(!repairRoads(creep)){
    direction.moveToRoom(creep,constants.rooms().main);
}
}
}
else {
    //console.log(constants.rooms().others[creep.memory.externRoom]);
    if(creep.memory.extern && creep.room.name == constants.rooms().main){
        direction.moveToRoom(creep,constants.rooms().others[creep.memory.externRoom]);
    }else{
        var sources = creep.room.find(FIND_SOURCES,{filter: (source) => { return source.energy > 0}});
    if(creep.harvest(sources[creep.memory.number % sources.length]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[creep.memory.number % sources.length]);
    }
}
}
}
}

module.exports = roleRepairer;