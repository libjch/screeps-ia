
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleAttacker = require('role.attacker');
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

        if(Game.time > (15435544 + 5000)){
            Memory.attacker.target = undefined;
        }

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


        if (Game.time % 10 == 0 && Game.cpu.bucket > 1000) {
            spawnDecider.spawn();
            tick('SpawnDecide');
        }

        towerAttack.attack();
        tick('TowerAttack');

        if (Game.time % 10 == 1 && Game.cpu.bucket > 2000) {
            roleExtractor.cleanExtractors();
            tick('Extractors');
        }

        if (Game.time % 100 == 22  && Game.cpu.bucket > 3000) {
            roadPlanner.checkRoads();
            tick('CheckRoads');
        }

        if (Game.time % 100 == 33) {
            extensionPlanner.checkExtensions();
            tick('CheckExtensions');
        }

        if (Game.time % 100 == 44) {
            towerPlanner.checkTowers();
            tick('CheckTowers');
        }

        if (Game.time % 200 == 55  && Game.cpu.bucket > 5000) {
            try {
                wallPlanner.checkWalls();
            } catch (e) {
                logger.error("ERROR  " + e, classname);
            }
            tick('wallPlanners');
        }

        if (Game.time % 200 == 66) {
            storagePlanner.checkStorage();
            tick('CheckStorage');
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
        for (let creep of creeps) {

            //pickup dropped enery;
            if (creep.carry.energy < creep.carryCapacity) {
                var energy = creep.pos.findInRange(FIND_DROPPED_ENERGY, 1);
                if (energy.length) {
                    for (let e of energy) {
                        creep.pickup(e);
                    }
                }
            }

            var place = creep.room.name + '-' + creep.pos.x + '-' + creep.pos.y;

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
                roleHarvester.run(creep);
            }
            else if (role == 'harvester-c' || role == 'harvester.c') {
                roleHarvesterContainer.run(creep);
            }
            else if (role == 'upgrader' || role == 'upgrader-c' || role == 'upgrader.c') {
                roleUpgrader.run(creep);
            }
            else if (role == 'builder' && Game.cpu.bucket > 2200) {
                roleBuilder.run(creep);
            }
            else if (role == 'repairer' && Game.cpu.bucket > 2500) {
                roleRepairer.run(creep);
            }
            else if (role == 'attacker') {
                roleAttacker.run(creep);
            }
            else if (role == 'claimer') {
                roleClaimer.run(creep);
            } else if (role == 'extractor') {
                roleExtractor.run(creep);
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

