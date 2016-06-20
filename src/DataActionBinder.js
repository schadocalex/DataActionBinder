
var $ = require("jquery");

// Add a method to get all "data-*" attributes. See http://stackoverflow.com/questions/27973380/how-to-get-all-data-attributes-by-prefix
// Modified to call fn function with the HTML element, and the value of the data-* attribute.
$.fn.dataStartsWithForEach = function(p, fn) {
    var pCamel = p.replace(/-([a-z])/ig, function(m,$1) { return $1.toUpperCase(); });
    this.each(function(i, el){
        Object.keys(el.dataset).filter(function(v){
            return v.indexOf(pCamel) > -1;
        }).forEach(function(v) {
            fn(el, el.dataset[v], v);
        });
    });
};

class DataActionBinder {
    constructor(ctnId, _Filter) {
        this.ctnId = ctnId;
        this.Filter = _Filter;
    }

    update(ctx) {
        $(document.getElementById(this.ctnId)).find("*") // Get all children
            .dataStartsWithForEach("action", (el, attr, name) => {
                var values = attr.split(":");
                var filterData = JSON.parse(values[2].replace(/^{(.+)\.(\$.+)\.(.+)}$/, '{ "$1" : { "$2" : $3 } }'));

                var filter = new this.Filter(filterData);
                $(el).toggleClass(values[1], filter.check(ctx));
            });
    }
}
module.exports = DataActionBinder;