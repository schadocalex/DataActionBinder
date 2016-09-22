"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = require("jquery");

var REGEXP_DATA_ACTION_ATTR = /^\s*(.+?)\s*:\s*(.+?)\s*:\s*(.+?)\s*$/;
var REGEXP_GROUP_OP = /\(\s*(\$\w+)(.+)\)/;
var REGEXP_SIMPLE_OP = /\(\s*(\w+)\s*(\$\w+)\s*(.+?)\s*\)/g;
var REGEXP_MATH = /`(.+?)`/g;

// Add a method to get all "data-*" attributes. See http://stackoverflow.com/questions/27973380/how-to-get-all-data-attributes-by-prefix
// Modified to call fn function with the HTML element, and the value of the data-* attribute.
$.fn.dataStartsWithForEach = function (p, fn) {
    var pCamel = p.replace(/-([a-z])/ig, function (m, $1) {
        return $1.toUpperCase();
    });
    this.each(function (i, el) {
        Object.keys(el.dataset).filter(function (v) {
            return v.indexOf(pCamel) > -1;
        }).forEach(function (v) {
            fn(el, el.dataset[v], v);
        });
    });
};

var DataActionBinder = function () {
    function DataActionBinder(ctnId, _Filter, _Math) {
        _classCallCheck(this, DataActionBinder);

        this.ctnId = ctnId;
        this.Filter = _Filter;
        this.Math = _Math;
    }

    _createClass(DataActionBinder, [{
        key: "update",
        value: function update(ctx) {
            var _this = this;

            $(document.getElementById(this.ctnId)).find("*") // Get all children
            .dataStartsWithForEach("action", function (el, attrValue, attrLabel) {
                // Compute math
                try {
                    attrValue = attrValue.replace(REGEXP_MATH, function (m, $1) {
                        return _this.Math.eval($1, ctx);
                    });
                } catch (e) {
                    console.warn(attrValue + " can't be computed, a math expression is not valid. Please check that every variable exists.");
                    return;
                }

                // Split parameters
                var values = attrValue.match(REGEXP_DATA_ACTION_ATTR);

                switch (values[1]) {
                    case "class":
                        // Check with the filter
                        var check = false;
                        try {
                            var filterData = _this._convertInputToFilterData(values[3]);
                            var filter = new _this.Filter(filterData);
                            check = filter.match ? filter.match(ctx) : filter.check(ctx);
                        } catch (e) {
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

    }, {
        key: "_convertInputToFilterData",
        value: function _convertInputToFilterData(input) {
            var group = input.match(REGEXP_GROUP_OP);
            // If there is a group, convert all sub simple op to array
            if (group != null) {
                return _defineProperty({}, group[1], this._convertSimpleOp(group[2]));
            } else {
                var arr = this._convertSimpleOp(input);
                // If there is one simple op, return it, else return raw input
                if (arr.length > 0) {
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

    }, {
        key: "_convertSimpleOp",
        value: function _convertSimpleOp(input) {
            var results = [];
            var m;
            while ((m = REGEXP_SIMPLE_OP.exec(input)) != null) {
                results.push(JSON.parse('{ "' + m[1] + '" : { "' + m[2] + '" : ' + m[3].replace(/'/g, "\"") + ' } }'));
            }
            return results;
        }
    }]);

    return DataActionBinder;
}();

module.exports = DataActionBinder;