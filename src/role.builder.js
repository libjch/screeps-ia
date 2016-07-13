var constants = require('global.variables');
var direction = require('direction.util');

var roleBuilder = {


    /** @param {Creep} creep **/
    run: function(creep) {
        /* if(creep.room.name == constants.rooms().main){
         if(creep.room.createConstructionSite(creep.pos.x,creep.pos.y, STRUCTURE_ROAD) == 0){
         console.log('Added road');
         }
         }*/


        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
        }

        if(creep.memory.building) {

            if(creep.room.name == constants.rooms().main){
                var targets = creep.room.find(FIND_CONSTRUCTION_SITES,{filter: (constructionSite) => { return constructionSite.my > 0}});
                var priorities = {tower:1,extension:2,constructedWall:3,rampart:4,road:5,container:6};

                if(targets.length == 0 || creep.pos.x == 49 || creep.pos.y==49 || creep.pos.x ==0){
                    console.log('escape '+creep.moveTo(30+(creep.memory.number%15),6));
                    return;
                }else{

                    targets.sort(function(a,b){
                        var pA = priorities[a.structureType];
                        var pB = priorities[b.structureType];
                        if(pA == pB){
                            return (creep.pos.getRangeTo(a)) - (creep.pos.getRangeTo(b));
                        }else{
                            return pA - pB;
                        }
                    })

                    if(targets.length) {
                        var target = targets[0];
                        console.log('    target: ' + target.structureType + ' ' + creep.pos.getRangeTo(target) + ' ' + target.progress +'/' + target.progressTotal);
                        if(creep.build(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }
                }
            }else{
                var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                var priorities = {tower:1,extension:2,constructedWall:3,rampart:4,road:5,container:6};
                if(targets.length > 0){
                    if(creep.pos.x == 49 || creep.pos.y==49 || creep.pos.x ==0){
                        creep.moveTo(30+(creep.memory.number%15),6);
                        return;
                    }else{
                        targets.sort(function(a,b){
                            var pA = priorities[a.structureType];
                            var pB = priorities[b.structureType];
                            if(pA == pB){
                                return (creep.pos.getRangeTo(a)) - (creep.pos.getRangeTo(b));
                            }else{
                                return pA - pB;
                            }
                        })
                        if(targets.length) {
                            var target = targets[0];
                            console.log('    target: ' + target.structureType + ' ' + creep.pos.getRangeTo(target) + ' ' + target.progress +'/' + target.progressTotal);
                            if(creep.build(target) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target);
                            }
                        }
                    }
                }else{
                    //NOT in current room
                    console.log('get back')
                    direction.moveToRoom(creep,constants.rooms().main);
                }
            }
        }
        else {
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
};

module.exports = roleBuilder;