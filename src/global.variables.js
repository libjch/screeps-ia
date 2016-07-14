/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('global.variables');
 * mod.thing == 'a thing'; // true
 */

var truc = {
    rooms: function(){return
        var data ={};
        data['main'] = ['E42S38','E43S38'];
        data['others'] = {};
        (data['others'])['E42S38'] = ['E41S38','E42S39'];
        (data['others'])['E43S38'] = ['E43S37'];
        data['targets'] =['E43S38','E43S37'];
        data['attacker'] = false;
        return data;
    }
};

module.exports = truc;