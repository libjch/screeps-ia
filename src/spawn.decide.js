var constants = require('global.variables');
var logger = require('logger');
module.exports = {

    spawn(){
        logger.warn('=======Spawns======')
        for(var i in Game.spawns) {
            var spawn = Game.spawns[i];
            var room = spawn.room;
            var roomName = room.name;


            var harvesters = _.filter(Game.creeps, (creep) => (creep.memory.role == 'harvester' || creep.memory.role == 'harvester-c') && creep.memory.extern == false && creep.memory.mainroom == roomName);
            var harvestersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.extern == true && creep.memory.mainroom == roomName);

            var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.extern == false && creep.memory.mainroom == roomName);
            var buildersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.extern == true && creep.memory.mainroom == roomName);

            var upgraders = _.filter(Game.creeps, (creep) => (creep.memory.role == 'upgrader'  || creep.memory.role == 'upgrader-c') && creep.memory.extern == false && creep.memory.mainroom == roomName);
            var upgradersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.memory.extern == true && creep.memory.mainroom == roomName);


            var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.memory.extern == false && creep.memory.mainroom == roomName);
            var repairersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.memory.extern == true && creep.memory.mainroom == roomName);

            var attackers = _.filter(Game.creeps, (creep) => creep.memory.role == 'attacker' && creep.memory.mainroom == roomName);

            var extractors = _.filter(Game.creeps, (creep) => (creep.memory.role == 'extractor') && creep.memory.extern == false && creep.memory.mainroom == roomName);

            logger.warn('Room '+roomName+' Harvesters:' + harvesters.length + ' (' + harvestersOut.length + ') ' +
                'Builders:' + builders.length + ' (' + buildersOut.length + ')  ' +
                'Upgraders:' + upgraders.length + ' (' + upgradersOut.length + ')  ' +
                'Repairers:' + repairers.length + ' (' + repairersOut.length + ')  ' +
                'Attackers: ' + attackers.length+'  Extractors: '+extractors.length);


            var totalEnergyStored = 0;
            var maxEnergyStored = 0;

            var containers = room.find(FIND_STRUCTURES, {
                filter: { structureType: STRUCTURE_CONTAINER }
            });
            for(let container of containers){
                totalEnergyStored += container.store[RESOURCE_ENERGY];
                maxEnergyStored += container.storeCapacity;
            }

            var energy = room.energyAvailable;
            var maxEnergy = room.energyCapacityAvailable;

            if (harvesters.length == 0) {
                maxEnergy = energy > 300 ? energy : 300;
            }
            if (harvesters.length == 1 && harvestersOut.length == 0) {
                maxEnergy = energy > 500 ? energy : 500;
            }

            var constructionsSites = room.find(FIND_CONSTRUCTION_SITES);


            var role = undefined;
            var extern = false;
            var roomnumber = undefined;
            if (harvesters.length < 2) {
                if (false && totalEnergyStored > maxEnergyStored * 0.5){
                    role = 'harvester-c';
                }else{

                    role = 'harvester';
                }
            } else if(extractors.length < 2){
                role = 'extractor';
            }
            else if (harvestersOut.length < 2) { //+2
                role = 'harvester';
                extern = true;
            }else if (constructionsSites.length / 4 > builders.length) {
                role = 'builder';
            } else if (repairers.length < 1) {
                role = 'repairer';
            } else if (upgraders.length < 2) {
                role = 'upgrader';
            } else if (false && totalEnergyStored > maxEnergyStored * 0.5 && upgraders.length < 2){
                role = 'upgrader-c';
            } else if (constants.rooms().attacker && attackers.length < 1) {
                role = 'attacker';
                extern = true;
            } else if (harvestersOut.length < 2) { //+2
                role = 'harvester';
                extern = true;
            } else if (buildersOut.length < 1) { //+1
                role = 'builder';
                extern = true;
            } else if (repairersOut.length < 1) { //+1
                role = 'repairer';
                extern = true;
            } else if (harvestersOut.length < 3) { //+2
                role = 'harvester';
                extern = true;
            } else if (upgradersOut.length < 2) { //+4
                role = 'upgrader';
                extern = true;
            } else if (buildersOut.length < 0) { //+3
                role = 'builder';
                extern = true;
            } else if (upgradersOut.length < 4) { //+3
                role = 'upgrader';
                extern = true;
            }


            //MOVE 50
            //WORK 100
            //CARRY 50
            var body = [];
            if (role != undefined) {
                if (role == 'attacker') {
                    var number = Math.floor(maxEnergy / 200);
                    var rest = maxEnergy % 200;
                    for (var i = 0; i < number; i++) {
                        body.push(MOVE);
                        body.push(MOVE);
                        body.push(ATTACK);
                        body.push(TOUGH);
                        body.push(TOUGH);
                    }
                    if (rest >= 150) {
                        body.push(MOVE);
                    }
                }else  if (role == 'extractor') {
                    body.push(CARRY);
                    body.push(CARRY);
                    body.push(MOVE);
                    maxEnergy = maxEnergy - 150;
                    var number = Math.floor(maxEnergy / 100);
                    var rest = maxEnergy % 100;
                    for (var i = 0; i < number; i++) {
                        body.push(WORK);
                    }
                    if (rest >= 50) {
                        body.push(MOVE);
                    }
                }
                else {
                    var number = Math.floor(maxEnergy / 200);

                    var rest = maxEnergy % 200;
                    for (var i = 0; i < number; i++) {
                        body.push(WORK);
                        body.push(CARRY);
                        body.push(MOVE);
                    }
                    if (rest >= 150) {
                        body.push(MOVE);
                    }
                    if (rest >= 100) {
                        body.push(CARRY);
                    }
                    if (rest >= 50) {
                        body.push(MOVE);
                    }
                }
                var number = Memory.global_id;


                //get least used extern room
                var externRoomNumber = undefined;
                if (extern) {
                    var usage = [];
                    for (let i in constants.rooms().others[roomName]) {
                        var numbers = _.filter(Game.creeps, (creep) => creep.memory.mainroom == roomName && creep.memory.externRoom == i);
                        usage.push(numbers.length);
                    }

                    var min = 99;
                    var minI = 0;
                    for (let i in usage) {
                        if (usage[i] < min) {
                            min = usage[i];
                            minI = i;
                        }
                    }

                    logger.log("externRoomChoice: "+minI+" of "+usage);
                    externRoomNumber = minI;
                }

                console.log('Suggested role: ' + role + (extern ? ' (E)' : ' ') + ' energy: ' + energy + '/' + room.energyCapacityAvailable);

                var res = spawn.createCreep(body, role +'-'+number, {
                    role: role,
                    extern: extern,
                    number: number,
                    roomnumber: roomnumber,
                    mainroom: roomName,
                    externRoom: externRoomNumber
                });
                if (_.isString(res)) {
                    logger.log(res);
                    Memory.global_id = number + 1;
                }
            }
        }
    }
};
