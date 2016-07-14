/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('global.variables');
 * mod.thing == 'a thing'; // true
 */

var truc = {
    rooms: function(){return  {main:['E42S38','E43S38'],others:{ E42S39:['E41S38','E42S39'], E43S38:['E43S37']},targets:['E43S38','E43S37'],attacker:false};
    }
};

module.exports = truc;