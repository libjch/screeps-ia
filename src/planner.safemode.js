
var logger = require('logger');
var buildUtil = require('util.build');
var classname = 'SafeModePLanner';
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('planner.road');
 * mod.thing == 'a thing'; // true
 */


Room.prototype.checkSafeMode = function(){
    if (this.controller && this.controller.my) {

        var hostiles = this.find(FIND_HOSTILE_CREEPS);

        if(hostiles && hostiles.length > 2){
            this.controller.activateSafeMode();
        }
    }
};