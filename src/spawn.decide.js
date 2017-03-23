//var constants = require('global.variables');
var logger = require('logger');
var classname = 'Spanwer';



Room.prototype.spawnDecide = function(){
    logger.warn('=======Spawns======',classname);
    var roomName = this.name;
    var spawns = [];
    for(var i in Game.spawns) {
        var spawn = Game.spawns[i];
        if (spawn.room == this && spawn.spawning == null) {
            spawns.push(spawn);
        }
    }

    if(spawns.length){
        var spawn = spawns[0];//choose best one?
        var sources = this.find(FIND_SOURCES).length;

        var harvesters = _.filter(Game.creeps, (creep) => (creep.memory.role == 'harvester' && creep.memory.extern == false && creep.memory.spawnroom == roomName));
        var smallHarvesters = _.filter(harvesters, (creep) => (creep.body.length < 6));
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.extern == false && creep.memory.spawnroom == roomName);
        var buildersHelpers = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.spawnroom == roomName && creep.memory.mainroom != roomName);
        var upgraders = _.filter(Game.creeps, (creep) => (creep.memory.role == 'upgrader' && creep.memory.extern == false && creep.memory.spawnroom == roomName));
        var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.memory.extern == false && creep.memory.spawnroom == roomName);
        var attackers = _.filter(Game.creeps, (creep) => creep.memory.role == 'attacker' && creep.memory.spawnroom == roomName);
        var healers = _.filter(Game.creeps, (creep) => creep.memory.role == 'healers' && creep.memory.spawnroom == roomName);
        var extractors = _.filter(Game.creeps, (creep) => (creep.memory.role == 'extractor') && creep.memory.extern == false && creep.memory.spawnroom == roomName);

        logger.warn('Room '+roomName+' Harvesters:' + harvesters.length + ' ('+smallHarvesters.length+') ' +
            'Builders:' + builders.length + ' (' + buildersHelpers.length + ' ) ' +
            'Upgraders:' + upgraders.length + ' ()  ' +
            'Repairers:' + repairers.length + ' ()  ' +
            'Attackers: ' + attackers.length+'  Extractors: '+extractors.length,classname);


        var totalEnergyStored = 0;
        var maxEnergyStored = 0;
        var storageEnergy = 0;

        var containers = this.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_CONTAINER }
        });
        for(let container of containers){
            totalEnergyStored += container.store[RESOURCE_ENERGY];
            maxEnergyStored += container.storeCapacity;
        }

        if(this.storage)
        storageEnergy = this.storage.store[RESOURCE_ENERGY];
        var constructionsSites = this.find(FIND_CONSTRUCTION_SITES);

        var energy = this.energyAvailable;
        var maxEnergy = this.energyCapacityAvailable;

        if (harvesters.length == 0) {
            maxEnergy = energy > 300 ? energy : 300;
        }
        if (harvesters.length == 1 && maxEnergy >= 600 && smallHarvesters.length == 1) {
            maxEnergy = energy > 700 ? energy : 700;
        }


        var role = undefined;
        var extern = false;

        var mainroom = roomName;
        var targetroom = undefined;

        // if(maxEnergy > 3000 && !Memory.attacker.target){
        //     maxEnergy = 3000;
        // }

        if (harvesters.length < sources) {
            role = 'harvester';
            maxEnergy = maxEnergy > 1200 ? 1200 : maxEnergy;
        } else if (harvesters.length == sources && smallHarvesters.length >0 && this.controller.level > 3) {
            role = 'harvester';
            maxEnergy = maxEnergy > 1200 ? 1200 : maxEnergy;
        }  else if(extractors.length < sources){
            role = 'extractor';
            maxEnergy = maxEnergy > 800 ? 800 : maxEnergy;
        }  else if (Memory.attacker.target && attackers.length < 1) {
            role = 'attacker';
            targetroom = Memory.attacker.target;
        } else if (Memory.attacker.target && healers.length < 1) {
            role = 'healer';
            targetroom = Memory.attacker.target;
        } else if (Memory.attacker.target && attackers.length < 4) {
            role = 'attacker';
            targetroom = Memory.attacker.target;
        } else if (upgraders.length < 1) {
            role = 'upgrader';
            if(storageEnergy < 100000){
                maxEnergy = maxEnergy > 1200 ? 1200 : maxEnergy;
            }
        } else if (constructionsSites.length / 11 > builders.length && builders.length < 1 && Game.cpu.bucket > 2500) {
            role = 'builder';
            maxEnergy = maxEnergy > 1200 ? 1200 : maxEnergy;
        } else if (Memory.spawner.target && buildersHelpers.length < 2) { //+1
            role = 'builder';
            maxEnergy = maxEnergy > 3000 ? 3000 : maxEnergy;
            mainroom = Memory.spawner.target;
        } else if (repairers.length < 1 && Game.cpu.bucket > 2500) {
            role = 'repairer';
            maxEnergy = maxEnergy > 1200 ? 1200 : maxEnergy;
        } else if (upgraders.length < sources) {
            role = 'upgrader';
            if(storageEnergy < 100000){
                maxEnergy = maxEnergy > 1200 ? 1200 : maxEnergy;
            }
        } else if (upgraders.length < (2*sources) && storageEnergy > 300000 && Game.cpu.bucket > 3000) {
            role = 'upgrader';
        }

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
                }
                for (var i = 0; i < number; i++) {
                    body.push(ATTACK);
                }
            } else if (role == 'healer') {
                var number = Math.floor(maxEnergy / 250);
                var rest = maxEnergy % 190;
                number -= 1;
                for (var i = 0; i < number; i++) {
                    body.push(TOUGH);
                }
                for (var i = 0; i < number; i++) {
                    body.push(MOVE);
                }
                for (var i = 0; i < number; i++) {
                    body.push(HEAL);
                }
            }else if (role == 'extractor') {
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
            } else if (role == 'harvester' && extractors.length > 0 && maxEnergy > 1000) {
                if(!this.storage){
                    body.push(WORK);
                    body.push(WORK);
                    maxEnergy = maxEnergy - 200;
                }
                var number = Math.floor(maxEnergy / 100);
                number = number > 12 ? 12 : number;
                for (var i = 0; i < number; i++) {
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


            if(body.length >50){
                body = body.slice(0,50);
            }

            //get least used extern room
            var externRoomNumber = undefined;
            var roomnumber = undefined;

            logger.log('Suggested role: ' + role + (extern ? ' (E)' : ' ') + ' energy: ' + energy + '/' + this.energyCapacityAvailable + " " + body,classname);

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
};
