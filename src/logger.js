
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

function log(message, severity = 3) {
    if(severity > 5) {
        severity = 5
    } else if (severity < 0) {
        severity = 0
    } else if (!Number.isInteger(severity)) {
        severity = 3
    }
    console.log('<font color="' + colors[severity] + '" severity="' + severity + '">' + message + "</font>")
}

function highlight (message) {
    console.log('<font color="' + colors['highlight'] + '" type="highlight">' + message + "</font>")
}

function info(message){
    //log(message, 1);
}
function debug(message){
    log(message,2);
}

function warn(message){
    log(message, 4);
}

function error(message){
    log(message,5);
}


module.exports = ExampleLogger