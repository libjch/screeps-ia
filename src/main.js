var roleHarvester = require('role.harvester');
var roleHarvesterContainer = require('role.harvester.container');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleAttacker = require('role.attacker');
var roleClaimer = require('role.claimer');

var spawnDecider = require('spawn.decide');
var towerAttack = require('tower.attack');

var constants = require('global.variables');
var recorder = require('stats.record');

var roadPlanner = require('road.planner');
var logger = require('logger');

module.exports.loop = function () {
    logger.log('========== NEW TURN ============',1);
    //Clear: Game.rooms['E42S38'].find(FIND_CONSTRUCTION_SITES).forEach(a => a.remove());
    if(Game.time % 100 == 0){

    }

    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    spawnDecider.spawn();
    towerAttack.attack();

    var count = 0;

    var creeps = [];

    for(var name in Game.creeps) {
        creeps.push(Game.creeps[name]);
    }

    creeps.sort(function(a, b){
        if(a.memory.role < b.memory.role) return -1;
        if(a.memory.role > b.memory.role) return 1;
        return 0;
    })

    for(var creep of creeps) {
        var roles = ['harvester','builder','upgrader','repairer'];

        //pickup dropped enery;
        if (creep.carry.energy < creep.carryCapacity)
        {
            var energy = creep.pos.findInRange(FIND_DROPPED_ENERGY,1);
            if (energy.length) {
                console.log('found ' + energy[0].energy + ' energy at ', energy[0].pos);
                creep.pickup(energy[0]);
            }
        }
        //if(creep.ticksToLive < 300){
        //    creep.memory.extern = false;
        //}

        if(creep.memory.extern){
            if(creep.memory.number % 4 <= 1){
                creep.memory.externRoom = 0;
            }else if(creep.memory.number % 4 == 2){
                creep.memory.externRoom = 1;
            }else if(creep.memory.number % 4 == 3){
                creep.memory.externRoom = 2;
            }
        }else{
            var place = creep.room.name+'-'+creep.pos.x+'-'+creep.pos.y;
            if(!Memory.roadPlaces[place]){
                Memory.roadPlaces[place]=1;
            }else{
                Memory.roadPlaces[place] = Memory.roadPlaces[place]+1;
            }
        }

        logger.log('-'+creep.name+' '+(creep.memory.extern?'(E '+creep.memory.externRoom+') ' : '')+creep.memory.number + ' ' +creep.memory.role +' '+creep.carry.energy +'/'+creep.carryCapacity +' '+creep.pos ,2);

        //run roles
        try{


            if(creep.memory.role == 'harvester') {
                roleHarvester.run(creep);
            }
            else if(creep.memory.role == 'harvester.c') {
                roleHarvesterContainer.run(creep);
            }
            else if(creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep);
            }
            else if(creep.memory.role == 'builder') {
                roleBuilder.run(creep);
            }
            else if(creep.memory.role == 'repairer') {
                roleRepairer.run(creep);
            }
            else if(creep.memory.role == 'attacker') {
                roleAttacker.run(creep);
            }
            else if(creep.memory.role == 'claimer') {
                roleClaimer.run(creep);
            }
        }catch(e){
            console.log("ERROR "+e)
        }
    }

    recorder.record();
}