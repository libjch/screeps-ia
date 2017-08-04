
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleAttacker = require('role.attacker');
var roleHealer = require('role.healer');
var roleClaimer = require('role.claimer');
var roleExtractor = require('role.extractor');
var spawnDecider = require('spawn.decide');
var towerAttack = require('tower.attack');
var recorder = require('stats.record');
var roadPlanner = require('planner.road');
var extensionPlanner = require('planner.extension');
var towerPlanner = require('planner.tower');
var wallPlanner = require('planner.wall');
var storagePlanner = require('planner.storage');
var removeConstructionSites = require('planner.ennemies');
var checkSafemode = require('planner.safemode');


var logger = require('logger');

var profiler = require('screeps-profiler');
var classname = 'Main';

var lastCpu = 0;

function printFloat(value) {
    return ('' + value).substr(0, 5);
}

function tick(step) {
    var nowCpu = Game.cpu.getUsed();
    step = (step + '               ').substr(0, 15);
    if (nowCpu - lastCpu > 0.5) {
        logger.error('CPU Usage ' + step + ': ' + printFloat(nowCpu - lastCpu) + ' total:' + printFloat(nowCpu));
    } else {
        logger.trace('CPU Usage ' + step + ': ' + printFloat(nowCpu - lastCpu) + ' total:' + printFloat(nowCpu));
    }
    lastCpu = nowCpu;
}


// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function() {
    profiler.wrap(function() {

        logger.highlight('========== NEW TURN ' + Game.time + ' ============', classname);

        lastCpu = 0;
        logger.trace('CPU usage:' + Game.cpu.getUsed() + ' tickLimit:' + Game.cpu.tickLimit + ' bucket:' + Game.cpu.bucket + ' limit:' + Game.cpu.limit);
        logger.info(Memory.start);

        if(!Memory.extractors){
            Memory.extractors = {};
        }
        if(!Memory.containers){
            Memory.containers = {};
        }

        logger.init();

        tick('Memory Loaded');

        if (Game.time % 100 == 0) {
            for (var i in Memory.creeps) {
                if (!Game.creeps[i]) {
                    logger.warn("Delete creep:" + Memory.creeps[i]);
                    delete Memory.creeps[i];
                }
            }
            tick('Cleaned Memory');
        }

        var rooms = [];
        for(let roomName in Game.rooms){
            rooms.push(Game.rooms[roomName]);
        }


        if (Game.time % 10 == 0 && Game.cpu.bucket > 500) {
            for(let room of rooms){
                room.spawnDecide();
            }
            tick('SpawnDecide');
        }


        for(let room of rooms){
            room.runTowers();
        }
        tick('TowerAttack');

        if (Game.time % 10 == 1 && Game.cpu.bucket > 2000) {
            Memory.containers = {};
            for(let room of rooms){
                room.cleanExtractors();
            }
            tick('Extractors');
        }

        if (Game.time % 100 == 22  && Game.cpu.bucket > 3000) {
            for(let room of rooms){
                room.checkRoads();
            }
            tick('CheckRoads');
        }

        if (Game.time % 100 == 33) {
            for(let room of rooms){
                room.checkExtensions();
            }
            tick('CheckExtensions');
        }

        if (Game.time % 100 == 44) {
            for(let room of rooms){
                room.checkTowers();
            }
            tick('CheckTowers');
        }

        if (Game.time % 200 == 55  && Game.cpu.bucket > 5000) {
            try {
                for(let room of rooms){
                    //room.checkWalls();
                }
            } catch (e) {
                logger.error("ERROR  " + e, classname);
            }
            tick('wallPlanners');
        }

        if (Game.time % 200 == 66) {
            for(let room of rooms){
                room.checkStorage();
            }
            tick('CheckStorage');
        }

        if (Game.time % 200 == 66) {
            for(let room of rooms){
                room.checkSafeMode();
            }
            tick('CheckSafeMode');
        }


        if (Game.time % 100 == 77) {
            for(let room of rooms){
                room.removeEnnemyConstructionSites();
            }
            tick('CheckRemoveOtherConstructions');
        }

        if (Game.time % 10 == 3) {
            for(let room of rooms){
                room.checkSafeMode();
            }
            tick('CheckRemoveOtherConstructions');
        }

        tick('Load creeps scripts');

        var creeps = [];

        for (var name in Game.creeps) {
            creeps.push(Game.creeps[name]);
        }

        creeps.sort(function (a, b) {
            if (a.memory.mainroom < b.memory.mainroom) return -1;
            if (a.memory.mainroom > b.memory.mainroom) return 1;

            if (a.memory.role < b.memory.role) return -1;
            if (a.memory.role > b.memory.role) return 1;
            return 0;
        });


        tick('StartCreeps');
        var lastRoom = '';
        for (let creep of creeps) {

            if(!creep.memory.number){
                creep.memory.number = 1;
            }
            if(lastRoom != creep.room.name){
                logger.log("===="+creep.room.name+"====");
                lastRoom = creep.room.name;
            }
            //pickup dropped enery;
            if (creep.carry.energy < creep.carryCapacity) {
                var energy = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
                if (energy.length) {
                    for (let e of energy) {
                        creep.pickup(e);
                    }
                }
            }

            if (!creep.memory.spawnroom) {
                creep.memory.spawnroom = creep.memory.mainroom;
            }
            //run roles
            //try {
            var role = creep.memory.role;

            if (creep.memory.role_override) {
                role = creep.memory.role_override;
            }

            if (creep.memory.role_override_time < Game.time) {
                creep.memory.role_override = undefined;
            }

            if (creep.ticksToLive == 100) {
                creep.memory.working = true;
            }
            if (creep.ticksToLive < 50) {
                creep.memory.working = true;
            }

            if (role == 'harvester') {
                creep.workHarvest();
            }
            else if (role == 'upgrader' || role == 'upgrader-c' || role == 'upgrader.c') {
                creep.workUpgrade();
            }
            else if (role == 'builder' && Game.cpu.bucket > 2200) {
                creep.workBuild();
            }
            else if (role == 'repairer' && Game.cpu.bucket > 2500) {
                creep.workRepair();
            }
            else if (role == 'attacker') {
                creep.workAttack();
            }
            else if (role == 'healer') {
                creep.workHeal();
            }
            else if (role == 'claimer') {
                creep.workClaim();
            } else if (role == 'extractor') {
                creep.workExtract();
            }
            // } catch (e) {
            //     logger.error('         ', classname)
            //     logger.error("ERROR  " + e, classname);
            //     logger.error('         ', classname)
            //     Game.notify(e);
            // }

            tick('Creep ' + creep.name);
        }
        recorder.record();
        tick('RecordStats');
    });
}

