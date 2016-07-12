/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('global.variables');
 * mod.thing == 'a thing'; // true
 */

var truc = {
    rooms: function(){return {main:'E42S38', others:['E43S38','E41S38','E42S39'], othersCapacity:[2,1,1], targets:['E41S38','E41S37'], attacker:false};}
};

module.exports = truc;