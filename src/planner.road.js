
var logger = require('logger');
var classname = 'RoadPlanner';
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('planner.road');
 * mod.thing == 'a thing'; // true
 */

Room.prototype.checkRoads = function(){
    if (this.controller && this.controller.my) {
        var sources = this.find(FIND_SOURCES);

        //Build roads from sources to controller
        for (let source of sources) {
            var path = this.findPath(source.pos, this.controller.pos, {ignoreCreeps: true, swampCost: 2});
            for (let i = 1; i < 40 && i < path.length-2; i++) {
                var res = this.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
                if(res != ERR_INVALID_TARGET){
                    logger.debug("Create road to controller:" +res ,classname);
                }
            }
        }

        var roomSpawn = undefined;
        for(var i in Game.spawns) {
            logger.warn(i+" "+Game.spawns[i]);
            var spawn = Game.spawns[i];
            if(spawn.room.name == this.name){
                roomSpawn = spawn;
                break;
            }
        }
        //Build around spawner
        if(roomSpawn == undefined){
            logger.error('No spawn found for room '+this.name,classname);
            return;
        }

        var path = this.findPath(roomSpawn.pos, this.controller.pos, {ignoreCreeps: true, swampCost: 2});
        for (let i = 1; i < 40 && i < path.length-1; i++) {
            var res = this.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
            if(res != ERR_INVALID_TARGET){
                logger.debug("Create road to spawnCenter:" +res ,classname);
            }
        }
    }
};