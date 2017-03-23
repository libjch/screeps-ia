var logger = require('logger');
var classname = 'TowerAttack';




Room.prototype.runTowers = function () {
    //List towers
    var towers = this.find(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_TOWER
    });
    //1 find hostiles:
    var hostiles = this.find(FIND_HOSTILE_CREEPS);

    if(hostiles && hostiles.length > 0){
        for(let t of towers){
            t.workAttack(hostiles);
        }
    }else{
        var repairsTargets = this.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_ROAD && structure.hits > 0 && structure.hits < (structure.hitsMax * 0.2));
            }
        });
        if(repairsTargets && repairsTargets.length > 0){
            for(let t of towers){
                t.workRepair(repairsTargets);
            }
        }
    }

    var myCreeps = this.find( FIND_MY_CREEPS, { filter: (creep) => {return ( creep.hits < creep.hitsMax ); } } );
    if(myCreeps.length){
        for(let t of towers){
            t.workHeal(myCreeps);
        }
    }
}

StructureTower.prototype.workAttack = function(targets){
    logger.info('Tower : '+this.pos,classname);
    var closestHostile = this.pos.findClosestByRange(targets);
    if(closestHostile) {
        this.attack(closestHostile);
    }else{
        for(var i in Game.creeps) {
            var creep = Game.creeps[i];
            if (creep.my && creep.hits < creep.hitsMax && creep.room.name == this.room.name) {
                this.heal(creep);
                return;
            }
        }
        this.workRepair();
    }
}


StructureTower.prototype.workRepair = function(targets){
    logger.info('Targets '+targets,classname);
    if(targets.length){
        this.repair(targets[0]);
    }
}

StructureTower.prototype.workHeal = function(targets){
    logger.info('Targets '+targets,classname);
    if(targets.length){
        this.heal(targets[0]);
    }
}