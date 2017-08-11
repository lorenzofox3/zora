'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var stream = _interopDefault(require('stream'));
var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var util = _interopDefault(require('util'));
var events = _interopDefault(require('events'));

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index$1 = function () {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined) return arguments[i];
    }
};

var index$3 = createCommonjsModule(function (module, exports) {
// through
//
// a stream that does nothing but re-emit the input.
// useful for aggregating a series of changing but not ending streams into one stream)

exports = module.exports = through;
through.through = through;

//create a readable writable stream.

function through (write, end, opts) {
  write = write || function (data) { this.queue(data); };
  end = end || function () { this.queue(null); };

  var ended = false, destroyed = false, buffer = [], _ended = false;
  var stream$$1 = new stream();
  stream$$1.readable = stream$$1.writable = true;
  stream$$1.paused = false;

//  stream.autoPause   = !(opts && opts.autoPause   === false)
  stream$$1.autoDestroy = !(opts && opts.autoDestroy === false);

  stream$$1.write = function (data) {
    write.call(this, data);
    return !stream$$1.paused
  };

  function drain() {
    while(buffer.length && !stream$$1.paused) {
      var data = buffer.shift();
      if(null === data)
        return stream$$1.emit('end')
      else
        stream$$1.emit('data', data);
    }
  }

  stream$$1.queue = stream$$1.push = function (data) {
//    console.error(ended)
    if(_ended) return stream$$1
    if(data === null) _ended = true;
    buffer.push(data);
    drain();
    return stream$$1
  };

  //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here.
  //this is only a problem if end is not emitted synchronously.
  //a nicer way to do this is to make sure this is the last listener for 'end'

  stream$$1.on('end', function () {
    stream$$1.readable = false;
    if(!stream$$1.writable && stream$$1.autoDestroy)
      process.nextTick(function () {
        stream$$1.destroy();
      });
  });

  function _end () {
    stream$$1.writable = false;
    end.call(stream$$1);
    if(!stream$$1.readable && stream$$1.autoDestroy)
      stream$$1.destroy();
  }

  stream$$1.end = function (data) {
    if(ended) return
    ended = true;
    if(arguments.length) stream$$1.write(data);
    _end(); // will emit or queue
    return stream$$1
  };

  stream$$1.destroy = function () {
    if(destroyed) return
    destroyed = true;
    ended = true;
    buffer.length = 0;
    stream$$1.writable = stream$$1.readable = false;
    stream$$1.emit('close');
    return stream$$1
  };

  stream$$1.pause = function () {
    if(stream$$1.paused) return
    stream$$1.paused = true;
    return stream$$1
  };

  stream$$1.resume = function () {
    if(stream$$1.paused) {
      stream$$1.paused = false;
      stream$$1.emit('resume');
    }
    drain();
    //may have become paused again,
    //as drain emits 'data'.
    if(!stream$$1.paused)
      stream$$1.emit('drain');
    return stream$$1
  };
  return stream$$1
}
});

var default_stream = function () {
    var line = '';
    var stream$$1 = index$3(write, flush);
    return stream$$1;
    
    function write (buf) {
        for (var i = 0; i < buf.length; i++) {
            var c = typeof buf === 'string'
                ? buf.charAt(i)
                : String.fromCharCode(buf[i]);
            if (c === '\n') flush();
            else line += c;
        }
    }
    
    function flush () {
        if (fs.writeSync && /^win/.test(process.platform)) {
            try { fs.writeSync(1, line + '\n'); }
            catch (e) { stream$$1.emit('error', e); }
        } else {
            try { console.log(line); }
            catch (e) { stream$$1.emit('error', e); }
        }
        line = '';
    }
};

var keys = createCommonjsModule(function (module, exports) {
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}
});

var is_arguments = createCommonjsModule(function (module, exports) {
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
}
});

var index$5 = createCommonjsModule(function (module) {
var pSlice = Array.prototype.slice;



var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
};

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (is_arguments(a)) {
    if (!is_arguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  try {
    var ka = keys(a),
        kb = keys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}
});

var inherits_browser = createCommonjsModule(function (module) {
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function () {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  };
}
});

var inherits = createCommonjsModule(function (module) {
try {
  var util$$1 = util;
  if (typeof util$$1.inherits !== 'function') throw '';
  module.exports = util$$1.inherits;
} catch (e) {
  module.exports = inherits_browser;
}
});

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

var implementation = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

var index$8 = Function.prototype.bind || implementation;

var index$6 = index$8.call(Function.call, Object.prototype.hasOwnProperty);

var toStr$3 = Object.prototype.toString;

var isArguments$1 = function isArguments(value) {
	var str = toStr$3.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr$3.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

// modified from https://github.com/es-shims/es5-shim
var has = Object.prototype.hasOwnProperty;
var toStr$2 = Object.prototype.toString;
var slice$1 = Array.prototype.slice;

var isEnumerable$1 = Object.prototype.propertyIsEnumerable;
var hasDontEnumBug = !isEnumerable$1.call({ toString: null }, 'toString');
var hasProtoEnumBug = isEnumerable$1.call(function () {}, 'prototype');
var dontEnums = [
	'toString',
	'toLocaleString',
	'valueOf',
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'constructor'
];
var equalsConstructorPrototype = function (o) {
	var ctor = o.constructor;
	return ctor && ctor.prototype === o;
};
var excludedKeys = {
	$console: true,
	$external: true,
	$frame: true,
	$frameElement: true,
	$frames: true,
	$innerHeight: true,
	$innerWidth: true,
	$outerHeight: true,
	$outerWidth: true,
	$pageXOffset: true,
	$pageYOffset: true,
	$parent: true,
	$scrollLeft: true,
	$scrollTop: true,
	$scrollX: true,
	$scrollY: true,
	$self: true,
	$webkitIndexedDB: true,
	$webkitStorageInfo: true,
	$window: true
};
var hasAutomationEqualityBug = (function () {
	/* global window */
	if (typeof window === 'undefined') { return false; }
	for (var k in window) {
		try {
			if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
				try {
					equalsConstructorPrototype(window[k]);
				} catch (e) {
					return true;
				}
			}
		} catch (e) {
			return true;
		}
	}
	return false;
}());
var equalsConstructorPrototypeIfNotBuggy = function (o) {
	/* global window */
	if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
		return equalsConstructorPrototype(o);
	}
	try {
		return equalsConstructorPrototype(o);
	} catch (e) {
		return false;
	}
};

var keysShim = function keys(object) {
	var isObject = object !== null && typeof object === 'object';
	var isFunction = toStr$2.call(object) === '[object Function]';
	var isArguments = isArguments$1(object);
	var isString = isObject && toStr$2.call(object) === '[object String]';
	var theKeys = [];

	if (!isObject && !isFunction && !isArguments) {
		throw new TypeError('Object.keys called on a non-object');
	}

	var skipProto = hasProtoEnumBug && isFunction;
	if (isString && object.length > 0 && !has.call(object, 0)) {
		for (var i = 0; i < object.length; ++i) {
			theKeys.push(String(i));
		}
	}

	if (isArguments && object.length > 0) {
		for (var j = 0; j < object.length; ++j) {
			theKeys.push(String(j));
		}
	} else {
		for (var name in object) {
			if (!(skipProto && name === 'prototype') && has.call(object, name)) {
				theKeys.push(String(name));
			}
		}
	}

	if (hasDontEnumBug) {
		var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

		for (var k = 0; k < dontEnums.length; ++k) {
			if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
				theKeys.push(dontEnums[k]);
			}
		}
	}
	return theKeys;
};

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			return (Object.keys(arguments) || '').length === 2;
		}(1, 2));
		if (!keysWorksWithArguments) {
			var originalKeys = Object.keys;
			Object.keys = function keys(object) {
				if (isArguments$1(object)) {
					return originalKeys(slice$1.call(object));
				} else {
					return originalKeys(object);
				}
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

var index$14 = keysShim;

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

var index$16 = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};

var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

var toStr$1 = Object.prototype.toString;

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr$1.call(fn) === '[object Function]';
};

var arePropertyDescriptorsSupported = function () {
	var obj = {};
	try {
		Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        /* eslint-disable no-unused-vars, no-restricted-syntax */
        for (var _ in obj) { return false; }
        /* eslint-enable no-unused-vars, no-restricted-syntax */
		return obj.x === obj;
	} catch (e) { /* this is IE 8. */
		return false;
	}
};
var supportsDescriptors = Object.defineProperty && arePropertyDescriptorsSupported();

var defineProperty = function (object, name, value, predicate) {
	if (name in object && (!isFunction(predicate) || !predicate())) {
		return;
	}
	if (supportsDescriptors) {
		Object.defineProperty(object, name, {
			configurable: true,
			enumerable: false,
			value: value,
			writable: true
		});
	} else {
		object[name] = value;
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = index$14(map);
	if (hasSymbols) {
		props = props.concat(Object.getOwnPropertySymbols(map));
	}
	index$16(props, function (name) {
		defineProperty(object, name, map[name], predicates[name]);
	});
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

var index$12 = defineProperties;

var _isNaN = Number.isNaN || function isNaN(a) {
	return a !== a;
};

var $isNaN = Number.isNaN || function (a) { return a !== a; };

var _isFinite = Number.isFinite || function (x) { return typeof x === 'number' && !$isNaN(x) && x !== Infinity && x !== -Infinity; };

var sign = function sign(number) {
	return number >= 0 ? 1 : -1;
};

var mod = function mod(number, modulo) {
	var remain = number % modulo;
	return Math.floor(remain >= 0 ? remain : remain + modulo);
};

var fnToStr = Function.prototype.toString;

var constructorRegex = /^\s*class /;
var isES6ClassFn = function isES6ClassFn(value) {
	try {
		var fnStr = fnToStr.call(value);
		var singleStripped = fnStr.replace(/\/\/.*\n/g, '');
		var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, '');
		var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' ');
		return constructorRegex.test(spaceStripped);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionObject(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr$4 = Object.prototype.toString;
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

var index$18 = function isCallable(value) {
	if (!value) { return false; }
	if (typeof value !== 'function' && typeof value !== 'object') { return false; }
	if (hasToStringTag) { return tryFunctionObject(value); }
	if (isES6ClassFn(value)) { return false; }
	var strClass = toStr$4.call(value);
	return strClass === fnClass || strClass === genClass;
};

var isPrimitive = function isPrimitive(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};

var toStr$5 = Object.prototype.toString;





// https://es5.github.io/#x8.12
var ES5internalSlots = {
	'[[DefaultValue]]': function (O, hint) {
		var actualHint = hint || (toStr$5.call(O) === '[object Date]' ? String : Number);

		if (actualHint === String || actualHint === Number) {
			var methods = actualHint === String ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
			var value, i;
			for (i = 0; i < methods.length; ++i) {
				if (index$18(O[methods[i]])) {
					value = O[methods[i]]();
					if (isPrimitive(value)) {
						return value;
					}
				}
			}
			throw new TypeError('No default value');
		}
		throw new TypeError('invalid [[DefaultValue]] hint supplied');
	}
};

// https://es5.github.io/#x9
var es5$2 = function ToPrimitive(input, PreferredType) {
	if (isPrimitive(input)) {
		return input;
	}
	return ES5internalSlots['[[DefaultValue]]'](input, PreferredType);
};

// https://es5.github.io/#x9
var ES5 = {
	ToPrimitive: es5$2,

	ToBoolean: function ToBoolean(value) {
		return Boolean(value);
	},
	ToNumber: function ToNumber(value) {
		return Number(value);
	},
	ToInteger: function ToInteger(value) {
		var number = this.ToNumber(value);
		if (_isNaN(number)) { return 0; }
		if (number === 0 || !_isFinite(number)) { return number; }
		return sign(number) * Math.floor(Math.abs(number));
	},
	ToInt32: function ToInt32(x) {
		return this.ToNumber(x) >> 0;
	},
	ToUint32: function ToUint32(x) {
		return this.ToNumber(x) >>> 0;
	},
	ToUint16: function ToUint16(value) {
		var number = this.ToNumber(value);
		if (_isNaN(number) || number === 0 || !_isFinite(number)) { return 0; }
		var posInt = sign(number) * Math.floor(Math.abs(number));
		return mod(posInt, 0x10000);
	},
	ToString: function ToString(value) {
		return String(value);
	},
	ToObject: function ToObject(value) {
		this.CheckObjectCoercible(value);
		return Object(value);
	},
	CheckObjectCoercible: function CheckObjectCoercible(value, optMessage) {
		/* jshint eqnull:true */
		if (value == null) {
			throw new TypeError(optMessage || 'Cannot call method on ' + value);
		}
		return value;
	},
	IsCallable: index$18,
	SameValue: function SameValue(x, y) {
		if (x === y) { // 0 === -0, but they are not identical.
			if (x === 0) { return 1 / x === 1 / y; }
			return true;
		}
		return _isNaN(x) && _isNaN(y);
	},

	// http://www.ecma-international.org/ecma-262/5.1/#sec-8
	Type: function Type(x) {
		if (x === null) {
			return 'Null';
		}
		if (typeof x === 'undefined') {
			return 'Undefined';
		}
		if (typeof x === 'function' || typeof x === 'object') {
			return 'Object';
		}
		if (typeof x === 'number') {
			return 'Number';
		}
		if (typeof x === 'boolean') {
			return 'Boolean';
		}
		if (typeof x === 'string') {
			return 'String';
		}
	}
};

var es5 = ES5;

var replace = index$8.call(Function.call, String.prototype.replace);

var leftWhitespace = /^[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+/;
var rightWhitespace = /[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+$/;

var implementation$3 = function trim() {
	var S = es5.ToString(es5.CheckObjectCoercible(this));
	return replace(replace(S, leftWhitespace, ''), rightWhitespace, '');
};

var zeroWidthSpace = '\u200b';

var polyfill = function getPolyfill() {
	if (String.prototype.trim && zeroWidthSpace.trim() === zeroWidthSpace) {
		return String.prototype.trim;
	}
	return implementation$3;
};

var shim = function shimStringTrim() {
	var polyfill$$1 = polyfill();
	index$12(String.prototype, { trim: polyfill$$1 }, { trim: function () { return String.prototype.trim !== polyfill$$1; } });
	return polyfill$$1;
};

var boundTrim = index$8.call(Function.call, polyfill());

index$12(boundTrim, {
	getPolyfill: polyfill,
	implementation: implementation$3,
	shim: shim
});

var index$10 = boundTrim;

var index$22 = isFunction$1;

var toString$2 = Object.prototype.toString;

function isFunction$1 (fn) {
  var string = toString$2.call(fn);
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
}

var index$20 = forEach;

var toString$1 = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

function forEach(list, iterator, context) {
    if (!index$22(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this;
    }
    
    if (toString$1.call(list) === '[object Array]')
        forEachArray(list, iterator, context);
    else if (typeof list === 'string')
        forEachString(list, iterator, context);
    else
        forEachObject(list, iterator, context);
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array);
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string);
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object);
        }
    }
}

var EventEmitter = events.EventEmitter;




var isEnumerable = index$8.call(Function.call, Object.prototype.propertyIsEnumerable);

var test = Test;

var nextTick = typeof setImmediate !== 'undefined'
    ? setImmediate
    : process.nextTick;
var safeSetTimeout = setTimeout;

inherits(Test, EventEmitter);

var getTestArgs = function (name_, opts_, cb_) {
    var name = '(anonymous)';
    var opts = {};
    var cb;

    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        var t = typeof arg;
        if (t === 'string') {
            name = arg;
        } else if (t === 'object') {
            opts = arg || opts;
        } else if (t === 'function') {
            cb = arg;
        }
    }
    return { name: name, opts: opts, cb: cb };
};

function Test (name_, opts_, cb_) {
    if (! (this instanceof Test)) {
        return new Test(name_, opts_, cb_);
    }

    var args = getTestArgs(name_, opts_, cb_);

    this.readable = true;
    this.name = args.name || '(anonymous)';
    this.assertCount = 0;
    this.pendingCount = 0;
    this._skip = args.opts.skip || false;
    this._timeout = args.opts.timeout;
    this._objectPrintDepth = args.opts.objectPrintDepth || 5;
    this._plan = undefined;
    this._cb = args.cb;
    this._progeny = [];
    this._ok = true;

    for (var prop in this) {
        this[prop] = (function bind$$1(self, val) {
            if (typeof val === 'function') {
                return function bound() {
                    return val.apply(self, arguments);
                };
            }
            return val;
        })(this, this[prop]);
    }
}

Test.prototype.run = function () {
    if (this._skip) {
        this.comment('SKIP ' + this.name);
    }
    if (!this._cb || this._skip) {
        return this._end();
    }
    if (this._timeout != null) {
        this.timeoutAfter(this._timeout);
    }
    this.emit('prerun');
    this._cb(this);
    this.emit('run');
};

Test.prototype.test = function (name, opts, cb) {
    var self = this;
    var t = new Test(name, opts, cb);
    this._progeny.push(t);
    this.pendingCount++;
    this.emit('test', t);
    t.on('prerun', function () {
        self.assertCount++;
    });
    
    if (!self._pendingAsserts()) {
        nextTick(function () {
            self._end();
        });
    }
    
    nextTick(function() {
        if (!self._plan && self.pendingCount == self._progeny.length) {
            self._end();
        }
    });
};

Test.prototype.comment = function (msg) {
    var that = this;
    index$20(index$10(msg).split('\n'), function (aMsg) {
        that.emit('result', index$10(aMsg).replace(/^#\s*/, ''));
    });
};

Test.prototype.plan = function (n) {
    this._plan = n;
    this.emit('plan', n);
};

Test.prototype.timeoutAfter = function(ms) {
    if (!ms) throw new Error('timeoutAfter requires a timespan');
    var self = this;
    var timeout = safeSetTimeout(function() {
        self.fail('test timed out after ' + ms + 'ms');
        self.end();
    }, ms);
    this.once('end', function() {
        clearTimeout(timeout);
    });
};

Test.prototype.end = function (err) { 
    var self = this;
    if (arguments.length >= 1 && !!err) {
        this.ifError(err);
    }
    
    if (this.calledEnd) {
        this.fail('.end() called twice');
    }
    this.calledEnd = true;
    this._end();
};

Test.prototype._end = function (err) {
    var self = this;
    if (this._progeny.length) {
        var t = this._progeny.shift();
        t.on('end', function () { self._end(); });
        t.run();
        return;
    }
    
    if (!this.ended) this.emit('end');
    var pendingAsserts = this._pendingAsserts();
    if (!this._planError && this._plan !== undefined && pendingAsserts) {
        this._planError = true;
        this.fail('plan != count', {
            expected : this._plan,
            actual : this.assertCount
        });
    }
    this.ended = true;
};

Test.prototype._exit = function () {
    if (this._plan !== undefined &&
        !this._planError && this.assertCount !== this._plan) {
        this._planError = true;
        this.fail('plan != count', {
            expected : this._plan,
            actual : this.assertCount,
            exiting : true
        });
    } else if (!this.ended) {
        this.fail('test exited without ending', {
            exiting: true
        });
    }
};

Test.prototype._pendingAsserts = function () {
    if (this._plan === undefined) {
        return 1;
    }
    return this._plan - (this._progeny.length + this.assertCount);
};

Test.prototype._assert = function assert (ok, opts) {
    var self = this;
    var extra = opts.extra || {};
    
    var res = {
        id : self.assertCount ++,
        ok : Boolean(ok),
        skip : index$1(extra.skip, opts.skip),
        name : index$1(extra.message, opts.message, '(unnamed assert)'),
        operator : index$1(extra.operator, opts.operator),
        objectPrintDepth : self._objectPrintDepth
    };
    if (index$6(opts, 'actual') || index$6(extra, 'actual')) {
        res.actual = index$1(extra.actual, opts.actual);
    }
    if (index$6(opts, 'expected') || index$6(extra, 'expected')) {
        res.expected = index$1(extra.expected, opts.expected);
    }
    this._ok = Boolean(this._ok && ok);
    
    if (!ok) {
        res.error = index$1(extra.error, opts.error, new Error(res.name));
    }
    
    if (!ok) {
        var e = new Error('exception');
        var err = (e.stack || '').split('\n');
        var dir = path.dirname(__dirname) + path.sep;
        
        for (var i = 0; i < err.length; i++) {
            var m = /^[^\s]*\s*\bat\s+(.+)/.exec(err[i]);
            if (!m) {
                continue;
            }
            
            var s = m[1].split(/\s+/);
            var filem = /((?:\/|[A-Z]:\\)[^:\s]+:(\d+)(?::(\d+))?)/.exec(s[1]);
            if (!filem) {
                filem = /((?:\/|[A-Z]:\\)[^:\s]+:(\d+)(?::(\d+))?)/.exec(s[2]);
                
                if (!filem) {
                    filem = /((?:\/|[A-Z]:\\)[^:\s]+:(\d+)(?::(\d+))?)/.exec(s[3]);

                    if (!filem) {
                        continue;
                    }
                }
            }
            
            if (filem[1].slice(0, dir.length) === dir) {
                continue;
            }
            
            res.functionName = s[0];
            res.file = filem[1];
            res.line = Number(filem[2]);
            if (filem[3]) res.column = filem[3];
            
            res.at = m[1];
            break;
        }
    }

    self.emit('result', res);
    
    var pendingAsserts = self._pendingAsserts();
    if (!pendingAsserts) {
        if (extra.exiting) {
            self._end();
        } else {
            nextTick(function () {
                self._end();
            });
        }
    }
    
    if (!self._planError && pendingAsserts < 0) {
        self._planError = true;
        self.fail('plan != count', {
            expected : self._plan,
            actual : self._plan - pendingAsserts
        });
    }
};

Test.prototype.fail = function (msg, extra) {
    this._assert(false, {
        message : msg,
        operator : 'fail',
        extra : extra
    });
};

Test.prototype.pass = function (msg, extra) {
    this._assert(true, {
        message : msg,
        operator : 'pass',
        extra : extra
    });
};

Test.prototype.skip = function (msg, extra) {
    this._assert(true, {
        message : msg,
        operator : 'skip',
        skip : true,
        extra : extra
    });
};

Test.prototype.ok
= Test.prototype['true']
= Test.prototype.assert
= function (value, msg, extra) {
    this._assert(value, {
        message : index$1(msg, 'should be truthy'),
        operator : 'ok',
        expected : true,
        actual : value,
        extra : extra
    });
};

Test.prototype.notOk
= Test.prototype['false']
= Test.prototype.notok
= function (value, msg, extra) {
    this._assert(!value, {
        message : index$1(msg, 'should be falsy'),
        operator : 'notOk',
        expected : false,
        actual : value,
        extra : extra
    });
};

Test.prototype.error
= Test.prototype.ifError
= Test.prototype.ifErr
= Test.prototype.iferror
= function (err, msg, extra) {
    this._assert(!err, {
        message : index$1(msg, String(err)),
        operator : 'error',
        actual : err,
        extra : extra
    });
};

Test.prototype.equal
= Test.prototype.equals
= Test.prototype.isEqual
= Test.prototype.is
= Test.prototype.strictEqual
= Test.prototype.strictEquals
= function (a, b, msg, extra) {
    this._assert(a === b, {
        message : index$1(msg, 'should be equal'),
        operator : 'equal',
        actual : a,
        expected : b,
        extra : extra
    });
};

Test.prototype.notEqual
= Test.prototype.notEquals
= Test.prototype.notStrictEqual
= Test.prototype.notStrictEquals
= Test.prototype.isNotEqual
= Test.prototype.isNot
= Test.prototype.not
= Test.prototype.doesNotEqual
= Test.prototype.isInequal
= function (a, b, msg, extra) {
    this._assert(a !== b, {
        message : index$1(msg, 'should not be equal'),
        operator : 'notEqual',
        actual : a,
        notExpected : b,
        extra : extra
    });
};

Test.prototype.deepEqual
= Test.prototype.deepEquals
= Test.prototype.isEquivalent
= Test.prototype.same
= function (a, b, msg, extra) {
    this._assert(index$5(a, b, { strict: true }), {
        message : index$1(msg, 'should be equivalent'),
        operator : 'deepEqual',
        actual : a,
        expected : b,
        extra : extra
    });
};

Test.prototype.deepLooseEqual
= Test.prototype.looseEqual
= Test.prototype.looseEquals
= function (a, b, msg, extra) {
    this._assert(index$5(a, b), {
        message : index$1(msg, 'should be equivalent'),
        operator : 'deepLooseEqual',
        actual : a,
        expected : b,
        extra : extra
    });
};

Test.prototype.notDeepEqual
= Test.prototype.notEquivalent
= Test.prototype.notDeeply
= Test.prototype.notSame
= Test.prototype.isNotDeepEqual
= Test.prototype.isNotDeeply
= Test.prototype.isNotEquivalent
= Test.prototype.isInequivalent
= function (a, b, msg, extra) {
    this._assert(!index$5(a, b, { strict: true }), {
        message : index$1(msg, 'should not be equivalent'),
        operator : 'notDeepEqual',
        actual : a,
        notExpected : b,
        extra : extra
    });
};

Test.prototype.notDeepLooseEqual
= Test.prototype.notLooseEqual
= Test.prototype.notLooseEquals
= function (a, b, msg, extra) {
    this._assert(!index$5(a, b), {
        message : index$1(msg, 'should be equivalent'),
        operator : 'notDeepLooseEqual',
        actual : a,
        expected : b,
        extra : extra
    });
};

Test.prototype['throws'] = function (fn, expected, msg, extra) {
    if (typeof expected === 'string') {
        msg = expected;
        expected = undefined;
    }

    var caught = undefined;

    try {
        fn();
    } catch (err) {
        caught = { error : err };
        if ((err != null) && (!isEnumerable(err, 'message') || !index$6(err, 'message'))) {
            var message = err.message;
            delete err.message;
            err.message = message;
        }
    }

    var passed = caught;

    if (expected instanceof RegExp) {
        passed = expected.test(caught && caught.error);
        expected = String(expected);
    }

    if (typeof expected === 'function' && caught) {
        passed = caught.error instanceof expected;
        caught.error = caught.error.constructor;
    }

    this._assert(typeof fn === 'function' && passed, {
        message : index$1(msg, 'should throw'),
        operator : 'throws',
        actual : caught && caught.error,
        expected : expected,
        error: !passed && caught && caught.error,
        extra : extra
    });
};

Test.prototype.doesNotThrow = function (fn, expected, msg, extra) {
    if (typeof expected === 'string') {
        msg = expected;
        expected = undefined;
    }
    var caught = undefined;
    try {
        fn();
    }
    catch (err) {
        caught = { error : err };
    }
    this._assert(!caught, {
        message : index$1(msg, 'should not throw'),
        operator : 'throws',
        actual : caught && caught.error,
        expected : expected,
        error : caught && caught.error,
        extra : extra
    });
};

Test.skip = function (name_, _opts, _cb) {
    var args = getTestArgs.apply(null, arguments);
    args.opts.skip = true;
    return Test(args.name, args.opts, args.cb);
};

// vim: set softtabstop=4 shiftwidth=4:

var nextTick$2 = typeof setImmediate !== 'undefined'
    ? setImmediate
    : process.nextTick;

var index$24 = function (write, end) {
    var tr = index$3(write, end);
    tr.pause();
    var resume = tr.resume;
    var pause = tr.pause;
    var paused = false;
    
    tr.pause = function () {
        paused = true;
        return pause.apply(this, arguments);
    };
    
    tr.resume = function () {
        paused = false;
        return resume.apply(this, arguments);
    };
    
    nextTick$2(function () {
        if (!paused) tr.resume();
    });
    
    return tr;
};

var hasMap = typeof Map === 'function' && Map.prototype;
var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null;
var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null;
var mapForEach = hasMap && Map.prototype.forEach;
var hasSet = typeof Set === 'function' && Set.prototype;
var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null;
var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null;
var setForEach = hasSet && Set.prototype.forEach;
var booleanValueOf = Boolean.prototype.valueOf;
var objectToString = Object.prototype.toString;

var index$26 = function inspect_ (obj, opts, depth, seen) {
    if (typeof obj === 'undefined') {
        return 'undefined';
    }
    if (obj === null) {
        return 'null';
    }
    if (typeof obj === 'boolean') {
        return obj ? 'true' : 'false';
    }
    if (typeof obj === 'string') {
        return inspectString(obj);
    }
    if (typeof obj === 'number') {
      if (obj === 0) {
        return Infinity / obj > 0 ? '0' : '-0';
      }
      return String(obj);
    }

    if (!opts) opts = {};

    var maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth;
    if (typeof depth === 'undefined') depth = 0;
    if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
        return '[Object]';
    }

    if (typeof seen === 'undefined') seen = [];
    else if (indexOf(seen, obj) >= 0) {
        return '[Circular]';
    }

    function inspect (value, from) {
        if (from) {
            seen = seen.slice();
            seen.push(from);
        }
        return inspect_(value, opts, depth + 1, seen);
    }

    if (typeof obj === 'function') {
        var name = nameOf(obj);
        return '[Function' + (name ? ': ' + name : '') + ']';
    }
    if (isSymbol(obj)) {
        var symString = Symbol.prototype.toString.call(obj);
        return typeof obj === 'object' ? markBoxed(symString) : symString;
    }
    if (isElement(obj)) {
        var s = '<' + String(obj.nodeName).toLowerCase();
        var attrs = obj.attributes || [];
        for (var i = 0; i < attrs.length; i++) {
            s += ' ' + attrs[i].name + '="' + quote(attrs[i].value) + '"';
        }
        s += '>';
        if (obj.childNodes && obj.childNodes.length) s += '...';
        s += '</' + String(obj.nodeName).toLowerCase() + '>';
        return s;
    }
    if (isArray(obj)) {
        if (obj.length === 0) return '[]';
        return '[ ' + arrObjKeys(obj, inspect).join(', ') + ' ]';
    }
    if (isError(obj)) {
        var parts = arrObjKeys(obj, inspect);
        if (parts.length === 0) return '[' + String(obj) + ']';
        return '{ [' + String(obj) + '] ' + parts.join(', ') + ' }';
    }
    if (typeof obj === 'object' && typeof obj.inspect === 'function') {
        return obj.inspect();
    }
    if (isMap(obj)) {
        var parts = [];
        mapForEach.call(obj, function (value, key) {
            parts.push(inspect(key, obj) + ' => ' + inspect(value, obj));
        });
        return collectionOf('Map', mapSize.call(obj), parts);
    }
    if (isSet(obj)) {
        var parts = [];
        setForEach.call(obj, function (value ) {
            parts.push(inspect(value, obj));
        });
        return collectionOf('Set', setSize.call(obj), parts);
    }
    if (isNumber(obj)) {
        return markBoxed(Number(obj));
    }
    if (isBoolean(obj)) {
        return markBoxed(booleanValueOf.call(obj));
    }
    if (isString(obj)) {
        return markBoxed(inspect(String(obj)));
    }
    if (!isDate(obj) && !isRegExp(obj)) {
        var xs = arrObjKeys(obj, inspect);
        if (xs.length === 0) return '{}';
        return '{ ' + xs.join(', ') + ' }';
    }
    return String(obj);
};

function quote (s) {
    return String(s).replace(/"/g, '&quot;');
}

function isArray (obj) { return toStr$6(obj) === '[object Array]' }
function isDate (obj) { return toStr$6(obj) === '[object Date]' }
function isRegExp (obj) { return toStr$6(obj) === '[object RegExp]' }
function isError (obj) { return toStr$6(obj) === '[object Error]' }
function isSymbol (obj) { return toStr$6(obj) === '[object Symbol]' }
function isString (obj) { return toStr$6(obj) === '[object String]' }
function isNumber (obj) { return toStr$6(obj) === '[object Number]' }
function isBoolean (obj) { return toStr$6(obj) === '[object Boolean]' }

var hasOwn$1 = Object.prototype.hasOwnProperty || function (key) { return key in this; };
function has$2 (obj, key) {
    return hasOwn$1.call(obj, key);
}

function toStr$6 (obj) {
    return objectToString.call(obj);
}

function nameOf (f) {
    if (f.name) return f.name;
    var m = String(f).match(/^function\s*([\w$]+)/);
    if (m) return m[1];
}

function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) return i;
    }
    return -1;
}

function isMap (x) {
    if (!mapSize) {
        return false;
    }
    try {
        mapSize.call(x);
        try {
            setSize.call(x);
        } catch (s) {
            return true;
        }
        return x instanceof Map; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isSet (x) {
    if (!setSize) {
        return false;
    }
    try {
        setSize.call(x);
        try {
            mapSize.call(x);
        } catch (m) {
            return true;
        }
        return x instanceof Set; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isElement (x) {
    if (!x || typeof x !== 'object') return false;
    if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
        return true;
    }
    return typeof x.nodeName === 'string'
        && typeof x.getAttribute === 'function'
    ;
}

function inspectString (str) {
    var s = str.replace(/(['\\])/g, '\\$1').replace(/[\x00-\x1f]/g, lowbyte);
    return "'" + s + "'";
}

function lowbyte (c) {
    var n = c.charCodeAt(0);
    var x = { 8: 'b', 9: 't', 10: 'n', 12: 'f', 13: 'r' }[n];
    if (x) return '\\' + x;
    return '\\x' + (n < 0x10 ? '0' : '') + n.toString(16);
}

function markBoxed (str) {
    return 'Object(' + str + ')';
}

function collectionOf (type, size, entries) {
    return type + ' (' + size + ') {' + entries.join(', ') + '}';
}

function arrObjKeys (obj, inspect) {
    var isArr = isArray(obj);
    var xs = [];
    if (isArr) {
        xs.length = obj.length;
        for (var i = 0; i < obj.length; i++) {
            xs[i] = has$2(obj, i) ? inspect(obj[i], obj) : '';
        }
    }
    for (var key in obj) {
        if (!has$2(obj, key)) continue;
        if (isArr && String(Number(key)) === key && key < obj.length) continue;
        if (/[^\w$]/.test(key)) {
            xs.push(inspect(key, obj) + ': ' + inspect(obj[key], obj));
        } else {
            xs.push(key + ': ' + inspect(obj[key], obj));
        }
    }
    return xs;
}

var EventEmitter$1 = events.EventEmitter;






var regexpTest = index$8.call(Function.call, RegExp.prototype.test);
var yamlIndicators = /\:|\-|\?/;
var nextTick$1 = typeof setImmediate !== 'undefined'
    ? setImmediate
    : process.nextTick;

var results = Results;
inherits(Results, EventEmitter$1);

function Results () {
    if (!(this instanceof Results)) return new Results;
    this.count = 0;
    this.fail = 0;
    this.pass = 0;
    this._stream = index$3();
    this.tests = [];
    this._only = null;
}

Results.prototype.createStream = function (opts) {
    if (!opts) opts = {};
    var self = this;
    var output, testId = 0;
    if (opts.objectMode) {
        output = index$3();
        self.on('_push', function ontest (t, extra) {
            if (!extra) extra = {};
            var id = testId++;
            t.once('prerun', function () {
                var row = {
                    type: 'test',
                    name: t.name,
                    id: id
                };
                if (index$6(extra, 'parent')) {
                    row.parent = extra.parent;
                }
                output.queue(row);
            });
            t.on('test', function (st) {
                ontest(st, { parent: id });
            });
            t.on('result', function (res) {
                res.test = id;
                res.type = 'assert';
                output.queue(res);
            });
            t.on('end', function () {
                output.queue({ type: 'end', test: id });
            });
        });
        self.on('done', function () { output.queue(null); });
    } else {
        output = index$24();
        output.queue('TAP version 13\n');
        self._stream.pipe(output);
    }
    
    nextTick$1(function next() {
        var t;
        while (t = getNextTest(self)) {
            t.run();
            if (!t.ended) return t.once('end', function(){ nextTick$1(next); });
        }
        self.emit('done');
    });
    
    return output;
};

Results.prototype.push = function (t) {
    var self = this;
    self.tests.push(t);
    self._watch(t);
    self.emit('_push', t);
};

Results.prototype.only = function (t) {
    this._only = t;
};

Results.prototype._watch = function (t) {
    var self = this;
    var write = function (s) { self._stream.queue(s); };
    t.once('prerun', function () {
        write('# ' + t.name + '\n');
    });
    
    t.on('result', function (res) {
        if (typeof res === 'string') {
            write('# ' + res + '\n');
            return;
        }
        write(encodeResult(res, self.count + 1));
        self.count ++;

        if (res.ok) self.pass ++;
        else self.fail ++;
    });
    
    t.on('test', function (st) { self._watch(st); });
};

Results.prototype.close = function () {
    var self = this;
    if (self.closed) self._stream.emit('error', new Error('ALREADY CLOSED'));
    self.closed = true;
    var write = function (s) { self._stream.queue(s); };
    
    write('\n1..' + self.count + '\n');
    write('# tests ' + self.count + '\n');
    write('# pass  ' + self.pass + '\n');
    if (self.fail) write('# fail  ' + self.fail + '\n');
    else write('\n# ok\n');

    self._stream.queue(null);
};

function encodeResult (res, count) {
    var output = '';
    output += (res.ok ? 'ok ' : 'not ok ') + count;
    output += res.name ? ' ' + res.name.toString().replace(/\s+/g, ' ') : '';
    
    if (res.skip) output += ' # SKIP';
    else if (res.todo) output += ' # TODO';
    
    output += '\n';
    if (res.ok) return output;
    
    var outer = '  ';
    var inner = outer + '  ';
    output += outer + '---\n';
    output += inner + 'operator: ' + res.operator + '\n';
    
    if (index$6(res, 'expected') || index$6(res, 'actual')) {
        var ex = index$26(res.expected, {depth: res.objectPrintDepth});
        var ac = index$26(res.actual, {depth: res.objectPrintDepth});
        
        if (Math.max(ex.length, ac.length) > 65 || invalidYaml(ex) || invalidYaml(ac)) {
            output += inner + 'expected: |-\n' + inner + '  ' + ex + '\n';
            output += inner + 'actual: |-\n' + inner + '  ' + ac + '\n';
        } else {
            output += inner + 'expected: ' + ex + '\n';
            output += inner + 'actual:   ' + ac + '\n';
        }
    }
    if (res.at) {
        output += inner + 'at: ' + res.at + '\n';
    }

    var actualStack = res.actual && res.actual.stack;
    var errorStack = res.error && res.error.stack;
    var stack = index$1(actualStack, errorStack);
    if (stack) {
        var lines = String(stack).split('\n');
        output += inner + 'stack: |-\n';
        for (var i = 0; i < lines.length; i++) {
            output += inner + '  ' + lines[i] + '\n';
        }
    }
    
    output += outer + '...\n';
    return output;
}

function getNextTest (results) {
    if (!results._only) {
        return results.tests.shift();
    }
    
    do {
        var t = results.tests.shift();
        if (!t) continue;
        if (results._only === t) {
            return t;
        }
    } while (results.tests.length !== 0)
}

function invalidYaml (str) {
    return regexpTest(yamlIndicators, str);
}

var index = createCommonjsModule(function (module, exports) {
var canEmitExit = typeof process !== 'undefined' && process
    && typeof process.on === 'function' && process.browser !== true;
var canExit = typeof process !== 'undefined' && process
    && typeof process.exit === 'function';

var nextTick = typeof setImmediate !== 'undefined'
    ? setImmediate
    : process.nextTick;

exports = module.exports = (function () {
    var harness;
    var lazyLoad = function () {
        return getHarness().apply(this, arguments);
    };
    
    lazyLoad.only = function () {
        return getHarness().only.apply(this, arguments);
    };
    
    lazyLoad.createStream = function (opts) {
        if (!opts) opts = {};
        if (!harness) {
            var output = index$3();
            getHarness({ stream: output, objectMode: opts.objectMode });
            return output;
        }
        return harness.createStream(opts);
    };
    
    lazyLoad.onFinish = function () {
        return getHarness().onFinish.apply(this, arguments);
    };

    lazyLoad.getHarness = getHarness;

    return lazyLoad

    function getHarness (opts) {
        if (!opts) opts = {};
        opts.autoclose = !canEmitExit;
        if (!harness) harness = createExitHarness(opts);
        return harness;
    }
})();

function createExitHarness (conf) {
    if (!conf) conf = {};
    var harness = createHarness({
        autoclose: index$1(conf.autoclose, false)
    });
    
    var stream$$1 = harness.createStream({ objectMode: conf.objectMode });
    var es = stream$$1.pipe(conf.stream || default_stream());
    if (canEmitExit) {
        es.on('error', function (err) { harness._exitCode = 1; });
    }
    
    var ended = false;
    stream$$1.on('end', function () { ended = true; });
    
    if (conf.exit === false) return harness;
    if (!canEmitExit || !canExit) return harness;

    var inErrorState = false;

    process.on('exit', function (code) {
        // let the process exit cleanly.
        if (code !== 0) {
            return
        }

        if (!ended) {
            var only = harness._results._only;
            for (var i = 0; i < harness._tests.length; i++) {
                var t = harness._tests[i];
                if (only && t !== only) continue;
                t._exit();
            }
        }
        harness.close();
        process.exit(code || harness._exitCode);
    });
    
    return harness;
}

exports.createHarness = createHarness;
exports.Test = test;
exports.test = exports; // tap compat
exports.test.skip = test.skip;

var exitInterval;

function createHarness (conf_) {
    if (!conf_) conf_ = {};
    var results$$1 = results();
    if (conf_.autoclose !== false) {
        results$$1.once('done', function () { results$$1.close(); });
    }
    
    var test$$1 = function (name, conf, cb) {
        var t = new test(name, conf, cb);
        test$$1._tests.push(t);
        
        (function inspectCode (st) {
            st.on('test', function sub (st_) {
                inspectCode(st_);
            });
            st.on('result', function (r) {
                if (!r.ok && typeof r !== 'string') test$$1._exitCode = 1;
            });
        })(t);
        
        results$$1.push(t);
        return t;
    };
    test$$1._results = results$$1;
    
    test$$1._tests = [];
    
    test$$1.createStream = function (opts) {
        return results$$1.createStream(opts);
    };

    test$$1.onFinish = function (cb) {
        results$$1.on('done', cb);
    };
    
    var only = false;
    test$$1.only = function () {
        if (only) throw new Error('there can only be one only test');
        only = true;
        var t = test$$1.apply(null, arguments);
        results$$1.only(t);
        return t;
    };
    test$$1._exitCode = 0;
    
    test$$1.close = function () { results$$1.close(); };
    
    return test$$1;
}
});

var assert = (collect) => {
  const insertAssertionHook = (fn) => (...args) => {
    const assertResult = fn(...args);
    collect(assertResult);
    return assertResult;
  };

  return {
    ok: insertAssertionHook((val, message = 'should be truthy') => ({
      pass: Boolean(val),
      expected: 'truthy',
      actual: val,
      operator: 'ok',
      message
    })),
    deepEqual: insertAssertionHook((actual, expected, message = 'should be equivalent') => ({
      pass: index$5(actual, expected),
      actual,
      expected,
      message,
      operator: 'deepEqual'
    })),
    equal: insertAssertionHook((actual, expected, message = 'should be equal') => ({
      pass: actual === expected,
      actual,
      expected,
      message,
      operator: 'equal'
    })),
    notOk: insertAssertionHook((val, message = 'should not be truthy') => ({
      pass: !Boolean(val),
      expected: 'falsy',
      actual: val,
      operator: 'notOk',
      message
    })),
    notDeepEqual: insertAssertionHook((actual, expected, message = 'should not be equivalent') => ({
      pass: !index$5(actual, expected),
      actual,
      expected,
      message,
      operator: 'notDeepEqual'
    })),
    notEqual: insertAssertionHook((actual, expected, message = 'should not be equal') => ({
      pass: actual !== expected,
      actual,
      expected,
      message,
      operator: 'notEqual'
    })),
    throws: insertAssertionHook((func, expected, message) => {
      let caught, pass, actual;
      if (typeof expected === 'string') {
        [expected, message] = [message, expected];
      }
      try {
        func();
      } catch (error) {
        caught = {error};
      }
      pass = caught !== undefined;
      actual = caught && caught.error;
      if (expected instanceof RegExp) {
        pass = expected.test(actual) || expected.test(actual && actual.message);
        expected = String(expected);
      } else if (typeof expected === 'function' && caught) {
        pass = actual instanceof expected;
        actual = actual.constructor;
      }
      return {
        pass,
        expected,
        actual,
        operator: 'throws',
        message: message || 'should throw'
      };
    }),
    doesNotThrow: insertAssertionHook((func, expected, message) => {
      let caught;
      if (typeof expected === 'string') {
        [expected, message] = [message, expected];
      }
      try {
        func();
      } catch (error) {
        caught = {error};
      }
      return {
        pass: caught === undefined,
        expected: 'no thrown error',
        actual: caught && caught.error,
        operator: 'doesNotThrow',
        message: message || 'should not throw'
      };
    }),
    fail: insertAssertionHook((reason = 'fail called') => ({
      pass: false,
      actual: 'fail called',
      expected: 'fail not called',
      message: reason,
      operator: 'fail'
    }))
  };
};

function testFunc$1 () {

  const fakeTest = () => {
    const collect = () => {
      collect.calls++;
    };
    collect.calls = 0;
    return collect;
  };

  index('ok operator', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass} = a.ok('true');
    t.equal(operator, 'ok', 'should have the operator ok');
    t.equal(message, 'should be truthy', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('ok operator: change message', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass, expected, actual} = a.ok(0, 'not default!');
    t.equal(operator, 'ok', 'should have the operator ok');
    t.equal(message, 'not default!', 'should not have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(expected, 'truthy');
    t.equal(actual, 0, 'should have provided the acual value');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('deepEqual operator', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass} = a.deepEqual({foo: {bar: 'bar'}}, {foo: {bar: 'bar'}});
    t.equal(operator, 'deepEqual', 'should have the operator deepEqual');
    t.equal(message, 'should be equivalent', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('deepEqual operator: change message', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass, expected, actual} = a.deepEqual({foo: 'bar'}, {blah: 'bar'}, 'woot woot');
    t.equal(operator, 'deepEqual', 'should have the operator deepEqual');
    t.equal(message, 'woot woot', 'should not have the default message');
    t.equal(pass, false, 'should not have passed');
    t.deepEqual(actual, {foo: 'bar'});
    t.deepEqual(expected, {blah: 'bar'});
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('equal operator', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass} = a.equal('foo', 'foo');
    t.equal(operator, 'equal', 'should have the operator equal');
    t.equal(message, 'should be equal', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('equal operator: change default message', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass} = a.equal({foo: 'foo'}, {foo: 'foo'}, 'woot ip');
    t.equal(operator, 'equal', 'should have the operator equal');
    t.equal(message, 'woot ip', 'should have the custom message');
    t.equal(pass, false, 'should not have passed');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('notOk operator', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass} = a.notOk(false);
    t.equal(operator, 'notOk', 'should have the operator notOk');
    t.equal(message, 'should not be truthy', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('notOk operator: change message', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass, expected, actual} = a.notOk(1, 'not default!');
    t.equal(operator, 'notOk', 'should have the operator notOk');
    t.equal(message, 'not default!', 'should not have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(expected, 'falsy');
    t.equal(actual, 1, 'should have provided the acual value');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('notDeepEqual operator', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass} = a.notDeepEqual({foo: {bar: 'blah'}}, {foo: {bar: 'bar'}});
    t.equal(operator, 'notDeepEqual', 'should have the operator notDeepEqual');
    t.equal(message, 'should not be equivalent', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('notDeepEqual operator: change message', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass, expected, actual} = a.notDeepEqual({foo: {bar: 'bar'}}, {foo: {bar: 'bar'}}, 'woot woot');
    t.equal(operator, 'notDeepEqual', 'should have the operator notDeepEqual');
    t.equal(message, 'woot woot', 'should not have the default message');
    t.equal(pass, false, 'should not have passed');
    t.deepEqual(actual, {foo: {bar: 'bar'}});
    t.deepEqual(expected, {foo: {bar: 'bar'}});
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('notEqual operator', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass} = a.notEqual({foo: 'bar'}, {foo: 'bar'});
    t.equal(operator, 'notEqual', 'should have the operator notEqual');
    t.equal(message, 'should not be equal', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('notEqual operator: change default message', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass} = a.notEqual('foo', 'foo', 'blah');
    t.equal(operator, 'notEqual', 'should have the operator notEqual');
    t.equal(message, 'blah', 'should have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('fail', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass} = a.fail();
    t.equal(operator, 'fail', 'should have the operator fail');
    t.equal(message, 'fail called', 'should have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('fail: change default message', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass} = a.fail('should not get here');
    t.equal(operator, 'fail', 'should have the operator fail');
    t.equal(message, 'should not get here', 'should have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('throws operator', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass} = a.throws(() => {
      throw new Error();
    });
    t.equal(operator, 'throws', 'should have the operator throws');
    t.equal(message, 'should throw', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('throws operator: change default message', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass} = a.throws(() => {
      throw new Error();
    }, 'unexepected lack of error');
    t.equal(operator, 'throws', 'should have the operator throws');
    t.equal(message, 'unexepected lack of error', 'should have the custom message');
    t.equal(pass, true, 'should have passed');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('throws operator: failure', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass} = a.throws(() => {
    });
    t.equal(operator, 'throws', 'should have the operator throws');
    t.equal(message, 'should throw', 'should have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('throws operator: expected (RegExp)', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const error = new Error('Totally expected error');
    const regexp = /^totally/i;
    const {operator, message, pass, expected, actual} = a.throws(() => {
      throw error;
    }, regexp);
    t.equal(operator, 'throws', 'should have the operator throws');
    t.equal(message, 'should throw', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(expected, '/^totally/i');
    t.equal(actual, error);
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('throws operator: expected (RegExp, failed)', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const error = new Error('Not the expected error');
    const regexp = /^totally/i;
    const {operator, message, pass, expected, actual} = a.throws(() => {
      throw error;
    }, regexp);
    t.equal(operator, 'throws', 'should have the operator throws');
    t.equal(message, 'should throw', 'should have the default message');
    t.equal(pass, false, 'should have passed');
    t.equal(expected, '/^totally/i');
    t.equal(actual, error);
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('throws operator: expected (constructor)', t => {
    const collect = fakeTest();
    const a = assert(collect);

    function CustomError () {
    }

    const error = new CustomError();
    const {operator, message, pass, expected, actual} = a.throws(() => {
      throw error;
    }, CustomError);
    t.equal(operator, 'throws', 'should have the operator throws');
    t.equal(message, 'should throw', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(expected, CustomError);
    t.equal(actual, CustomError);
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('throws operator: expected (constructor, failed)', t => {
    const collect = fakeTest();
    const a = assert(collect);

    function CustomError () {
    }

    const error = new Error('Plain error');
    const {operator, message, pass, expected, actual} = a.throws(() => {
      throw error;
    }, CustomError);
    t.equal(operator, 'throws', 'should have the operator throws');
    t.equal(message, 'should throw', 'should have the default message');
    t.equal(pass, false, 'should have passed');
    t.equal(expected, CustomError);
    t.equal(actual, Error);
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('doesNotThrow operator', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass, expected, actual} = a.doesNotThrow(() => {
    });
    t.equal(operator, 'doesNotThrow', 'should have the operator doesNotThrow');
    t.equal(message, 'should not throw', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(expected, 'no thrown error');
    t.equal(actual, undefined);
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('doesNotThrow operator: change default message', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass} = a.doesNotThrow(function () {
    }, 'unexepected error');
    t.equal(operator, 'doesNotThrow', 'should have the operator doesNotThrow');
    t.equal(message, 'unexepected error', 'should have the custom message');
    t.equal(pass, true, 'should have passed');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('doesNotThrow operator: failure', t => {
    const collect = fakeTest();
    const a = assert(collect);
    const {operator, message, pass} = a.doesNotThrow(() => {
      throw Error();
    });
    t.equal(operator, 'doesNotThrow', 'should have the operator doesNotThrow');
    t.equal(message, 'should not throw', 'should have the default message');
    t.equal(pass, false, 'should have passed');
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });

  index('doesNotThrow operator: expected (ignored)', t => {
    const collect = fakeTest();
    const a = assert(collect);

    function CustomError () {
    }

    const {operator, message, pass, expected, actual} = a.doesNotThrow(() => {
    }, CustomError);
    t.equal(operator, 'doesNotThrow', 'should have the operator doesNotThrow');
    t.equal(message, 'should not throw', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(expected, 'no thrown error');
    t.equal(actual, undefined);
    t.equal(collect.calls, 1, 'should have added the assertion');
    t.end();
  });
}

var test$3 = ({description, spec, only = false} = {}) => {
  const assertions = [];
  const collect = (...args) => assertions.push(...args.map(a => Object.assign({description}, a)));

  const instance = {
    run(){
      const now = Date.now();
      return Promise.resolve(spec(assert(collect)))
        .then(() => ({assertions, executionTime: Date.now() - now}));
    }
  };

  Object.defineProperties(instance, {
    only: {value: only},
    assertions: {value: assertions},
    length: {
      get(){
        return assertions.length
      }
    },
    description: {value: description}
  });

  return instance;
};

function testFunc$2 () {

  index('test: run and resolve with assertions', t => {
    const tp = test$3({
      description: 'desc',
      spec: function (assert) {
        assert.ok(true);
      }
    });

    tp.run()
      .then(function ({assertions, executionTime}) {
        t.deepEqual(assertions, [{
          actual: true,
          description: 'desc',
          expected: 'truthy',
          message: 'should be truthy',
          operator: 'ok',
          pass: true
        }]);
        t.ok(executionTime);
        t.end();
      });
  });

  index('test: run and resolve with assertions async flow', t => {
    const tp = test$3({
      description: 'desc',
      spec: async function (assert) {
        const presult = new Promise(function (resolve) {
          setTimeout(function () {
            resolve(true);
          }, 100);
        });

        const r = await presult;

        assert.ok(r);
      }
    });

    tp.run()
      .then(function ({assertions, executionTime}) {
        t.deepEqual(assertions, [{
          actual: true,
          description: 'desc',
          expected: 'truthy',
          message: 'should be truthy',
          operator: 'ok',
          pass: true
        }]);
        t.ok(executionTime);
        t.end();
      });
  });
}

const tapOut = ({pass, message, index}) => {
  const status = pass === true ? 'ok' : 'not ok';
  console.log([status, index, message].join(' '));
};

const canExit = () => {
  return typeof process !== 'undefined' && typeof process.exit === 'function';
};

var tap = () => function * () {
  let index = 1;
  let lastId = 0;
  let success = 0;
  let failure = 0;

  const starTime = Date.now();
  console.log('TAP version 13');
  try {
    while (true) {
      const assertion = yield;
      if (assertion.pass === true) {
        success++;
      } else {
        failure++;
      }
      assertion.index = index;
      if (assertion.id !== lastId) {
        console.log(`# ${assertion.description} - ${assertion.executionTime}ms`);
        lastId = assertion.id;
      }
      tapOut(assertion);
      if (assertion.pass !== true) {
        console.log(`  ---
  operator: ${assertion.operator}
  expected: ${JSON.stringify(assertion.expected)}
  actual: ${JSON.stringify(assertion.actual)}
  ...`);
      }
      index++;
    }
  } catch (e) {
    console.log('Bail out! unhandled exception');
    console.log(e);
    if (canExit()) {
      process.exit(1);
    }
  }
  finally {
    const execution = Date.now() - starTime;
    if (index > 1) {
      console.log(`
1..${index - 1}
# duration ${execution}ms
# success ${success}
# failure ${failure}`);
    }
    if (failure && canExit()) {
      process.exit(1);
    }
  }
};

var plan$1 = () => {
  const tests = [];
  const instance = {
    test(description, spec, opts = {}){
      if (!spec && description.test) {
        //this is a plan
        tests.push(...description);
      } else {
        const testItems = (description, spec) => (!spec && description.test) ? [...description] : [{description, spec}];
        tests.push(...testItems(description, spec).map(t => test$3(Object.assign(t, opts))));
      }
      return instance;
    },
    only(description, spec, opts = {}){
      return instance.test(description, spec, Object.assign(opts, {only: true}));
    },
    async run(sink = tap()){
      const sinkIterator = sink();
      const hasOnly = tests.some(t => t.only);
      const runnable = hasOnly ? tests.filter(t => t.only) : tests;
      let id = 1;
      sinkIterator.next();
      try {
        const results = runnable.map(t => t.run());
        for (let r of results) {
          const {assertions, executionTime} = await r;
          for (let assert of assertions) {
            sinkIterator.next(Object.assign(assert, {id, executionTime}));
          }
          id++;
        }
      }
      catch (e) {
        sinkIterator.throw(e);
      } finally {
        sinkIterator.return();
      }
    },
    [Symbol.iterator](){
      return tests[Symbol.iterator]();
    }
  };

  Object.defineProperties(instance, {
    tests: {value: tests},
    length: {
      get(){
        return tests.length
      }
    }
  });

  return instance;
};

function assert$1 (expArray, t) {
  return function * () {
    let index$$1 = 0;
    try {
      while (true) {
        const r = yield;
        const {actual, description, expected, message, operator, pass, id, executionTime} = r;
        const exp = expArray[index$$1];
        t.equal(actual, exp.actual);
        t.equal(description, exp.description);
        t.equal(expected, exp.expected);
        t.equal(message, exp.message);
        t.equal(operator, exp.operator);
        t.equal(pass, exp.pass);
        t.equal(id, exp.id);
        t.ok(executionTime !== undefined);
        index$$1++;
      }
    } catch (e){
      console.log(e);
    }
    finally {
      t.equal(index$$1, expArray.length);
      t.end();
    }
  }
}

function testFunc$3 () {

  index('add a test', t => {
    const description = 'desc';
    const p = plan$1();
    const spec = () => {
    };

    p.test(description, spec);

    t.equal(p.length, 1);
    t.equal(p.tests[0].description, 'desc');

    t.end();
  });

  index('compose plans', t => {
    const spec = () => {
    };
    const description = 'desc';
    const p = plan$1();

    p.test(description, spec);
    const sp = plan$1();

    sp.test(description, spec);
    sp.test(p);

    t.equal(sp.length, 2);

    t.end();
  });

  index('only: only run the tests with only statement', t => {
    const p = plan$1();

    p.test('should not run', (t) => {
      t.fail();
    });

    p.only('should run this one', (t) => {
      t.ok(true);
    });

    p.only('should run this one too', (t) => {
      t.ok(true);
    });

    p.run(assert$1([
      {
        actual: true,
        description: 'should run this one',
        expected: 'truthy',
        message: 'should be truthy',
        operator: 'ok',
        pass: true,
        id: 1
      },
      {
        actual: true,
        description: 'should run this one too',
        expected: 'truthy',
        message: 'should be truthy',
        operator: 'ok',
        pass: true,
        id: 2
      }

    ], t));
  });

  index('only: only run the tests with only statement with composition', t => {
    const p1 = plan$1();
    const p2 = plan$1();
    const masterPlan = plan$1();

    p1.test('should not run this test', (t) => {
      t.fail();
    });

    p2.test('should not run', (t) => {
      t.fail();
    });

    p2.only('should run this one', (t) => {
      t.ok(true);
    });

    p2.only('should run this one too', (t) => {
      t.ok(true);
    });

    masterPlan
      .test(p1)
      .test(p2);

    masterPlan.run(assert$1([
      {
        actual: true,
        description: 'should run this one',
        expected: 'truthy',
        message: 'should be truthy',
        operator: 'ok',
        pass: true,
        id: 1
      },
      {
        actual: true,
        description: 'should run this one too',
        expected: 'truthy',
        message: 'should be truthy',
        operator: 'ok',
        pass: true,
        id: 2
      }
    ], t));
  });

  index('plan running tests', t => {
    const p = plan$1();

    p.test('test 1', (assert) => {
      assert.ok(true);
    });

    p.test('test 2', (assert) => {
      assert.ok(true);
    });

    p.run(assert$1([
      {
        actual: true,
        description: 'test 1',
        expected: 'truthy',
        message: 'should be truthy',
        operator: 'ok',
        pass: true,
        id: 1
      }, {
        actual: true,
        description: 'test 2',
        expected: 'truthy',
        message: 'should be truthy',
        operator: 'ok',
        pass: true,
        id: 2
      }
    ], t));
  });
}

testFunc$1();
testFunc$2();
testFunc$3();
//# sourceMappingURL=index.js.map
