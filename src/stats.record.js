var logger = require('logger');
var classname = 'StatsRecorder';

module.exports = {
    record : record
};

function record() {
    //var room = Game.rooms[constants.rooms().main];
    var rooms = [];

    for(let i in Game.spawns) {
        var spawn = Game.spawns[i];
        rooms.push(spawn.room);
    }

    //Avoid crash in simulation mode
    if(rooms[0].name =="sim"){
        return;
    }

    for(var room of rooms){
        logger.debug(room+' '+room.name,classname);
        if(room){
            if(room.controller.my){
                Memory.stats["room." + room.name + ".controllerProgress"] = room.controller.progress;
                Memory.stats["room." + room.name + ".controllerProgressTotal"] = room.controller.progressTotal;

                var roomCreeps = _.filter(Game.creeps, (creep) => creep.memory.mainroom == room.name);
                Memory.stats["room." + room.name + ".creeps.count"] = roomCreeps.length;
            }
            Memory.stats["room." + room.name + ".energyAvailable"] = room.energyAvailable;
            Memory.stats["room." + room.name + ".energyCapacityAvailable"] = room.energyCapacityAvailable;

            var sources = room.find(FIND_SOURCES);
            for(var i in sources){
                var source = sources[i];
                Memory.stats["room." + room.name +".sources."+i+".energy"] = source.energy;
                Memory.stats["room." + room.name +".sources."+i+".energyCapacity"] = source.energyCapacity;
            }

            var containers= room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] >= 0)
                }
            });

            var totalInContainer = 0;
            var totalContainerCapacity = 0;
            for(let container of containers){
                totalInContainer += container.store[RESOURCE_ENERGY];
                totalContainerCapacity += container.storeCapacity;
            }

            Memory.stats["room." + room.name +".containers.energy"] = totalInContainer;
            Memory.stats["room." + room.name +".containers.storeCapacity"] = totalContainerCapacity;


            Memory.stats["room." + room.name+".invaders.count"] = room.find(FIND_HOSTILE_CREEPS).length;//_.filter(Game.creeps, (creep) => !creep.my).length;
            if(room.storage) {
                Memory.stats["room." + room.name + ".storage.energy"] = room.storage.store[RESOURCE_ENERGY];
            }
        }
    }

    var harvesters = _.filter(Game.creeps, (creep) => (creep.memory.role == 'harvester' || creep.memory.role == 'harvester-c')  && creep.memory.extern == false);
    var harvestersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.extern == true);

    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder'  && creep.memory.extern == false);
    var buildersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.extern == true);

    var upgraders = _.filter(Game.creeps, (creep) => (creep.memory.role == 'upgrader' || creep.memory.role == 'upgrader-c')   && creep.memory.extern == false);
    var upgradersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.memory.extern == true);

    var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer'  && creep.memory.extern == false);
    var repairersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.memory.extern == true);

    var attackers = _.filter(Game.creeps, (creep) => creep.memory.role == 'attacker');



    Memory.stats["creep.harvester.count"] = harvesters.length;
    Memory.stats["creep.harvester.out.count"] = harvestersOut.length;

    Memory.stats["creep.builder.count"] = builders.length;
    Memory.stats["creep.builder.out.count"] = buildersOut.length;

    Memory.stats["creep.upgrader.count"] = upgraders.length;
    Memory.stats["creep.upgrader.out.count"] = upgradersOut.length;

    Memory.stats["creep.repairer.count"] = repairers.length;
    Memory.stats["creep.repairer.out.count"] = repairersOut.length;

    Memory.stats["creep.attacker.count"] = attackers.length;

    Memory.stats["game.time"] = Game.time;
    Memory.stats["game.cpu.limit"] = Game.cpu.limit;
    Memory.stats["game.cpu.tickLimit"] = Game.cpu.tickLimit;
    Memory.stats["game.cpu.bucket"] = Game.cpu.bucket;
    Memory.stats["game.cpu.use"] = Game.cpu.getUsed();

}