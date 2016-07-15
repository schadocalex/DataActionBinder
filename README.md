# Data Action Binder
Data action binder. Parse all 'data-action*' attributes in the DOM and bind them.

## How to use

#### HTML

Any data-action* attribute on any tag is valid.
The data-action* attribute value must match one of the two pattern :
- `class : className : toggleExpression` : toggle the class `className` if the `toggleExpression` is true, determined by the Evaluator.
- `attr : attrName : valueExpression` : set the attribute `attrName` to the value of `valueExpression`.

You can also do math expression (before expression are evaluated by the Evaluator) if you include a math library. Just put your expression between ``` ` ```. If you use a variable, you must give it in the context (see JavaScript).

Sample :
- `<div data-action="class : EqualTo100 : (size $eq 100)" ></div>`
- ```<div data-action="attr : height : `size * 2`" ></div>```

#### JavaScript

Create an instance like that : `var dataActionBinder = new DataActionBinder("ctn", require("./Evaluator"), require("mathjs"));` where `ctn` is the HTML container id, `require("./Evaluator")` the Evaluator library and `require("mathjs")` the Math one.

To update the classes / attributes, just call `update(ctx)` method with a context :
``` javascript
dataActionBinder.update({
        size: 100,
        largeur: 200,
        hauteur: 100,
        color: "9006"
    });
```
The context is used for the Evaluator and the Math library. It must be a flat object.

#### Evaluator library

// TODO explain API

#### Math library

The Math library must be an object with an `eval(expression, variables)` method. It must take two arguments :
- `expression` : The exression to compute
- `variables` : A flat object containing variables and their value (this will be the context ctx given by the `update(ctx)` call).

This method must return the expression value after replacing all variables.
Sample :
``` javascript
  Math.eval("x * 2", {x: 4}) === 8 // true
```

## Full Sample

See sample.html and sample.js.

To run the sample, run in cmd `npm run sample` and then open `sample.html`.
