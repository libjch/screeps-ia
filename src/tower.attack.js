var logger = require('logger');
var classname = 'TowerAttack';


function repair(tower){
    var targets = [];
    var targetRoads = tower.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_ROAD && structure.hits > 0 && structure.hits < (structure.hitsMax * 0.2));
        }
    });

    logger.info('Targets '+targets,classname);
    targets = targetRoads;

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
            logger.info('Tower : '+tower.pos,classname);
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