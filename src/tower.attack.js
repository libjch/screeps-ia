var logger = require('logger');
var classname = 'TowerAttack';

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
function repair(tower){
    var targets = [];
    var targetRoads = tower.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_ROAD && structure.hits > 0 && structure.hits < (structure.hitsMax * 0.2));
        }
    });

    if(tower.room.name == 'E42S38'){
        var topRoads = getSortedKeys(Memory.roadPlaces);
        if(topRoads.length > 200){
            topRoads = topRoads.slice(0,200);
        }
        for(var target of targetRoads){
            var place = target.room.name+'-'+target.pos.x+'-'+target.pos.y;
            if(target.room.name != 'E42S38' || contains(topRoads,place)){
                targets.push(target);
            }
        }
    }else{
        logger.info('Targets '+targets,classname);
        targets = targetRoads;
    }

    if(targets.length){
        tower.repair(targets[0]);
    }
}


module.exports = {
    attack(){
        var towers = [];

        for(let i in Game.spawns){
            var spawn = Game.spawns[i];
            var room = spawn.room;

            var ts = room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_TOWER
            });
            for(let t of ts){
                towers.push(t);
            }
        }

        //logger.log('Towers : '+towers);
        for(var tower of towers){
            logger.warn('Tower : '+tower.pos,classname);
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                tower.attack(closestHostile);
                //return;
            }else{

                for(var i in Game.creeps) {
                    var creep = Game.creeps[i];
                    if (creep.my && creep.hits < creep.hitsMax && creep.room.name == tower.room.name) {
                        tower.heal(creep);
                        return;
                    }
                }

                repair(tower);
                //return;
            }

        }


    }
};