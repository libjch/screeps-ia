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


        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if(creep.memory.working) {

            if(creep.room.name == creep.memory.mainroom){
                var targets = creep.room.find(FIND_CONSTRUCTION_SITES,{filter: (constructionSite) => { return constructionSite.my > 0}});
                var priorities = {tower:1,extension:2,constructedWall:3,rampart:4,road:8,container:6,storage:9};

                if( creep.pos.x == 49 || creep.pos.y==49 || creep.pos.x ==0){
                    console.log('escape '+creep.moveTo(creep.room.controller.pos));
                    return;
                }
                if(targets.length == 0){
                    creep.memory.role = 'upgrader';
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
                    direction.moveToRoom(creep,creep.memory.mainroom);
                }
            }
        }
        else {
            if(creep.memory.extern && creep.room.name == creep.memory.mainroom){
                direction.moveToRoom(creep,constants.rooms().others[creep.memory.mainroom][creep.memory.externRoom]);
            }else{
                direction.findSourceInRoom(creep);
            }
        }
    }
};

module.exports = roleBuilder;