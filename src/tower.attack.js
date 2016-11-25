var logger = require('logger');
var classname = 'TowerAttack';




Room.prototype.runTowers = function () {
    var ts = this.find(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_TOWER
    });
    for(let t of ts){
        t.work();
    }
}

StructureTower.prototype.work = function(){
    logger.info('Tower : '+this.pos,classname);
    var closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(closestHostile) {
        this.attack(closestHostile);
        //return;
    }else{
        for(var i in Game.creeps) {
            var creep = Game.creeps[i];
            if (creep.my && creep.hits < creep.hitsMax && creep.room.name == this.room.name) {
                this.heal(creep);
                return;
            }
        }
        this.workRepair();
        //return;
    }
}


StructureTower.prototype.workRepair = function(){
    var targets = [];
    var targetRoads = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_ROAD && structure.hits > 0 && structure.hits < (structure.hitsMax * 0.2));
        }
    });

    logger.info('Targets '+targets,classname);
    targets = targetRoads;

    if(targets.length){
        this.repair(targets[0]);
    }
}