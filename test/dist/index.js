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
var Stream = stream;

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
  var stream$$1 = new Stream();
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

var through = index$3;
var fs$1 = fs;

var default_stream = function () {
    var line = '';
    var stream$$1 = through(write, flush);
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
        if (fs$1.writeSync && /^win/.test(process.platform)) {
            try { fs$1.writeSync(1, line + '\n'); }
            catch (e) { stream$$1.emit('error', e); }
        }
        else {
            try { console.log(line); }
            catch (e) { stream$$1.emit('error', e); }
        }
        line = '';
    }
};

var keys$1 = createCommonjsModule(function (module, exports) {
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
var objectKeys = keys$1;
var isArguments = is_arguments;

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
  if (isArguments(a)) {
    if (!isArguments(b)) {
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
    var ka = objectKeys(a),
        kb = objectKeys(b);
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

var inherits$2 = createCommonjsModule(function (module) {
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

var implementation$1 = function bind(that) {
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

var implementation = implementation$1;

var index$8 = Function.prototype.bind || implementation;

var bind$2 = index$8;

var index$6 = bind$2.call(Function.call, Object.prototype.hasOwnProperty);

var toStr$3 = Object.prototype.toString;

var isArguments = function isArguments(value) {
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
var has$1 = Object.prototype.hasOwnProperty;
var toStr$2 = Object.prototype.toString;
var slice$1 = Array.prototype.slice;
var isArgs = isArguments;
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
			if (!excludedKeys['$' + k] && has$1.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
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
	var isArguments$$1 = isArgs(object);
	var isString = isObject && toStr$2.call(object) === '[object String]';
	var theKeys = [];

	if (!isObject && !isFunction && !isArguments$$1) {
		throw new TypeError('Object.keys called on a non-object');
	}

	var skipProto = hasProtoEnumBug && isFunction;
	if (isString && object.length > 0 && !has$1.call(object, 0)) {
		for (var i = 0; i < object.length; ++i) {
			theKeys.push(String(i));
		}
	}

	if (isArguments$$1 && object.length > 0) {
		for (var j = 0; j < object.length; ++j) {
			theKeys.push(String(j));
		}
	} else {
		for (var name in object) {
			if (!(skipProto && name === 'prototype') && has$1.call(object, name)) {
				theKeys.push(String(name));
			}
		}
	}

	if (hasDontEnumBug) {
		var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

		for (var k = 0; k < dontEnums.length; ++k) {
			if (!(skipConstructor && dontEnums[k] === 'constructor') && has$1.call(object, dontEnums[k])) {
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
				if (isArgs(object)) {
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

var keys$3 = index$14;
var foreach = index$16;
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
	var props = keys$3(map);
	if (hasSymbols) {
		props = props.concat(Object.getOwnPropertySymbols(map));
	}
	foreach(props, function (name) {
		defineProperty(object, name, map[name], predicates[name]);
	});
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

var index$12 = defineProperties;

var _isNaN = Number.isNaN || function isNaN(a) {
	return a !== a;
};

var $isNaN$1 = Number.isNaN || function (a) { return a !== a; };

var _isFinite = Number.isFinite || function (x) { return typeof x === 'number' && !$isNaN$1(x) && x !== Infinity && x !== -Infinity; };

var sign$1 = function sign$1(number) {
	return number >= 0 ? 1 : -1;
};

var mod$1 = function mod$1(number, modulo) {
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

var isPrimitive$1 = function isPrimitive$1(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};

var toStr$5 = Object.prototype.toString;

var isPrimitive = isPrimitive$1;

var isCallable$1 = index$18;

// https://es5.github.io/#x8.12
var ES5internalSlots = {
	'[[DefaultValue]]': function (O, hint) {
		var actualHint = hint || (toStr$5.call(O) === '[object Date]' ? String : Number);

		if (actualHint === String || actualHint === Number) {
			var methods = actualHint === String ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
			var value, i;
			for (i = 0; i < methods.length; ++i) {
				if (isCallable$1(O[methods[i]])) {
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

var $isNaN = _isNaN;
var $isFinite = _isFinite;

var sign = sign$1;
var mod = mod$1;

var IsCallable = index$18;
var toPrimitive = es5$2;

// https://es5.github.io/#x9
var ES5 = {
	ToPrimitive: toPrimitive,

	ToBoolean: function ToBoolean(value) {
		return Boolean(value);
	},
	ToNumber: function ToNumber(value) {
		return Number(value);
	},
	ToInteger: function ToInteger(value) {
		var number = this.ToNumber(value);
		if ($isNaN(number)) { return 0; }
		if (number === 0 || !$isFinite(number)) { return number; }
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
		if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
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
	IsCallable: IsCallable,
	SameValue: function SameValue(x, y) {
		if (x === y) { // 0 === -0, but they are not identical.
			if (x === 0) { return 1 / x === 1 / y; }
			return true;
		}
		return $isNaN(x) && $isNaN(y);
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

var bind$4 = index$8;
var ES = es5;
var replace = bind$4.call(Function.call, String.prototype.replace);

var leftWhitespace = /^[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+/;
var rightWhitespace = /[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+$/;

var implementation$4 = function trim() {
	var S = ES.ToString(ES.CheckObjectCoercible(this));
	return replace(replace(S, leftWhitespace, ''), rightWhitespace, '');
};

var implementation$6 = implementation$4;

var zeroWidthSpace = '\u200b';

var polyfill = function getPolyfill() {
	if (String.prototype.trim && zeroWidthSpace.trim() === zeroWidthSpace) {
		return String.prototype.trim;
	}
	return implementation$6;
};

var define$1 = index$12;
var getPolyfill$2 = polyfill;

var shim$2 = function shimStringTrim() {
	var polyfill$$1 = getPolyfill$2();
	define$1(String.prototype, { trim: polyfill$$1 }, { trim: function () { return String.prototype.trim !== polyfill$$1; } });
	return polyfill$$1;
};

var bind$3 = index$8;
var define = index$12;

var implementation$3 = implementation$4;
var getPolyfill$1 = polyfill;
var shim$1 = shim$2;

var boundTrim = bind$3.call(Function.call, getPolyfill$1());

define(boundTrim, {
	getPolyfill: getPolyfill$1,
	implementation: implementation$3,
	shim: shim$1
});

var index$10 = boundTrim;

var index$22 = isFunction$2;

var toString$2 = Object.prototype.toString;

function isFunction$2 (fn) {
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

var isFunction$1 = index$22;

var index$20 = forEach$2;

var toString$1 = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

function forEach$2(list, iterator, context) {
    if (!isFunction$1(iterator)) {
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

var deepEqual = index$5;
var defined = index$1;
var path$1 = path;
var inherits$1 = inherits$2;
var EventEmitter = events.EventEmitter;
var has = index$6;
var trim$1 = index$10;
var bind$1 = index$8;
var forEach$1 = index$20;
var isEnumerable = bind$1.call(Function.call, Object.prototype.propertyIsEnumerable);

var test$1 = Test$1;

var nextTick = typeof setImmediate !== 'undefined'
    ? setImmediate
    : process.nextTick;
var safeSetTimeout = setTimeout;

inherits$1(Test$1, EventEmitter);

var getTestArgs = function (name_, opts_, cb_) {
    var name = '(anonymous)';
    var opts = {};
    var cb;

    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        var t = typeof arg;
        if (t === 'string') {
            name = arg;
        }
        else if (t === 'object') {
            opts = arg || opts;
        }
        else if (t === 'function') {
            cb = arg;
        }
    }
    return { name: name, opts: opts, cb: cb };
};

function Test$1 (name_, opts_, cb_) {
    if (! (this instanceof Test$1)) {
        return new Test$1(name_, opts_, cb_);
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
        this[prop] = (function bind$1(self, val) {
            if (typeof val === 'function') {
                return function bound() {
                    return val.apply(self, arguments);
                };
            }
            else return val;
        })(this, this[prop]);
    }
}

Test$1.prototype.run = function () {
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

Test$1.prototype.test = function (name, opts, cb) {
    var self = this;
    var t = new Test$1(name, opts, cb);
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

Test$1.prototype.comment = function (msg) {
    var that = this;
    forEach$1(trim$1(msg).split('\n'), function (aMsg) {
        that.emit('result', trim$1(aMsg).replace(/^#\s*/, ''));
    });
};

Test$1.prototype.plan = function (n) {
    this._plan = n;
    this.emit('plan', n);
};

Test$1.prototype.timeoutAfter = function(ms) {
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

Test$1.prototype.end = function (err) { 
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

Test$1.prototype._end = function (err) {
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

Test$1.prototype._exit = function () {
    if (this._plan !== undefined &&
        !this._planError && this.assertCount !== this._plan) {
        this._planError = true;
        this.fail('plan != count', {
            expected : this._plan,
            actual : this.assertCount,
            exiting : true
        });
    }
    else if (!this.ended) {
        this.fail('test exited without ending', {
            exiting: true
        });
    }
};

Test$1.prototype._pendingAsserts = function () {
    if (this._plan === undefined) {
        return 1;
    }
    else {
        return this._plan - (this._progeny.length + this.assertCount);
    }
};

Test$1.prototype._assert = function assert (ok, opts) {
    var self = this;
    var extra = opts.extra || {};
    
    var res = {
        id : self.assertCount ++,
        ok : Boolean(ok),
        skip : defined(extra.skip, opts.skip),
        name : defined(extra.message, opts.message, '(unnamed assert)'),
        operator : defined(extra.operator, opts.operator),
        objectPrintDepth : self._objectPrintDepth
    };
    if (has(opts, 'actual') || has(extra, 'actual')) {
        res.actual = defined(extra.actual, opts.actual);
    }
    if (has(opts, 'expected') || has(extra, 'expected')) {
        res.expected = defined(extra.expected, opts.expected);
    }
    this._ok = Boolean(this._ok && ok);
    
    if (!ok) {
        res.error = defined(extra.error, opts.error, new Error(res.name));
    }
    
    if (!ok) {
        var e = new Error('exception');
        var err = (e.stack || '').split('\n');
        var dir = path$1.dirname(__dirname) + path$1.sep;
        
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

Test$1.prototype.fail = function (msg, extra) {
    this._assert(false, {
        message : msg,
        operator : 'fail',
        extra : extra
    });
};

Test$1.prototype.pass = function (msg, extra) {
    this._assert(true, {
        message : msg,
        operator : 'pass',
        extra : extra
    });
};

Test$1.prototype.skip = function (msg, extra) {
    this._assert(true, {
        message : msg,
        operator : 'skip',
        skip : true,
        extra : extra
    });
};

Test$1.prototype.ok
= Test$1.prototype['true']
= Test$1.prototype.assert
= function (value, msg, extra) {
    this._assert(value, {
        message : defined(msg, 'should be truthy'),
        operator : 'ok',
        expected : true,
        actual : value,
        extra : extra
    });
};

Test$1.prototype.notOk
= Test$1.prototype['false']
= Test$1.prototype.notok
= function (value, msg, extra) {
    this._assert(!value, {
        message : defined(msg, 'should be falsy'),
        operator : 'notOk',
        expected : false,
        actual : value,
        extra : extra
    });
};

Test$1.prototype.error
= Test$1.prototype.ifError
= Test$1.prototype.ifErr
= Test$1.prototype.iferror
= function (err, msg, extra) {
    this._assert(!err, {
        message : defined(msg, String(err)),
        operator : 'error',
        actual : err,
        extra : extra
    });
};

Test$1.prototype.equal
= Test$1.prototype.equals
= Test$1.prototype.isEqual
= Test$1.prototype.is
= Test$1.prototype.strictEqual
= Test$1.prototype.strictEquals
= function (a, b, msg, extra) {
    this._assert(a === b, {
        message : defined(msg, 'should be equal'),
        operator : 'equal',
        actual : a,
        expected : b,
        extra : extra
    });
};

Test$1.prototype.notEqual
= Test$1.prototype.notEquals
= Test$1.prototype.notStrictEqual
= Test$1.prototype.notStrictEquals
= Test$1.prototype.isNotEqual
= Test$1.prototype.isNot
= Test$1.prototype.not
= Test$1.prototype.doesNotEqual
= Test$1.prototype.isInequal
= function (a, b, msg, extra) {
    this._assert(a !== b, {
        message : defined(msg, 'should not be equal'),
        operator : 'notEqual',
        actual : a,
        notExpected : b,
        extra : extra
    });
};

Test$1.prototype.deepEqual
= Test$1.prototype.deepEquals
= Test$1.prototype.isEquivalent
= Test$1.prototype.same
= function (a, b, msg, extra) {
    this._assert(deepEqual(a, b, { strict: true }), {
        message : defined(msg, 'should be equivalent'),
        operator : 'deepEqual',
        actual : a,
        expected : b,
        extra : extra
    });
};

Test$1.prototype.deepLooseEqual
= Test$1.prototype.looseEqual
= Test$1.prototype.looseEquals
= function (a, b, msg, extra) {
    this._assert(deepEqual(a, b), {
        message : defined(msg, 'should be equivalent'),
        operator : 'deepLooseEqual',
        actual : a,
        expected : b,
        extra : extra
    });
};

Test$1.prototype.notDeepEqual
= Test$1.prototype.notEquivalent
= Test$1.prototype.notDeeply
= Test$1.prototype.notSame
= Test$1.prototype.isNotDeepEqual
= Test$1.prototype.isNotDeeply
= Test$1.prototype.isNotEquivalent
= Test$1.prototype.isInequivalent
= function (a, b, msg, extra) {
    this._assert(!deepEqual(a, b, { strict: true }), {
        message : defined(msg, 'should not be equivalent'),
        operator : 'notDeepEqual',
        actual : a,
        notExpected : b,
        extra : extra
    });
};

Test$1.prototype.notDeepLooseEqual
= Test$1.prototype.notLooseEqual
= Test$1.prototype.notLooseEquals
= function (a, b, msg, extra) {
    this._assert(!deepEqual(a, b), {
        message : defined(msg, 'should be equivalent'),
        operator : 'notDeepLooseEqual',
        actual : a,
        expected : b,
        extra : extra
    });
};

Test$1.prototype['throws'] = function (fn, expected, msg, extra) {
    if (typeof expected === 'string') {
        msg = expected;
        expected = undefined;
    }

    var caught = undefined;

    try {
        fn();
    } catch (err) {
        caught = { error : err };
        if ((err != null) && (!isEnumerable(err, 'message') || !has(err, 'message'))) {
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
        message : defined(msg, 'should throw'),
        operator : 'throws',
        actual : caught && caught.error,
        expected : expected,
        error: !passed && caught && caught.error,
        extra : extra
    });
};

Test$1.prototype.doesNotThrow = function (fn, expected, msg, extra) {
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
        message : defined(msg, 'should not throw'),
        operator : 'throws',
        actual : caught && caught.error,
        expected : expected,
        error : caught && caught.error,
        extra : extra
    });
};

Test$1.skip = function (name_, _opts, _cb) {
    var args = getTestArgs.apply(null, arguments);
    args.opts.skip = true;
    return Test$1(args.name, args.opts, args.cb);
};

// vim: set softtabstop=4 shiftwidth=4:

var through$2 = index$3;
var nextTick$2 = typeof setImmediate !== 'undefined'
    ? setImmediate
    : process.nextTick;

var index$24 = function (write, end) {
    var tr = through$2(write, end);
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

var index$26 = function inspect_ (obj, opts, depth, seen) {
    if (!opts) opts = {};
    
    var maxDepth = opts.depth === undefined ? 5 : opts.depth;
    if (depth === undefined) depth = 0;
    if (depth >= maxDepth && maxDepth > 0 && obj && typeof obj === 'object') {
        return '[Object]';
    }
    
    if (seen === undefined) seen = [];
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
    
    if (typeof obj === 'string') {
        return inspectString(obj);
    }
    else if (typeof obj === 'function') {
        var name = nameOf(obj);
        return '[Function' + (name ? ': ' + name : '') + ']';
    }
    else if (obj === null) {
        return 'null';
    }
    else if (isSymbol(obj)) {
        var symString = Symbol.prototype.toString.call(obj);
        return typeof obj === 'object' ? 'Object(' + symString + ')' : symString;
    }
    else if (isElement(obj)) {
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
    else if (isArray(obj)) {
        if (obj.length === 0) return '[]';
        var xs = Array(obj.length);
        for (var i = 0; i < obj.length; i++) {
            xs[i] = has$3(obj, i) ? inspect(obj[i], obj) : '';
        }
        return '[ ' + xs.join(', ') + ' ]';
    }
    else if (isError(obj)) {
        var parts = [];
        for (var key in obj) {
            if (!has$3(obj, key)) continue;
            
            if (/[^\w$]/.test(key)) {
                parts.push(inspect(key) + ': ' + inspect(obj[key]));
            }
            else {
                parts.push(key + ': ' + inspect(obj[key]));
            }
        }
        if (parts.length === 0) return '[' + obj + ']';
        return '{ [' + obj + '] ' + parts.join(', ') + ' }';
    }
    else if (typeof obj === 'object' && typeof obj.inspect === 'function') {
        return obj.inspect();
    }
    else if (isMap(obj)) {
        var parts = [];
        mapForEach.call(obj, function (value, key) {
            parts.push(inspect(key, obj) + ' => ' + inspect(value, obj));
        });
        return 'Map (' + mapSize.call(obj) + ') {' + parts.join(', ') + '}';
    }
    else if (isSet(obj)) {
        var parts = [];
        setForEach.call(obj, function (value ) {
            parts.push(inspect(value, obj));
        });
        return 'Set (' + setSize.call(obj) + ') {' + parts.join(', ') + '}';
    }
    else if (typeof obj !== 'object') {
        return String(obj);
    }
    else if (isNumber(obj)) {
        return 'Object(' + Number(obj) + ')';
    }
    else if (isBoolean(obj)) {
        return 'Object(' + booleanValueOf.call(obj) + ')';
    }
    else if (isString(obj)) {
        return 'Object(' + inspect(String(obj)) + ')';
    }
    else if (!isDate(obj) && !isRegExp(obj)) {
        var xs = [], keys = [];
        for (var key in obj) {
            if (has$3(obj, key)) keys.push(key);
        }
        keys.sort();
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (/[^\w$]/.test(key)) {
                xs.push(inspect(key) + ': ' + inspect(obj[key], obj));
            }
            else xs.push(key + ': ' + inspect(obj[key], obj));
        }
        if (xs.length === 0) return '{}';
        return '{ ' + xs.join(', ') + ' }';
    }
    else return String(obj);
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
function has$3 (obj, key) {
    return hasOwn$1.call(obj, key);
}

function toStr$6 (obj) {
    return Object.prototype.toString.call(obj);
}

function nameOf (f) {
    if (f.name) return f.name;
    var m = f.toString().match(/^function\s*([\w$]+)/);
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
        return true;
    } catch (e) {}
    return false;
}

function isSet (x) {
    if (!setSize) {
        return false;
    }
    try {
        setSize.call(x);
        return true;
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
    
    function lowbyte (c) {
        var n = c.charCodeAt(0);
        var x = { 8: 'b', 9: 't', 10: 'n', 12: 'f', 13: 'r' }[n];
        if (x) return '\\' + x;
        return '\\x' + (n < 0x10 ? '0' : '') + n.toString(16);
    }
}

var EventEmitter$1 = events.EventEmitter;
var inherits$4 = inherits$2;
var through$1 = index$3;
var resumer = index$24;
var inspect = index$26;
var bind$5 = index$8;
var has$2 = index$6;
var regexpTest = bind$5.call(Function.call, RegExp.prototype.test);
var yamlIndicators = /\:|\-|\?/;
var nextTick$1 = typeof setImmediate !== 'undefined'
    ? setImmediate
    : process.nextTick;

var results = Results;
inherits$4(Results, EventEmitter$1);

function Results () {
    if (!(this instanceof Results)) return new Results;
    this.count = 0;
    this.fail = 0;
    this.pass = 0;
    this._stream = through$1();
    this.tests = [];
    this._only = null;
}

Results.prototype.createStream = function (opts) {
    if (!opts) opts = {};
    var self = this;
    var output, testId = 0;
    if (opts.objectMode) {
        output = through$1();
        self.on('_push', function ontest (t, extra) {
            if (!extra) extra = {};
            var id = testId++;
            t.once('prerun', function () {
                var row = {
                    type: 'test',
                    name: t.name,
                    id: id
                };
                if (has$2(extra, 'parent')) {
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
    }
    else {
        output = resumer();
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
    
    if (has$2(res, 'expected') || has$2(res, 'actual')) {
        var ex = inspect(res.expected, {depth: res.objectPrintDepth});
        var ac = inspect(res.actual, {depth: res.objectPrintDepth});
        
        if (Math.max(ex.length, ac.length) > 65 || invalidYaml(ex) || invalidYaml(ac)) {
            output += inner + 'expected: |-\n' + inner + '  ' + ex + '\n';
            output += inner + 'actual: |-\n' + inner + '  ' + ac + '\n';
        }
        else {
            output += inner + 'expected: ' + ex + '\n';
            output += inner + 'actual:   ' + ac + '\n';
        }
    }
    if (res.at) {
        output += inner + 'at: ' + res.at + '\n';
    }
    if (res.operator === 'error' && res.actual && res.actual.stack) {
        var lines = String(res.actual.stack).split('\n');
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
var defined = index$1;
var createDefaultStream = default_stream;
var Test = test$1;
var createResult = results;
var through = index$3;

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
            var output = through();
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
        autoclose: defined(conf.autoclose, false)
    });
    
    var stream$$1 = harness.createStream({ objectMode: conf.objectMode });
    var es = stream$$1.pipe(conf.stream || createDefaultStream());
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
exports.Test = Test;
exports.test = exports; // tap compat
exports.test.skip = Test.skip;

var exitInterval;

function createHarness (conf_) {
    if (!conf_) conf_ = {};
    var results$$1 = createResult();
    if (conf_.autoclose !== false) {
        results$$1.once('done', function () { results$$1.close(); });
    }
    
    var test = function (name, conf, cb) {
        var t = new Test(name, conf, cb);
        test._tests.push(t);
        
        (function inspectCode (st) {
            st.on('test', function sub (st_) {
                inspectCode(st_);
            });
            st.on('result', function (r) {
                if (!r.ok && typeof r !== 'string') test._exitCode = 1;
            });
        })(t);
        
        results$$1.push(t);
        return t;
    };
    test._results = results$$1;
    
    test._tests = [];
    
    test.createStream = function (opts) {
        return results$$1.createStream(opts);
    };

    test.onFinish = function (cb) {
        results$$1.on('done', cb);
    };
    
    var only = false;
    test.only = function () {
        if (only) throw new Error('there can only be one only test');
        only = true;
        var t = test.apply(null, arguments);
        results$$1.only(t);
        return t;
    };
    test._exitCode = 0;
    
    test.close = function () { results$$1.close(); };
    
    return test;
}
});

const assertions$1 = {
  ok(val, message = 'should be truthy'){
    const assertionResult = {pass: Boolean(val), expected: 'truthy', actual: val, operator: 'ok', message};
    this.test.addAssertion(assertionResult);
    return assertionResult;
  },
  deepEqual(actual, expected, message = 'should be equivalent'){
    const assertionResult = {pass: index$5(actual, expected), actual, expected, message, operator: 'deepEqual'};
    this.test.addAssertion(assertionResult);
    return assertionResult;
  },
  equal(actual, expected, message = 'should be equal'){
    const assertionResult = {pass: actual === expected, actual, expected, message, operator: 'equal'};
    this.test.addAssertion(assertionResult);
    return assertionResult;
  },
  notOk(val, message = 'should not be truthy'){
    const assertionResult = {pass: !Boolean(val), expected: 'falsy', actual: val, operator: 'notOk', message};
    this.test.addAssertion(assertionResult);
    return assertionResult;
  },
  notDeepEqual(actual, expected, message = 'should not be equivalent'){
    const assertionResult = {pass: !index$5(actual, expected), actual, expected, message, operator: 'notDeepEqual'};
    this.test.addAssertion(assertionResult);
    return assertionResult;
  },
  notEqual(actual, expected, message = 'should not be equal'){
    const assertionResult = {pass: actual !== expected, actual, expected, message, operator: 'notEqual'};
    this.test.addAssertion(assertionResult);
    return assertionResult;
  },
  fail(reason = 'fail called'){
    const assertionResult = {
      pass: false,
      actual: 'fail called',
      expected: 'fail not called',
      message: reason,
      operator: 'fail'
    };
    this.test.addAssertion(assertionResult);
    return assertionResult;
  }
};

function assertion (test) {
  return Object.create(assertions$1, {test: {value: test}});
}

/**
 * slice() reference.
 */

var slice$2 = Array.prototype.slice;

/**
 * Expose `co`.
 */

var index$28 = co['default'] = co.co = co;

/**
 * Wrap the given generator `fn` into a
 * function that returns a promise.
 * This is a separate function so that
 * every `co()` call doesn't create a new,
 * unnecessary closure.
 *
 * @param {GeneratorFunction} fn
 * @return {Function}
 * @api public
 */

co.wrap = function (fn) {
  createPromise.__generatorFunction__ = fn;
  return createPromise;
  function createPromise() {
    return co.call(this, fn.apply(this, arguments));
  }
};

/**
 * Execute the generator function or a generator
 * and return a promise.
 *
 * @param {Function} fn
 * @return {Promise}
 * @api public
 */

function co(gen) {
  var ctx = this;
  var args = slice$2.call(arguments, 1);

  // we wrap everything in a promise to avoid promise chaining,
  // which leads to memory leak errors.
  // see https://github.com/tj/co/issues/180
  return new Promise(function(resolve, reject) {
    if (typeof gen === 'function') gen = gen.apply(ctx, args);
    if (!gen || typeof gen.next !== 'function') return resolve(gen);

    onFulfilled();

    /**
     * @param {Mixed} res
     * @return {Promise}
     * @api private
     */

    function onFulfilled(res) {
      var ret;
      try {
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * @param {Error} err
     * @return {Promise}
     * @api private
     */

    function onRejected(err) {
      var ret;
      try {
        ret = gen.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * Get the next value in the generator,
     * return a promise.
     *
     * @param {Object} ret
     * @return {Promise}
     * @api private
     */

    function next(ret) {
      if (ret.done) return resolve(ret.value);
      var value = toPromise.call(ctx, ret.value);
      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
        + 'but the following object was passed: "' + String(ret.value) + '"'));
    }
  });
}

/**
 * Convert a `yield`ed value into a promise.
 *
 * @param {Mixed} obj
 * @return {Promise}
 * @api private
 */

function toPromise(obj) {
  if (!obj) return obj;
  if (isPromise(obj)) return obj;
  if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
  if (isObject(obj)) return objectToPromise.call(this, obj);
  return obj;
}

/**
 * Convert a thunk to a promise.
 *
 * @param {Function}
 * @return {Promise}
 * @api private
 */

function thunkToPromise(fn) {
  var ctx = this;
  return new Promise(function (resolve, reject) {
    fn.call(ctx, function (err, res) {
      if (err) return reject(err);
      if (arguments.length > 2) res = slice$2.call(arguments, 1);
      resolve(res);
    });
  });
}

/**
 * Convert an array of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Array} obj
 * @return {Promise}
 * @api private
 */

function arrayToPromise(obj) {
  return Promise.all(obj.map(toPromise, this));
}

/**
 * Convert an object of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Object} obj
 * @return {Promise}
 * @api private
 */

function objectToPromise(obj){
  var results = new obj.constructor();
  var keys = Object.keys(obj);
  var promises = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var promise = toPromise.call(this, obj[key]);
    if (promise && isPromise(promise)) defer(promise, key);
    else results[key] = obj[key];
  }
  return Promise.all(promises).then(function () {
    return results;
  });

  function defer(promise, key) {
    // predefine the key in the result
    results[key] = undefined;
    promises.push(promise.then(function (res) {
      results[key] = res;
    }));
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */
function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  if (!constructor) return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
  return isGenerator(constructor.prototype);
}

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject(val) {
  return Object == val.constructor;
}

const Test$2 = {
  run: function () {
    const assert = assertion(this);
    const now = Date.now();
    return index$28(this.coroutine(assert))
      .then(() => {
        return {assertions: this.assertions, executionTime: Date.now() - now};
      });
  },
  addAssertion(){
    const newAssertions = [...arguments].map(a => Object.assign({description: this.description}, a));
    this.assertions.push(...newAssertions);
    return this;
  }
};

function test$3 ({description, coroutine}) {
  return Object.create(Test$2, {
    description: {value: description},
    coroutine: {value: coroutine},
    assertions: {value: []},
    length: {
      get(){
        return this.assertions.length
      }
    }
  });
}

function testFunc$1 () {

  function fakeTest () {
    return {
      addAssertion(item){
        this.assertions.push(item);
      },
      assertions: []
    };
  }

  index('ok operator', t=> {
    const tp = test$3({});
    const a = assertion(tp);
    const {operator, message, pass} = a.ok('true');
    t.equal(operator, 'ok', 'should have the operator ok');
    t.equal(message, 'should be truthy', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  index('ok operator: change message', t=> {
    const tp = test$3({});
    const a = assertion(tp);
    const {operator, message, pass, expected, actual} = a.ok(0, 'not default!');
    t.equal(operator, 'ok', 'should have the operator ok');
    t.equal(message, 'not default!', 'should not have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(expected, 'truthy');
    t.equal(actual, 0, 'should have provided the acual value');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  index('deepEqual operator', t=> {
    const tp = test$3({});
    const a = assertion(tp);
    const {operator, message, pass} = a.deepEqual({foo: {bar: 'bar'}}, {foo: {bar: 'bar'}});
    t.equal(operator, 'deepEqual', 'should have the operator deepEqual');
    t.equal(message, 'should be equivalent', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  index('deepEqual operator: change message', t=> {
    const tp = test$3({});
    const a = assertion(tp);
    const {operator, message, pass, expected, actual} = a.deepEqual({foo: 'bar'}, {blah: 'bar'}, 'woot woot');
    t.equal(operator, 'deepEqual', 'should have the operator deepEqual');
    t.equal(message, 'woot woot', 'should not have the default message');
    t.equal(pass, false, 'should not have passed');
    t.deepEqual(actual, {foo: 'bar'});
    t.deepEqual(expected, {blah: 'bar'});
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  index('equal operator', t=> {
    const tp = test$3({});
    const a = assertion(tp);
    const {operator, message, pass} = a.equal('foo', 'foo');
    t.equal(operator, 'equal', 'should have the operator equal');
    t.equal(message, 'should be equal', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  index('equal operator: change default message', t=> {
    const tp = test$3({});
    const a = assertion(tp);
    const {operator, message, pass} = a.equal({foo: 'foo'}, {foo: 'foo'}, 'woot ip');
    t.equal(operator, 'equal', 'should have the operator equal');
    t.equal(message, 'woot ip', 'should have the custom message');
    t.equal(pass, false, 'should not have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  index('notOk operator', t=> {
    const tp = test$3({});
    const a = assertion(tp);
    const {operator, message, pass} = a.notOk(false);
    t.equal(operator, 'notOk', 'should have the operator notOk');
    t.equal(message, 'should not be truthy', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  index('notOk operator: change message', t=> {
    const tp = test$3({});
    const a = assertion(tp);
    const {operator, message, pass, expected, actual} = a.notOk(1, 'not default!');
    t.equal(operator, 'notOk', 'should have the operator notOk');
    t.equal(message, 'not default!', 'should not have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(expected, 'falsy');
    t.equal(actual, 1, 'should have provided the acual value');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  index('notDeepEqual operator', t=> {
    const tp = test$3({});
    const a = assertion(tp);
    const {operator, message, pass} = a.notDeepEqual({foo: {bar: 'blah'}}, {foo: {bar: 'bar'}});
    t.equal(operator, 'notDeepEqual', 'should have the operator notDeepEqual');
    t.equal(message, 'should not be equivalent', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  index('notDeepEqual operator: change message', t=> {
    const tp = test$3({});
    const a = assertion(tp);
    const {operator, message, pass, expected, actual} = a.notDeepEqual({foo: {bar: 'bar'}}, {foo: {bar: 'bar'}}, 'woot woot');
    t.equal(operator, 'notDeepEqual', 'should have the operator notDeepEqual');
    t.equal(message, 'woot woot', 'should not have the default message');
    t.equal(pass, false, 'should not have passed');
    t.deepEqual(actual, {foo: {bar: 'bar'}});
    t.deepEqual(expected, {foo: {bar: 'bar'}});
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  index('notEqual operator', t=> {
    const tp = test$3({});
    const a = assertion(tp);
    const {operator, message, pass} = a.notEqual({foo: 'bar'}, {foo: 'bar'});
    t.equal(operator, 'notEqual', 'should have the operator notEqual');
    t.equal(message, 'should not be equal', 'should have the default message');
    t.equal(pass, true, 'should have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  index('notEqual operator: change default message', t=> {
    const tp = test$3({});
    const a = assertion(tp);
    const {operator, message, pass} = a.notEqual('foo', 'foo', 'blah');
    t.equal(operator, 'notEqual', 'should have the operator notEqual');
    t.equal(message, 'blah', 'should have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  index('fail',t=>{
    const tp = test$3({});
    const a = assertion(tp);
    const {operator, message, pass} = a.fail();
    t.equal(operator, 'fail', 'should have the operator fail');
    t.equal(message, 'fail called', 'should have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

  index('fail: change default message',t=>{
    const tp = test$3({});
    const a = assertion(tp);
    const {operator, message, pass} = a.fail('should not get here');
    t.equal(operator, 'fail', 'should have the operator fail');
    t.equal(message, 'should not get here', 'should have the default message');
    t.equal(pass, false, 'should not have passed');
    t.equal(tp.length, 1, 'should have added the assertion');
    t.end();
  });

}

function testFunc$2 () {
  index('test: add assertion', t=> {
    const tp = test$3({
      description: 'a description'
    });

    t.equal(tp.length, 0);
    tp.addAssertion({foo: 'bar'});
    t.deepEqual(tp.assertions, [{description: 'a description', foo: 'bar'}]);
    t.end();
  });

  index('test: add assertion using n arrity', t=> {
    const tp = test$3({
      description: 'blah'
    });

    t.equal(tp.length, 0);
    tp.addAssertion({foo: 'bar'}, {foo: 'bis'});
    t.deepEqual(tp.assertions, [{description: 'blah', foo: 'bar'}, {description: 'blah', foo: 'bis'}]);
    t.end();
  });

  index('test: run and resolve with assertions', t=> {
    const tp = test$3({
      description: 'desc',
      coroutine: function * (assert) {
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

  index('test: run and resolve with assertions asyn flow', t=> {
    const tp = test$3({
      description: 'desc',
      coroutine: function * (assert) {
        const presult = new Promise(function (resolve) {
          setTimeout(function () {
            resolve(true);
          }, 100);
        });

        const r = yield presult;

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

function tapOut ({pass, message, index}) {
  const status = pass === true ? 'ok' : 'not ok';
  console.log([status, index, message].join(' '));
}

function canExit () {
  return typeof process !== 'undefined' && typeof process.exit === 'function';
}

function tap () {
  return function * () {
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
}

const Plan = {
  test(description, coroutine){
    const items = (!coroutine && description.tests) ? [...description] : [{description, coroutine}];
    this.tests.push(...items.map(t=>test$3(t)));
    return this;
  },

  run(sink = tap()){
    const sinkIterator = sink();
    sinkIterator.next();
    return index$28(function * () {
      let id = 1;
      try {
        const results = this.tests.map(t=>t.run());
        for (let r of results) {
          const {assertions, executionTime} = yield r;
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
    }.bind(this))
  },

  * [Symbol.iterator](){
    for (let t of this.tests) {
      yield t;
    }
  }
};

function plan$1 () {
  return Object.create(Plan, {
    tests: {value: []}, length: {
      get(){
        return this.tests.length
      }
    }
  });
}

function testFunc$3 () {

  index('add a test', t=> {
    const coroutine = function * () {
    };
    const description = 'desc';
    const p = plan$1();

    p.test(description, coroutine);

    t.equal(p.length, 1);
    t.equal(p.tests[0].coroutine, coroutine);
    t.equal(p.tests[0].description, 'desc');

    t.end();
  });

  index('compose plans', t=> {
    const coroutine = function * () {
    };
    const description = 'desc';
    const p = plan$1();

    p.test(description, coroutine);
    const sp = plan$1();

    sp.test(description, coroutine);
    sp.test(p);

    t.equal(sp.length, 2);

    t.end();
  });

  index('plan running tests', t=> {
    t.plan(16);

    const p = plan$1();

    p.test('test 1', function * (assert) {
      assert.ok(true);
    });

    p.test('test 2', function * (assert) {
      assert.ok(true);
    });

    p.run(function * () {
      let time = 1;
      while (true) {
        const assertion = yield;
        const {actual, description, expected, message, operator, pass, id, executionTime}=assertion;
        if (time === 1) {
          t.equal(actual, true);
          t.equal(description, 'test 1');
          t.equal(expected, 'truthy');
          t.equal(message, 'should be truthy');
          t.equal(operator, 'ok');
          t.equal(pass, true);
          t.equal(id, 1);
          t.ok(executionTime !== undefined);
        } else {
          t.equal(actual, true);
          t.equal(description, 'test 2');
          t.equal(expected, 'truthy');
          t.equal(message, 'should be truthy');
          t.equal(operator, 'ok');
          t.equal(pass, true);
          t.equal(id, 2);
          t.ok(executionTime !== undefined);
        }
        time++;
      }
    });
  });
}

testFunc$1();
testFunc$2();
testFunc$3();
