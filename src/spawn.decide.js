//var constants = require('global.variables');
var logger = require('logger');
var classname = 'Spanwer';
module.exports = {

    spawn(){
        logger.warn('=======Spawns======',classname)

        for(var i in Game.spawns) {
            var spawn = Game.spawns[i];
            var room = spawn.room;
            var roomName = room.name;


            var harvesters = _.filter(Game.creeps, (creep) => (creep.memory.role == 'harvester' || creep.memory.role == 'harvester-c') && creep.memory.extern == false && creep.memory.spawnroom == roomName);
            var harvestersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.extern == true && creep.memory.mainroom == roomName);

            var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.extern == false && creep.memory.spawnroom == roomName);
            var buildersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.extern == true && creep.memory.spawnroom == roomName);
            var buildersHelpers = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.spawnroom == roomName && creep.memory.mainroom != roomName);


            var upgraders = _.filter(Game.creeps, (creep) => (creep.memory.role == 'upgrader'  || creep.memory.role == 'upgrader-c') && creep.memory.extern == false && creep.memory.spawnroom == roomName);
            var upgradersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.memory.extern == true && creep.memory.spawnroom == roomName);


            var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.memory.extern == false && creep.memory.spawnroom == roomName);
            var repairersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.memory.extern == true && creep.memory.spawnroom == roomName);

            var attackers = _.filter(Game.creeps, (creep) => creep.memory.role == 'attacker' && creep.memory.spawnroom == roomName);

            var extractors = _.filter(Game.creeps, (creep) => (creep.memory.role == 'extractor') && creep.memory.extern == false && creep.memory.spawnroom == roomName);

            logger.warn('Room '+roomName+' Harvesters:' + harvesters.length + ' (' + harvestersOut.length + ') ' +
                'Builders:' + builders.length + ' (' + buildersOut.length + ' - ' + buildersHelpers.length + ' ) ' +
                'Upgraders:' + upgraders.length + ' (' + upgradersOut.length + ')  ' +
                'Repairers:' + repairers.length + ' (' + repairersOut.length + ')  ' +
                'Attackers: ' + attackers.length+'  Extractors: '+extractors.length,classname);


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

            var enableExterns = false;

            var role = undefined;
            var extern = false;
            var roomnumber = undefined;
            var targetroom = undefined;

            var mainroom = roomName;

            if(harvesters.length == 0 && energy >= 300){
                maxEnergy = energy;
            }

            if (harvesters.length < 2) {
                role = 'harvester';
                maxEnergy = maxEnergy > 1200 ? 1200 : maxEnergy;
            } else if(extractors.length < 2){
                role = 'extractor';
                maxEnergy = maxEnergy > 1200 ? 1200 : maxEnergy;
            } /*else if (false && (roomName == 'E14N19')  && attackers.length < 1) {
                role = 'attacker';
                extern = true;
                maxEnergy = maxEnergy > 800 ? 800 : maxEnergy;
                targetroom = 'E14N18';
            }*/


            else if (upgraders.length < 1) {
                role = 'upgrader';
                maxEnergy = maxEnergy > 1200 ? 1200 : maxEnergy;
            }
            else if (constructionsSites.length / 8 > builders.length && builders.length < 1) {
                role = 'builder';
                maxEnergy = maxEnergy > 1200 ? 1200 : maxEnergy;
            } else if (repairers.length < 1) {
                role = 'repairer';
                maxEnergy = maxEnergy > 1200 ? 1200 : maxEnergy;
            } else if ((totalEnergyStored > maxEnergyStored * 0.4) && upgraders.length < 2){
                role = 'upgrader-c';
            } else if (upgraders.length < 2) {
                role = 'upgrader';
            }
            /*else if (enableExterns && harvestersOut.length < externalSources) { //+2
                role = 'harvester';
                extern = true;
            } else if (buildersHelpers.length < 0 && (roomName == 'E14N19') ) { //+1
                role = 'builder';
                maxEnergy = maxEnergy > 1500 ? 1500 : maxEnergy;
                mainroom = 'E14N18';
            } else if (repairersOut.length < 1) { //+1
             role = 'repairer';
             maxEnergy = maxEnergy > 1500 ? 1500 : maxEnergy;
             extern = true;
             } else if (harvestersOut.length < 0) { //+2
             role = 'harvester';
             maxEnergy = maxEnergy > 1300 ? 3500 : maxEnergy;
             extern = true;
             } else if (enableExterns && upgradersOut.length < externalSources) { //+4
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
                    var rest = maxEnergy % 190;
                    number -= 1;
                    for (var i = 0; i < number; i++) {
                        body.push(TOUGH);
                    }
                    for (var i = 0; i < number; i++) {
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
                    logger.error('number: ' + number + ' ' + rest + ' ' + maxEnergy + ' ' + energy,classname);
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

                logger.log('Suggested role: ' + role + (extern ? ' (E)' : ' ') + ' energy: ' + energy + '/' + room.energyCapacityAvailable + " " + body,classname);

                var res = spawn.createCreep(body, role + '-' + number, {
                    role: role,
                    extern: extern,
                    number: number,
                    roomnumber: roomnumber,

                    mainroom: mainroom,
                    spawnroom: roomName,

                    externRoom: externRoomNumber,
                    targetRoom: targetroom
                });
                if (_.isString(res)) {
                    logger.log(res,classname);
                    Memory.global_id = number + 1;
                } else {
                    logger.warn(res,classname);
                }

            }
        }
    }
};
