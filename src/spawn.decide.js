var constants = require('global.variables');

module.exports = {

    spawn(){
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester'  && creep.memory.extern == false);
        var harvestersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.extern == true);

        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder'  && creep.memory.extern == false);
        var buildersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.extern == true);

        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader'  && creep.memory.extern == false);
        var upgradersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.memory.extern == true);


        var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer'  && creep.memory.extern == false);
        var repairersOut = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.memory.extern == true);

        var attackers = _.filter(Game.creeps, (creep) => creep.memory.role == 'attacker');


        console.log('Harvesters:' + harvesters.length + ' ('+harvestersOut.length + ') '+
            'Builders:' + builders.length + ' ('+buildersOut.length+')  '+
            'Upgraders:' + upgraders.length +' ('+upgradersOut.length+')  '+
            'Repairers:' + repairers.length +' ('+repairersOut.length+')  '+
            'Attackers: '+attackers.length);

        var room = Game.spawns.Spawn1.room;

        var energy = room.energyAvailable;
        var maxEnergy = room.energyCapacityAvailable;

        if(harvesters.length==0){
            maxEnergy=300;
        }if(harvesters.length==1 && harvestersOut.length == 0){
            maxEnergy=500;
        }

        var role = undefined;
        var extern = false;
        var roomnumber = undefined;
        if(harvesters.length < 2) {
            role = 'harvester';
        }else if(harvestersOut.length < 4){ //+2
            role = 'harvester';
            extern = true;
        }else if(builders.length < 1){
            role = 'builder';
        }else if(repairers.length < 1){
            role = 'repairer';
        }else if(upgraders.length < 1){
            role = 'upgrader';
        }else if(constants.rooms().attacker && attackers.length < 1){
            role = 'attacker';
            extern = true;
        }else if(harvestersOut.length < 4){ //+2
            role = 'harvester';
            extern = true;
        }else if(buildersOut.length < 1){ //+1
            role = 'builder';
            roomnumber = 0;
            extern = true;
        }else if(repairersOut.length < 2) { //+1
            role = 'repairer';
            extern = true;
        }else if(harvestersOut.length < 0){ //+2
            role = 'harvester';
            extern = true;
        }else if(upgradersOut.length < 4) { //+4
            role = 'upgrader';
            extern = true;
        }else if(buildersOut.length < 0) { //+3
            role = 'builder';
            extern = true;
        }else if(upgradersOut.length < 4) { //+3
            role = 'upgrader';
            extern = true;
        }

        console.log('Suggested role: '+role+ (extern ? ' (E)' : ' ')+' energy: '+energy+'/'+maxEnergy);
        //MOVE 50
        //WORK 100
        //CARRY 50
        var body = [];
        if(role != undefined){
            if(role == 'attacker'){
                var number = Math.floor(maxEnergy / 200);
                var rest = maxEnergy % 200;
                for(var i = 0; i < number; i++){
                    body.push(MOVE);
                    body.push(MOVE);
                    body.push(ATTACK);
                    body.push(TOUGH);
                    body.push(TOUGH);
                }
                if(rest >= 150){
                    body.push(MOVE);
                }
            }
            else if(true || !extern){
                var number = Math.floor(maxEnergy / 200);
                var rest = maxEnergy % 200;
                for(var i = 0; i < number; i++){
                    body.push(WORK);
                    body.push(CARRY);
                    body.push(MOVE);
                }
                if(rest >= 150){
                    body.push(MOVE);
                }if(rest >= 100){
                    body.push(CARRY);
                }if(rest >= 50){
                    body.push(MOVE);
                }
            }else{
                body.push(WORK);
                body.push(MOVE);
                maxEnergy -= 150;
                if(maxEnergy >= 650){
                    body.push(WORK);
                    body.push(MOVE);
                    maxEnergy = maxEnergy - 150;
                }
                var number = Math.floor(maxEnergy / 100);
                var rest = maxEnergy % 100;
                for(var i = 0; i < number; i++){
                    body.push(CARRY);
                    body.push(MOVE);
                }
                if(rest >= 50){
                    body.push(MOVE);
                }
            }
            var number = Memory.global_id;
            var res =  Game.spawns.Spawn1.createCreep(body, undefined, {role: role, extern: extern ,number:number, roomnumber: roomnumber});
            if(_.isString(res)){
                console.log(res);
                Memory.global_id = number+1;
            }
        }
    }
};
