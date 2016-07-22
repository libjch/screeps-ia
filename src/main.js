var roleHarvester = require('role.harvester');
var roleHarvesterContainer = require('role.harvester.container');
var roleUpgrader = require('role.upgrader');
var roleUpgraderContainer = require('role.upgrader.container');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleAttacker = require('role.attacker');
var roleClaimer = require('role.claimer');
var roleExtractor = require('role.extractor');

var spawnDecider = require('spawn.decide');
var towerAttack = require('tower.attack');

var constants = require('global.variables');
var recorder = require('stats.record');

var roadPlanner = require('road.planner');
var logger = require('logger');

module.exports.loop = function () {
    logger.highlight('========== NEW TURN ============',1);
    //Clear: Game.rooms['E42S38'].find(FIND_CONSTRUCTION_SITES).forEach(a => a.remove());

    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    spawnDecider.spawn();
    towerAttack.attack();
    roleExtractor.cleanExtractors();

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



    for(let creep of creeps) {

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
        if(creep.memory.roomnumber){
            creep.memory.externRoom = creep.memory.roomnumber;
        }

        var place = creep.room.name+'-'+creep.pos.x+'-'+creep.pos.y;
        if(!Memory.roadPlaces[place]){
            Memory.roadPlaces[place]=1;
        }else{
            Memory.roadPlaces[place] = Memory.roadPlaces[place]+1;
        }

        /*if(creep.memory.extern && !creep.memory.externRoom ){
            var otherRooms = constants.rooms().others[creep.memory.mainroom];
            var x = creep.memory.number % otherRooms.length;
            creep.memory.externRoom = x;
        }*/

        logger.warn('-'+creep.name+' '+creep.memory.mainroom+' '+
            (creep.memory.extern?'(E '+creep.memory.externRoom+') ' : '')+
            creep.memory.number + ' ' +
            creep.memory.role +' '+
            creep.carry.energy +'/'+creep.carryCapacity +' ' +
            creep.pos);

        //run roles
        try{
            var role = creep.memory.role;
            if(creep.memory.role_override){
                role = creep.memory.role_override;
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
                roleUpgrader.run(creep);
                //roleUpgraderContainer.run(creep);
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
            logger.error('         ')
            logger.error("ERROR  "+e);
            logger.error('         ')
        }
    }

    recorder.record();
};

//Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY],'JC', {role: 'builder', extern: false,number:1,roomnumber:0,mainroom:'E43S38'});
/*
 role: role,
 extern: extern,
 number: number,
 roomnumber: roomnumber,
 mainroom: roomName
 */