/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('global.variables');
 * mod.thing == 'a thing'; // true
 */

var truc = {
    rooms: function(){
        var data ={};
        data['main'] = ['E42S38','E43S38','E44S38'];
        data['others'] = {};
        (data['others'])['E42S38'] = ['E41S38','E42S39'];
        (data['others'])['E43S38'] = ['E43S37'];
        (data['others'])['E44S38'] = ['E44S39'];
        //data['targets_path'] = ['E43S38','E43S37','E44S37','E44S36','E43S36','E42S36'];
        //data['targets_final'] ='E42S36';
        data['targets_path'] = ['E43S38','E44S38','E44S37'];
        data['targets_final'] ='E44S37';

        data['attacker'] = true;
        return data;
    }
};

module.exports = truc;

