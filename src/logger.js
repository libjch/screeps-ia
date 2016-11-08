
var ScreepsLogger = {
    log: log,
    info: info,
    debug: debug,
    warn: warn,
    error: error,
    trace: trace,
    highlight: highlight,
    init: init
}

var colors = {
    '6': '#798686',
    '5': '#ff0066',
    '4': '#e65c00',
    '3': '#809fff',
    '2': '#999999',
    '1': '#737373',
    '0': '#666666',
    'classname': '#d3d3d3',
    'highlight': '#ffff00',
}

var mutedLogger = [];

function init(){
    for(let name in Memory.logger){
        mutedLogger.push(name);
    }
    var classname = 'RoleUpgrader';
    console.log(classname+" "+mutedLogger[classname])

}

function _log(message, severity, classname = '') {
    if(severity > 5) {
        severity = 5
    } else if (severity < 0) {
        severity = 0
    } else if (!Number.isInteger(severity)) {
        severity = 3
    }

    if(classname.length>2){
        if(mutedLogger[classname]){
            return;
        }
    }

    classname = (classname + '                               ').substr(0,20);

    console.log('<font color="' + colors['classname'] + '">' + classname + ': ' + '</font><font color="' + colors[severity] + '" severity="' + severity + '">' + message + "</font>")
}

function highlight (message,classname) {
    classname = (classname + '                                ').substr(0,20);
    console.log('<font color="' + colors['classname'] + '">' + classname + ': ' + '</font><font color="' + colors['highlight'] + '" type="highlight">' + message + "</font>")
}

function info(message, classname = ''){
    //_log(message, 1, classname);
}
function debug(message, classname = ''){
    _log(message,2,classname);
}

function log(message, classname = ''){
    _log(message,3,classname);
}


function warn(message, classname = ''){
    _log(message,4, classname);
}

function error(message, classname = ''){
    _log(message,5, classname);
}


function trace(message, classname = ''){
    _log(message,1, classname);
}


module.exports = ScreepsLogger