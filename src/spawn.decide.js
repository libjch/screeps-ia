//var constants = require('global.variables');
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
            if (harvesters.length == 1 && harvestersOut.length == 0 && maxEnergy >= 500) {
                maxEnergy = energy > 500 ? energy : 500;
            }

            var constructionsSites = room.find(FIND_CONSTRUCTION_SITES);

            var externalSources = 1;


            var role = undefined;
            var extern = false;
            var roomnumber = undefined;
            if(harvesters.length == 0 && energy >= 300){
                maxEnergy = energy;
            }

            if (harvesters.length < 2) {
                /*if (false && totalEnergyStored > maxEnergyStored * 0.35){
                 role = 'harvester-c';
                 }else*/{
                    role = 'harvester';
                    maxEnergy = maxEnergy > 1500 ? 1500 : maxEnergy;
                }
            } else if(extractors.length < 2){
                role = 'extractor';
                maxEnergy = maxEnergy > 1500 ? 1500 : maxEnergy;
            }
            else if (upgraders.length < 1) {
                role = 'upgrader';
                maxEnergy = maxEnergy > 1500 ? 1500 : maxEnergy;
            }
            /*else if (harvestersOut.length < externalSources) { //+2
             role = 'harvester';
             extern = true;
             }*/else if (constructionsSites.length / 8 > builders.length) {
                role = 'builder';
                maxEnergy = maxEnergy > 1500 ? 1500 : maxEnergy;
            } else if (repairers.length < 1) {
                role = 'repairer';
                maxEnergy = maxEnergy > 1500 ? 1500 : maxEnergy;
            } else if ((totalEnergyStored > maxEnergyStored * 0.4) && upgraders.length < 2){
                role = 'upgrader-c';
            } else if (upgraders.length < 0) {
                role = 'upgrader';
            }/* else if (harvestersOut.length < externalSources) { //+2
             role = 'harvester';
             extern = true;

             } else if (buildersOut.length < 1) { //+1
             role = 'builder';
             maxEnergy = maxEnergy > 1500 ? 1500 : maxEnergy;
             extern = true;
             } else if (repairersOut.length < 1) { //+1
             role = 'repairer';
             maxEnergy = maxEnergy > 1500 ? 1500 : maxEnergy;
             extern = true;
             } else if (harvestersOut.length < 0) { //+2
             role = 'harvester';
             maxEnergy = maxEnergy > 1300 ? 3500 : maxEnergy;
             extern = true;
             } else if (upgradersOut.length < externalSources) { //+4
             role = 'upgrader';
             extern = true;
             } else if (buildersOut.length < 0) { //+3
             role = 'builder';
             extern = true;
             } else if (upgradersOut.length < 0) { //+3
             role = 'upgrader';
             extern = true;
             }*/


            //MOVE 50
            //WORK 100
            //CARRY 50
            var body = [];
            if (role != undefined) {
                if(maxEnergy <= 300){
                    body.push(WORK);
                    body.push(WORK);
                    body.push(MOVE);
                    body.push(CARRY);
                }else if (role == 'attacker') {
                    var number = Math.floor(maxEnergy / 250);
                    var rest = maxEnergy % 250;
                    number -= 1;
                    for (var i = 0; i < number; i++) {
                        body.push(TOUGH);
                        body.push(TOUGH);
                    }
                    for (var i = 0; i < number; i++) {
                        body.push(MOVE);
                        body.push(MOVE);
                        body.push(MOVE);
                    }
                    for (var i = 0; i < number; i++) {
                        body.push(ATTACK);
                    }
                } else if (role == 'extractor') {
                    body.push(CARRY);
                    body.push(CARRY);
                    body.push(MOVE);
                    maxEnergy = maxEnergy - 150;
                    var number = Math.floor(maxEnergy / 100);
                    number = number > 10 ? 10 : number;
                    var rest = maxEnergy % 100;
                    for (var i = 0; i < number; i++) {
                        body.push(WORK);
                    }
                    if (rest >= 50) {
                        body.push(MOVE);
                    }
                } else if (role == 'harvester-c' && extern == false && extractors.length > 0 && maxEnergy > 1000) {
                    body.push(CARRY);
                    body.push(CARRY);
                    body.push(CARRY);
                    body.push(CARRY);
                    body.push(CARRY);
                    body.push(MOVE);
                    body.push(MOVE);
                    body.push(MOVE);
                    body.push(MOVE);
                    body.push(MOVE);

                    maxEnergy = maxEnergy - 500;
                    var number = Math.floor(maxEnergy / 200);
                    number = number > 10 ? 10 : number;
                    for (var i = 0; i < number; i++) {
                        body.push(WORK);
                        body.push(CARRY);
                        body.push(MOVE);
                    }
                }
                else {
                    var number = Math.floor(maxEnergy / 200);

                    var rest = maxEnergy % 200;
                    logger.error('number: ' + number + ' ' + rest + ' ' + maxEnergy + ' ' + energy);
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

                console.log('Suggested role: ' + role + (extern ? ' (E)' : ' ') + ' energy: ' + energy + '/' + room.energyCapacityAvailable + " " + body);

                var res = spawn.createCreep(body, role + '-' + number, {
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
                } else {
                    logger.warn(res);
                }

            }
        }
    }
};
