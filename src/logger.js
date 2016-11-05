
var ExampleLogger = {
    log: log,
    info: info,
    debug: debug,
    warn: warn,
    error: error,
    highlight: highlight
}

var colors = {
    '5': '#ff0066',
    '4': '#e65c00',
    '3': '#809fff',
    '2': '#999999',
    '1': '#737373',
    '0': '#666666',
    'highlight': '#ffff00',
}

function log(message, severity, classname = '') {
    if(severity > 5) {
        severity = 5
    } else if (severity < 0) {
        severity = 0
    } else if (!Number.isInteger(severity)) {
        severity = 3
    }
    console.log('<font color="' + colors[severity] + '" severity="' + severity + '">' + classname + ': ' + message + "</font>")
}

function highlight (message,classname) {
    console.log('<font color="' + colors['highlight'] + '" type="highlight">' + classname + ': '+ message + "</font>")
}

function info(message, classname = ''){
    //log(message, 1, classname);
}
function debug(message, classname = ''){
    log(message,2,classname);
}

function warn(message, classname = ''){
    log(message, 4, classname);
}

function error(message, classname = ''){
    log(message,5, classname);
}


module.exports = ExampleLogger