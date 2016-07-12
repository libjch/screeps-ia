/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('tower.attack');
 * mod.thing == 'a thing'; // true
 */
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
    var topRoads = getSortedKeys(Memory.roadPlaces);
    if(topRoads.length > 200){
        topRoads = topRoads.slice(0,200);
    }
    /*var i =0;
     for(var t of topRoads){
     console.log(i++ + ' '+t+' '+Memory.roadPlaces[t]);
     }*/

    for(var target of targetRoads){
        var place = target.room.name+'-'+target.pos.x+'-'+target.pos.y;
        if(contains(topRoads,place)){
            targets.push(target);
        }
    }

    if(targets.length){
        tower.repair(targets[0]);
    }
}


module.exports = {
    attack(){
        var towers = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_TOWER
        });
        for(var tower of towers){
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                tower.attack(closestHostile);
            }else{
                repair(tower);
            }

        }


    }
};