var constants = require('global.variables');

module.exports = {
    record : record
};

function record() {
    //var room = Game.rooms[constants.rooms().main];

    var rooms = [];

    for(var roomName of constants.rooms().main){
        rooms.push(Game.rooms[roomName]);
    }
    for(var group in constants.rooms().others){
        for(var roomName of constants.rooms().others[group]){
            rooms.push(Game.rooms[roomName]);
        }
    }

    for(var room of rooms){
        //console.log(roomName+' '+Game.rooms[roomName]);
        if(room){
            if(room.controller.my){
                Memory.stats["room." + room.name + ".controllerProgress"] = room.controller.progress;
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

            Memory.stats["room." + room.name+".invaders.count"] = _.filter(Game.creeps, (creep) => !creep.my);

        }
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester'  && creep.memory.extern == false);
    var harvestersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.extern == true);

    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder'  && creep.memory.extern == false);
    var buildersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.extern == true);

    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader'  && creep.memory.extern == false);
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
}