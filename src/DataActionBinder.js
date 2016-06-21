
var $ = require("jquery");
var math = require("mathjs");

const REGEXP_DATA_ACTION_ATTR = /^\s*(.+?)\s*:\s*(.+?)\s*:\s*(.+?)\s*$/;
const REGEXP_GROUP_OP = /\(\s*(\$\w+)(.+)\)/;
const REGEXP_SIMPLE_OP = /\(\s*(\w+)\s*(\$\w+)\s*(.+?)\s*\)/g;
const REGEXP_MATH = /`(.+?)`/g;

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
            .dataStartsWithForEach("action", (el, attrValue, attrLabel) => {
                // Compute math
                attrValue = attrValue.replace(REGEXP_MATH, (m, $1) => math.eval($1, ctx));

                // Split parameters
                var values = attrValue.match(REGEXP_DATA_ACTION_ATTR);

                switch(values[1]) {
                    case "class":
                        // Check with the filter
                        var check = false;
                        try {
                            var filterData = this._convertInputToFilterData(values[3]);
                            var filter = new this.Filter(filterData);
                            check = filter.check(ctx)
                        }
                        catch (e) {
                            check = false;
                        }

                        // Toggle the class depending on the check value
                        $(el).toggleClass(values[2], check);
                        break;
                    case "attr":
                        $(el).attr(values[2], values[3]);
                        break;
                }
            });
    }

    /**
     * Convert an filter input string to a filter plain object
     * @param input
     * @returns {*}
     * @private
     */
    _convertInputToFilterData(input) {
        var group = input.match(REGEXP_GROUP_OP);
        // If there is a group, convert all sub simple op to array
        if(group != null) {
            return {
                [group[1]]: this._convertSimpleOp(group[2])
            };
        }
        else {
            var arr = this._convertSimpleOp(input);
            // If there is one simple op, return it, else return raw input
            if(arr.length > 0) {
                return arr[0];
            } else {
                return input;
            }
        }
    }

    /**
     * Convert all "(name $op value)" matches in a string to an array of filter plain object.
     * @param input
     * @returns {Array}
     * @private
     */
    _convertSimpleOp(input) {
        var results = [];
        var m;
        while((m = REGEXP_SIMPLE_OP.exec(input)) != null) {
            results.push(JSON.parse('{ "'+m[1]+'" : { "'+m[2]+'" : '+m[3].replace(/'/g, "\"")+' } }'));
        }
        return results;
    }
}
module.exports = DataActionBinder;