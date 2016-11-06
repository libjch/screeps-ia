var roleHarvester = require('role.harvester');
var roleHarvesterContainer = require('role.harvester.container');
var roleUpgrader = require('role.upgrader');
var roleUpgraderContainer =  require('role.upgrader.container');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleAttacker = require('role.attacker');
var roleClaimer = require('role.claimer');
var roleExtractor = require('role.extractor');

var spawnDecider = require('spawn.decide');
var towerAttack = require('tower.attack');

var recorder = require('stats.record');

var roadPlanner = require('road.planner');
var extensionPlanner = require('extension.planner');
var towerPlanner = require('tower.planner');

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


    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            logger.warn("Delete creep:"+Memory.creeps[i]);
            delete Memory.creeps[i];
        }
    }
    tick('Cleaned Memory');

    spawnDecider.spawn();
    tick('SpawnDecide');
    towerAttack.attack();
    tick('TowerAttack');
    roleExtractor.cleanExtractors();
    tick('Extractors');
    roadPlanner.checkRoads();
    tick('CheckRoads');
    extensionPlanner.checkExtensions();
    tick('CheckExtensions');
    towerPlanner.checkTowers();
    tick('CheckTowers');
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
        }

        tick('Creep '+creep.name);
    }
    recorder.record();
    tick('RecordStats');
};

//Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],'JC', {role: 'builder', extern: false,number:1,roomnumber:0,mainroom:'E43S38'});
/*
 role: role,
 extern: extern,
 number: number,
 roomnumber: roomnumber,
 mainroom: roomName
 */