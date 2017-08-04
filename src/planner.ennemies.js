
var logger = require('logger');
var buildUtil = require('util.build');
var classname = 'EnnemyStructureRemover';
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('planner.road');
 * mod.thing == 'a thing'; // true
 */

Room.prototype.removeEnnemyConstructionSites = function(){
    if (this.controller && this.controller.my) {
        var number = 0;
        var constructionSites = this.find(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                return (!structure.my);
            }
        });


        for (let constructionSite of constructionSites) {
            //room.checkWalls();
            var res = constructionSite.remove();
            logger.warn("Removing " + constructionSite+" "+constructionSite.owner.username+" => "+res);
        }
    }
};