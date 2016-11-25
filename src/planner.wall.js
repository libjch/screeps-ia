
var logger = require('logger');
var buildUtil = require('util.build');
var classname = 'WallPlanner';
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('planner.road');
 * mod.thing == 'a thing'; // true
 */
var spawn = undefined;

Room.prototype.checkAndBuild = function(x,y,type){
    var existing = this.lookForAt(LOOK_TERRAIN,x,y);
    if(existing == 'wall'){
        return;
    }

    existing = this.lookForAt(LOOK_CONSTRUCTION_SITES,x,y);
    if(existing.length){
        return;
    }
    existing = this.lookForAt(LOOK_STRUCTURES,x,y);
    if(existing.length){
        return;
    }

    var path = spawn.pos.findPathTo(x,y);
    if(path.length) {
        var res = "";
        for(let step of path){
            res += "("+step.x+','+step.y+')';
        }
        var step = path[path.length-1];
        if(step.x != x || step.y != step.y){
            console.log('NO Path find to '+x+' '+y+' '+step.x+' '+step.y);
        }else{
            console.log('OK Path find to '+x+' '+y+' '+step.x+' '+step.y);
            this.createConstructionSite(x, y, type);
        }
    }
    else{
        logger.warn('No path found to '+x+' '+y,classname);
    }
};

Room.prototype.checkWalls = function(){
    if (this.controller && this.controller.my) {
        //var exits = Game.map.describeExits(roomName);
        var spawns = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
        if(!spawns || spawns.length == 0) {
            return;
        }
        var spawn = spawns[0];
        logger.debug(spawn+" "+spawn.pos,classname);
        {//Left wall:
            var exit = spawn.pos.findClosestByPath(FIND_EXIT_LEFT);
            if(exit) {
                logger.debug(exit, classname);
                var entrances = this.lookForAtArea(LOOK_TERRAIN, 0, 0, 49, 0);
                var x = 2;
                for (let y = 0; y < 49; y++) {
                    if (entrances[y][0] == 'plain') {
                        if (entrances[y - 1][0] == 'wall') {
                            //new border
                            this.checkAndBuild( x, y - 1, STRUCTURE_WALL);
                            this.checkAndBuild( x, y - 2, STRUCTURE_WALL);
                            this.checkAndBuild( x - 1, y - 2, STRUCTURE_WALL);
                        }
                        if (entrances[y + 1][0] == 'wall') {
                            //last of a border
                            this.checkAndBuild( x, y + 1, STRUCTURE_WALL);
                            this.checkAndBuild( x, y + 2, STRUCTURE_WALL);
                            this.checkAndBuild( x - 1, y + 2, STRUCTURE_WALL);
                        }
                        if (y == exit.y) {
                            //logger.debug('Create Rampart? '+x+' '+y);
                            var res = this.checkAndBuild( x, y, STRUCTURE_RAMPART);
                            //if(res != ERR_INVALID_TARGET){
                            //logger.debug("Create Rampart:" + res, classname);
                            //}
                        } else {
                            var res = this.checkAndBuild( x, y, STRUCTURE_WALL);
                            //if(res != ERR_INVALID_TARGET){
                            //logger.debug("Create wall:" + res, classname);
                            //}
                        }
                    }
                }
            }
        }
        {//Right wall:
            var exit = spawn.pos.findClosestByPath(FIND_EXIT_RIGHT);
            if(exit) {
                logger.debug(exit, classname);

                var entrances = this.lookForAtArea(LOOK_TERRAIN, 0, 49, 49, 49);
                var x = 47;
                for (let y = 0; y < 49; y++) {
                    if (entrances[y][49] == 'plain') {
                        if (entrances[y - 1][49] == 'wall') {
                            //new border
                            this.checkAndBuild( x, y - 1, STRUCTURE_WALL);
                            this.checkAndBuild( x, y - 2, STRUCTURE_WALL);
                            this.checkAndBuild( x + 1, y - 2, STRUCTURE_WALL);
                        }
                        if (entrances[y + 1][49] == 'wall') {
                            //last of a border
                            this.checkAndBuild( x, y + 1, STRUCTURE_WALL);
                            this.checkAndBuild( x, y + 2, STRUCTURE_WALL);
                            this.checkAndBuild( x + 1, y + 2, STRUCTURE_WALL);
                        }
                        if (y == exit.y) {
                            //logger.debug('Create Rampart? '+x+' '+y);
                            var res = this.checkAndBuild( x, y, STRUCTURE_RAMPART);
                            //if(res != ERR_INVALID_TARGET){
                            //logger.debug("Create Rampart:" + res, classname);
                            //}
                        } else {
                            var res = this.checkAndBuild( x, y, STRUCTURE_WALL);
                            //if(res != ERR_INVALID_TARGET){
                            //logger.debug("Create wall:" + res, classname);
                            //}
                        }
                    }
                }
            }
        }
        {//Top wall:
            var exit = spawn.pos.findClosestByPath(FIND_EXIT_TOP);
            if(exit) {
                logger.debug(exit, classname);
                var entrances = this.lookForAtArea(LOOK_TERRAIN, 0, 0, 0, 49);
                var y = 2;
                for (let x = 0; x < 49; x++) {
                    if (entrances[0][x] == 'plain') {
                        if (entrances[0][x - 1] == 'wall') {
                            //new border
                            this.checkAndBuild( x - 1, y, STRUCTURE_WALL);
                            this.checkAndBuild( x - 2, y, STRUCTURE_WALL);
                            this.checkAndBuild( x - 2, y - 1, STRUCTURE_WALL);
                        }
                        if (entrances[0][x + 1] == 'wall') {
                            //last of a border
                            this.checkAndBuild( x + 1, y, STRUCTURE_WALL);
                            this.checkAndBuild( x + 2, y, STRUCTURE_WALL);
                            this.checkAndBuild( x + 2, y - 1, STRUCTURE_WALL);
                        }
                        if (x == exit.x) {
                            //logger.debug('Create Rampart? '+x+' '+y);
                            var res = this.checkAndBuild( x, y, STRUCTURE_RAMPART);
                            //if(res != ERR_INVALID_TARGET){
                            //logger.debug("Create Rampart:" + res, classname);
                            //}
                        } else {
                            var res = this.checkAndBuild( x, y, STRUCTURE_WALL);
                            //if(res != ERR_INVALID_TARGET){
                            //logger.debug("Create wall:" + res, classname);
                            //}
                        }
                    }
                }
            }
        }
        {//Bottom wall:
            var exit = spawn.pos.findClosestByPath(FIND_EXIT_BOTTOM);
            if(exit) {
                logger.debug(exit,classname);
                var entrances = this.lookForAtArea(LOOK_TERRAIN, 49, 0, 49, 49);
                var y = 47;
                for (let x = 0; x < 49; x++) {
                    if (entrances[49][x] == 'plain') {
                        if (entrances[49][x - 1] == 'wall') {
                            //new border
                            this.checkAndBuild( x - 1, y, STRUCTURE_WALL);
                            this.checkAndBuild( x - 2, y, STRUCTURE_WALL);
                            this.checkAndBuild( x - 2, y + 1, STRUCTURE_WALL);
                        }
                        if (entrances[49][x + 1] == 'wall') {
                            //last of a border
                            this.checkAndBuild( x + 1, y, STRUCTURE_WALL);
                            this.checkAndBuild( x + 2, y, STRUCTURE_WALL);
                            this.checkAndBuild( x + 2, y + 1, STRUCTURE_WALL);
                        }
                        if (x == exit.x) {
                            //logger.debug('Create Rampart? '+x+' '+y);
                            var res = this.checkAndBuild( x, y, STRUCTURE_RAMPART);
                            //if(res != ERR_INVALID_TARGET){
                            //logger.debug("Create Rampart:" + res, classname);
                            //}
                        } else {
                            var res = this.checkAndBuild( x, y, STRUCTURE_WALL);
                            //if(res != ERR_INVALID_TARGET){
                            //logger.debug("Create wall:" + res, classname);
                            //}
                        }
                    }
                }
            }
        }

    }
};