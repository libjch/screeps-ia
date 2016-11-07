var roleHarvester;
var roleHarvesterContainer;
var roleUpgrader;
var roleUpgraderContainer;
var roleBuilder;
var roleRepairer;
var roleAttacker;
var roleClaimer;
var roleExtractor;

var spawnDecider;
var towerAttack;

var recorder;

var roadPlanner;
var extensionPlanner;
var towerPlanner;
var wallPlanner;



var logger = require('logger');
var classname = 'Main';

var lastCpu = 0;

function printFloat(value){
    return (''+value).substr(0,5);
}

function tick(step){
    var nowCpu = Game.cpu.getUsed();
    step = (step+'               ').substr(0,15);
    logger.trace('CPU Usage '+step+': '+ printFloat(nowCpu - lastCpu)+' total:'+printFloat(nowCpu));
    lastCpu = nowCpu;
}

module.exports.loop = function () {
    logger.highlight('========== NEW TURN '+Game.time+' ============',classname);
    lastCpu = 0;
    logger.trace('CPU usage:'+Game.cpu.getUsed()+' tickLimit:'+Game.cpu.tickLimit+' bucket:'+Game.cpu.bucket+' limit:'+Game.cpu.limit);

    tick('Start');

    if(Game.time % 100 == 0){
        for(var i in Memory.creeps) {
            if(!Game.creeps[i]) {
                logger.warn("Delete creep:"+Memory.creeps[i]);
                delete Memory.creeps[i];
            }
        }
        tick('Cleaned Memory');
    }


    if(Game.cpu.bucket > 5000 || Game.time % 10 == 0){
        spawnDecider = require('spawn.decide');
        spawnDecider.spawn();
        tick('SpawnDecide');
    }

    towerAttack = require('tower.attack');
    towerAttack.attack();
    tick('TowerAttack');

    if(Game.time % 10 == 1) {
        roleExtractor = require('role.extractor');
        roleExtractor.cleanExtractors();
        tick('Extractors');
    }

    if(Game.time % 100 == 2) {
        roadPlanner = require('road.planner');
        roadPlanner.checkRoads();
        tick('CheckRoads');
    }

    if(Game.time % 100 == 3) {
        extensionPlanner = require('extension.planner');
        extensionPlanner.checkExtensions();
        tick('CheckExtensions');
    }

    if(Game.time % 100 == 4) {
        towerPlanner = require('tower.planner');
        towerPlanner.checkTowers();
        tick('CheckTowers');
    }

    if(Game.time % 1000 == 5){
        wallPlanner = require('wall.planner');
        try{
            wallPlanner.checkWalls();
        }catch(e) {
            logger.error("ERROR  "+e,classname);
        }
        tick('wallPlanners');
    }

    roleHarvester = require('role.harvester');
    roleHarvesterContainer = require('role.harvester.container');
    roleUpgrader = require('role.upgrader');
    roleUpgraderContainer =  require('role.upgrader.container');
    roleBuilder = require('role.builder');
    roleRepairer = require('role.repairer');
    roleAttacker = require('role.attacker');
    roleClaimer = require('role.claimer');
    roleExtractor = require('role.extractor');
    tick('Load creeps scripts');

    var creeps = [];

    for(var name in Game.creeps) {
        creeps.push(Game.creeps[name]);
    }

    creeps.sort(function(a, b){
        if(a.memory.mainroom < b.memory.mainroom) return -1;
        if(a.memory.mainroom > b.memory.mainroom) return 1;

        if(a.memory.role < b.memory.role) return -1;
        if(a.memory.role > b.memory.role) return 1;
        return 0;
    });


    tick('StartCreeps');
    for(let creep of creeps) {

        //pickup dropped enery;
        if (creep.carry.energy < creep.carryCapacity) {
            var energy = creep.pos.findInRange(FIND_DROPPED_ENERGY,1);
            if (energy.length) {
                for(let e of energy) {
                    creep.pickup(e);
                }
            }
        }

        var place = creep.room.name+'-'+creep.pos.x+'-'+creep.pos.y;

        if(!creep.memory.spawnroom){
            creep.memory.spawnroom = creep.memory.mainroom;
        }
        //run roles
        try{
            var role = creep.memory.role;

            if(creep.memory.role_override){
                role = creep.memory.role_override;
            }

            if(creep.memory.role_override_time < Game.time){
                creep.memory.role_override = undefined;
            }

            if(creep.ticksToLive == 100){
                creep.memory.working = true;
            }
            if(creep.ticksToLive < 50){
                creep.memory.working = true;
            }

            if(role == 'harvester') {
                roleHarvester.run(creep);
            }
            else if(role == 'harvester-c' || role == 'harvester.c') {
                roleHarvesterContainer.run(creep);
            }
            else if(role == 'upgrader') {
                roleUpgrader.run(creep);
            }
            else if(role == 'upgrader-c' || role == 'upgrader.c') {
                //roleUpgrader.run(creep);
                roleUpgraderContainer.run(creep);
            }
            else if(role == 'builder') {
                roleBuilder.run(creep);
            }
            else if(role == 'repairer') {
                roleRepairer.run(creep);
            }
            else if(role == 'attacker') {
                roleAttacker.run(creep);
            }
            else if(role == 'claimer') {
                roleClaimer.run(creep);
            }else if(role == 'extractor'){
                roleExtractor.run(creep);
            }
        }catch(e){
            logger.error('         ',classname)
            logger.error("ERROR  "+e,classname);
            logger.error('         ',classname)
            Game.notify(e);
        }

        tick('Creep '+creep.name);
    }

    recorder = require('stats.record');
    recorder.record();
    tick('RecordStats');
};
