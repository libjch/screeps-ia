
var logger = require('logger');
var classname = 'ExtensionPlanner';
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('road.planner');
 * mod.thing == 'a thing'; // true
 */

function getAvailableExtensionsNumber(room) {
    switch (room.controller.level){
        case 1: return 0;
        case 2: return 5;
        case 3: return 10;
        case 4: return 20;
        case 5: return 30;
        case 6: return 40;
        case 7: return 50;
        case 8: return 60;
        default: return 0;
    }
}

module.exports = {
    checkExtensions: function(){
        if(Game.time % 1 == 0){
            for(var roomName in Game.rooms) {
                var room = Game.rooms[roomName];
                if (room.controller && room.controller.my) {

                    var roomSpawn = undefined;
                    for(var i in Game.spawns) {
                        var spawn = Game.spawns[i];
                        if(spawn.room == room){
                            roomSpawn = spawn;
                            break;
                        }
                    }

                    var number = 0;
                    var extensions = room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION);
                        }
                    });
                    number += extensions.length;

                    var extensionsSites = room.find(FIND_CONSTRUCTION_SITES, {
                        filter: (csite) => {
                            return (csite.structureType == STRUCTURE_EXTENSION);
                        }
                    });

                    number += extensionsSites.length;

                    logger.log("Number of extensions: " + number + " (" + extensions.length + ',' + extensionsSites.length + ')', classname);

                    //Availables extensions:
                    var avails = getAvailableNUmber(room);

                    if(number < avails){
                        //Build around spawner
                        if(roomSpawn == undefined){
                            logger.error('No spawn found for room '+roomName,classname);
                            continue;
                        }

                        //Find 1st spot available around spawn:
                        for(let dx = 0; dx < 10; dx++){
                            for(let dxs = -1; dxs <2;dxs +=2){ //go both ways
                                for(let dy = 0; dy < 10; dy++){
                                    for(let dys = -1; dys < 2; dys +=2){ //search both ways
                                        if(dx%2 == dy%2){ //on the grid
                                            var x = spawn.pos.x + (dx*dxs);
                                            var y = spawn.pos.y + (dy*dys);
                                            var res = room.createConstructionSite(x, y, STRUCTURE_EXTENSION);

                                            logger.warn("Create extensions at:"+x+' '+y+' '+res,classname);
                                            if(res == OK){
                                                number++;
                                                if(number == avails){
                                                    return;
                                                }
                                            }

                                        }
                                    }
                                }
                            }

                        }
                    }
                }
            }

        }
    }
};