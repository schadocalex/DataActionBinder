/**
 * Created by schad on 20/06/2016.
 */

var $ = require("jquery");
var DataActionBinder = require("./src/DataActionBinder");

$(document).ready(function() {
    var dataActionBinder = new DataActionBinder("ctn", require("./Evaluator"));
    dataActionBinder.update({size: 100});
    dataActionBinder.update({size: 101});
});
