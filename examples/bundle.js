(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
* Require the given path.
*
* @param {String} path
* @return {Object} exports
* @api public
*/

function _require(path, parent, orig) {
  var resolved = _require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err._require = true;
    throw err;
  }

  var module = _require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, _require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
* Registered modules.
*/

_require.modules = {};

/**
* Registered aliases.
*/

_require.aliases = {};

/**
* Resolve `path`.
*
* Lookup:
*
*   - PATH/index.js
*   - PATH.js
*   - PATH
*
* @param {String} path
* @return {String} path or null
* @api private
*/

_require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
  path,
  path + '.js',
  path + '.json',
  path + '/index.js',
  path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (_require.modules.hasOwnProperty(path)) return path;
    if (_require.aliases.hasOwnProperty(path)) return _require.aliases[path];
  }
};

/**
* Normalize `path` relative to the current path.
*
* @param {String} curr
* @param {String} path
* @return {String}
* @api private
*/

_require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
* Register module at `path` with callback `definition`.
*
* @param {String} path
* @param {Function} definition
* @api private
*/

_require.register = function(path, definition) {
  _require.modules[path] = definition;
};

/**
* Alias a module definition.
*
* @param {String} from
* @param {String} to
* @api private
*/

_require.alias = function(from, to) {
  if (!_require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  _require.aliases[to] = from;
};

/**
* Return a require function relative to the `parent` path.
*
* @param {String} parent
* @return {Function}
* @api private
*/

_require.relative = function(parent) {
  var p = _require.normalize(parent, '..');

  /**
  * lastIndexOf helper.
  */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
  * The relative require() itself.
  */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return _require(resolved, parent, path);
  }

  /**
  * Resolve relative to the parent.
  */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return _require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
  * Check if module is defined at `path`.
  */

  localRequire.exists = function(path) {
    return _require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
_require.register("component-history/index.js", function(exports, _require, module){

  /**
  * Expose `History`.
  */

  module.exports = History;

  /**
  * Initialize a `History` with the given `vals`.
  *
  * @param {Array} vals
  * @api public
  */

  function History(vals) {
    this.vals = vals || [];
    this.reset();
    this.max(1000);
  }

  /**
  * Cap the entries.
  *
  * @api private
  */

  History.prototype.cap = function(){
    var max = this._max;
    var len = this.vals.length;
    var remove = len - max;
    if (remove <= 0) return;
    while (remove--) this.vals.shift();
    this.reset();
  };

  /**
  * Set the maximum number of entries to `n`.
  *
  * @param {Number} n
  * @return {History}
  * @api public
  */

  History.prototype.max = function(n){
    this._max = n;
    this.cap();
    return this;
  };

  /**
  * Add a `val`.
  *
  * @param {Object} val
  * @return {History}
  * @api public
  */

  History.prototype.add = function(val){
    this.i = this.vals.push(val);
    this.cap();
    return this;
  };

  /**
  * Cycle backwards through history.
  *
  * @return {Object}
  * @api public
  */

  History.prototype.prev = function(){
    if (this.i <= 0) return;
    return this.vals[--this.i];
  };

  /**
  * Cycle forward through history.
  *
  * @return {Object}
  * @api public
  */

  History.prototype.next = function(){
    var len = this.vals.length;
    if (this.i >= len) return;
    return this.vals[++this.i];
  };

  /**
  * Reset the history index.
  *
  * @return {History}
  * @api public
  */

  History.prototype.reset = function(){
    this.i = this.vals.length;
    return this;
  };

});
_require.register("component-emitter/index.js", function(exports, _require, module){

  /**
  * Expose `Emitter`.
  */

  module.exports = Emitter;

  /**
  * Initialize a new `Emitter`.
  *
  * @api public
  */

  function Emitter(obj) {
    if (obj) return mixin(obj);
  };

  /**
  * Mixin the emitter properties.
  *
  * @param {Object} obj
  * @return {Object}
  * @api private
  */

  function mixin(obj) {
    for (var key in Emitter.prototype) {
      obj[key] = Emitter.prototype[key];
    }
    return obj;
  }

  /**
  * Listen on the given `event` with `fn`.
  *
  * @param {String} event
  * @param {Function} fn
  * @return {Emitter}
  * @api public
  */

  Emitter.prototype.on =
  Emitter.prototype.addEventListener = function(event, fn){
    this._callbacks = this._callbacks || {};
    (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
    return this;
  };

  /**
  * Adds an `event` listener that will be invoked a single
  * time then automatically removed.
  *
  * @param {String} event
  * @param {Function} fn
  * @return {Emitter}
  * @api public
  */

  Emitter.prototype.once = function(event, fn){
    var self = this;
    this._callbacks = this._callbacks || {};

    function on() {
      self.off(event, on);
      fn.apply(this, arguments);
    }

    on.fn = fn;
    this.on(event, on);
    return this;
  };

  /**
  * Remove the given callback for `event` or all
  * registered callbacks.
  *
  * @param {String} event
  * @param {Function} fn
  * @return {Emitter}
  * @api public
  */

  Emitter.prototype.off =
  Emitter.prototype.removeListener =
  Emitter.prototype.removeAllListeners =
  Emitter.prototype.removeEventListener = function(event, fn){
    this._callbacks = this._callbacks || {};

    // all
    if (0 == arguments.length) {
      this._callbacks = {};
      return this;
    }

    // specific event
    var callbacks = this._callbacks[event];
    if (!callbacks) return this;

    // remove all handlers
    if (1 == arguments.length) {
      delete this._callbacks[event];
      return this;
    }

    // remove specific handler
    var cb;
    for (var i = 0; i < callbacks.length; i++) {
      cb = callbacks[i];
      if (cb === fn || cb.fn === fn) {
        callbacks.splice(i, 1);
        break;
      }
    }
    return this;
  };

  /**
  * Emit `event` with the given args.
  *
  * @param {String} event
  * @param {Mixed} ...
  * @return {Emitter}
  */

  Emitter.prototype.emit = function(event){
    this._callbacks = this._callbacks || {};
    var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

    if (callbacks) {
      callbacks = callbacks.slice(0);
      for (var i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(this, args);
      }
    }

    return this;
  };

  /**
  * Return array of callbacks for `event`.
  *
  * @param {String} event
  * @return {Array}
  * @api public
  */

  Emitter.prototype.listeners = function(event){
    this._callbacks = this._callbacks || {};
    return this._callbacks[event] || [];
  };

  /**
  * Check if this emitter has `event` handlers.
  *
  * @param {String} event
  * @return {Boolean}
  * @api public
  */

  Emitter.prototype.hasListeners = function(event){
    return !! this.listeners(event).length;
  };

});
_require.register("component-event/index.js", function(exports, _require, module){
  var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
  unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
  prefix = bind !== 'addEventListener' ? 'on' : '';

  /**
  * Bind `el` event `type` to `fn`.
  *
  * @param {Element} el
  * @param {String} type
  * @param {Function} fn
  * @param {Boolean} capture
  * @return {Function}
  * @api public
  */

  exports.bind = function(el, type, fn, capture){
    el[bind](prefix + type, fn, capture || false);
    return fn;
  };

  /**
  * Unbind `el` event `type`'s callback `fn`.
  *
  * @param {Element} el
  * @param {String} type
  * @param {Function} fn
  * @param {Boolean} capture
  * @return {Function}
  * @api public
  */

  exports.unbind = function(el, type, fn, capture){
    el[unbind](prefix + type, fn, capture || false);
    return fn;
  };
});
_require.register("component-query/index.js", function(exports, _require, module){
  function one(selector, el) {
    return el.querySelector(selector);
  }

  exports = module.exports = function(selector, el){
    el = el || document;
    return one(selector, el);
  };

  exports.all = function(selector, el){
    el = el || document;
    return el.querySelectorAll(selector);
  };

  exports.engine = function(obj){
    if (!obj.one) throw new Error('.one callback required');
    if (!obj.all) throw new Error('.all callback required');
    one = obj.one;
    exports.all = obj.all;
    return exports;
  };

});
_require.register("component-matches-selector/index.js", function(exports, _require, module){
  /**
  * Module dependencies.
  */

  var query = _require('query');

  /**
  * Element prototype.
  */

  var proto = Element.prototype;

  /**
  * Vendor function.
  */

  var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

  /**
  * Expose `match()`.
  */

  module.exports = match;

  /**
  * Match `el` to `selector`.
  *
  * @param {Element} el
  * @param {String} selector
  * @return {Boolean}
  * @api public
  */

  function match(el, selector) {
    if (!el || el.nodeType !== 1) return false;
    if (vendor) return vendor.call(el, selector);
    var nodes = query.all(selector, el.parentNode);
    for (var i = 0; i < nodes.length; ++i) {
      if (nodes[i] == el) return true;
    }
    return false;
  }

});
_require.register("component-closest/index.js", function(exports, _require, module){
  var matches = _require('matches-selector')

  module.exports = function (element, selector, checkYoSelf, root) {
    element = checkYoSelf ? {parentNode: element} : element

    root = root || document

    // Make sure `element !== document` and `element != null`
    // otherwise we get an illegal invocation
    while ((element = element.parentNode) && element !== document) {
      if (matches(element, selector))
        return element
        // After `matches` on the edge case that
        // the selector matches the root
        // (when the root is not the document)
        if (element === root)
          return
        }
      }

    });
    _require.register("component-delegate/index.js", function(exports, _require, module){
      /**
      * Module dependencies.
      */

      var closest = _require('closest')
      , event = _require('event');

      /**
      * Delegate event `type` to `selector`
      * and invoke `fn(e)`. A callback function
      * is returned which may be passed to `.unbind()`.
      *
      * @param {Element} el
      * @param {String} selector
      * @param {String} type
      * @param {Function} fn
      * @param {Boolean} capture
      * @return {Function}
      * @api public
      */

      exports.bind = function(el, selector, type, fn, capture){
        return event.bind(el, type, function(e){
          var target = e.target || e.srcElement;
          e.delegateTarget = closest(target, selector, true, el);
          if (e.delegateTarget) fn.call(el, e);
        }, capture);
      };

      /**
      * Unbind event `type`'s callback `fn`.
      *
      * @param {Element} el
      * @param {String} type
      * @param {Function} fn
      * @param {Boolean} capture
      * @api public
      */

      exports.unbind = function(el, type, fn, capture){
        event.unbind(el, type, fn, capture);
      };

    });
    _require.register("component-events/index.js", function(exports, _require, module){

      /**
      * Module dependencies.
      */

      var events = _require('event');
      var delegate = _require('delegate');

      /**
      * Expose `Events`.
      */

      module.exports = Events;

      /**
      * Initialize an `Events` with the given
      * `el` object which events will be bound to,
      * and the `obj` which will receive method calls.
      *
      * @param {Object} el
      * @param {Object} obj
      * @api public
      */

      function Events(el, obj) {
        if (!(this instanceof Events)) return new Events(el, obj);
        if (!el) throw new Error('element required');
        if (!obj) throw new Error('object required');
        this.el = el;
        this.obj = obj;
        this._events = {};
      }

      /**
      * Subscription helper.
      */

      Events.prototype.sub = function(event, method, cb){
        this._events[event] = this._events[event] || {};
        this._events[event][method] = cb;
      };

      /**
      * Bind to `event` with optional `method` name.
      * When `method` is undefined it becomes `event`
      * with the "on" prefix.
      *
      * Examples:
      *
      *  Direct event handling:
      *
      *    events.bind('click') // implies "onclick"
      *    events.bind('click', 'remove')
      *    events.bind('click', 'sort', 'asc')
      *
      *  Delegated event handling:
      *
      *    events.bind('click li > a')
      *    events.bind('click li > a', 'remove')
      *    events.bind('click a.sort-ascending', 'sort', 'asc')
      *    events.bind('click a.sort-descending', 'sort', 'desc')
      *
      * @param {String} event
      * @param {String|function} [method]
      * @return {Function} callback
      * @api public
      */

      Events.prototype.bind = function(event, method){
        var e = parse(event);
        var el = this.el;
        var obj = this.obj;
        var name = e.name;
        var method = method || 'on' + name;
        var args = [].slice.call(arguments, 2);

        // callback
        function cb(){
          var a = [].slice.call(arguments).concat(args);
          obj[method].apply(obj, a);
        }

        // bind
        if (e.selector) {
          cb = delegate.bind(el, e.selector, name, cb);
        } else {
          events.bind(el, name, cb);
        }

        // subscription for unbinding
        this.sub(name, method, cb);

        return cb;
      };

      /**
      * Unbind a single binding, all bindings for `event`,
      * or all bindings within the manager.
      *
      * Examples:
      *
      *  Unbind direct handlers:
      *
      *     events.unbind('click', 'remove')
      *     events.unbind('click')
      *     events.unbind()
      *
      * Unbind delegate handlers:
      *
      *     events.unbind('click', 'remove')
      *     events.unbind('click')
      *     events.unbind()
      *
      * @param {String|Function} [event]
      * @param {String|Function} [method]
      * @api public
      */

      Events.prototype.unbind = function(event, method){
        if (0 == arguments.length) return this.unbindAll();
        if (1 == arguments.length) return this.unbindAllOf(event);

        // no bindings for this event
        var bindings = this._events[event];
        if (!bindings) return;

        // no bindings for this method
        var cb = bindings[method];
        if (!cb) return;

        events.unbind(this.el, event, cb);
      };

      /**
      * Unbind all events.
      *
      * @api private
      */

      Events.prototype.unbindAll = function(){
        for (var event in this._events) {
          this.unbindAllOf(event);
        }
      };

      /**
      * Unbind all events for `event`.
      *
      * @param {String} event
      * @api private
      */

      Events.prototype.unbindAllOf = function(event){
        var bindings = this._events[event];
        if (!bindings) return;

        for (var method in bindings) {
          this.unbind(event, method);
        }
      };

      /**
      * Parse `event`.
      *
      * @param {String} event
      * @return {Object}
      * @api private
      */

      function parse(event) {
        var parts = event.split(/ +/);
        return {
          name: parts.shift(),
          selector: parts.join(' ')
        }
      }

    });
    _require.register("bmcmahen-auto-save/index.js", function(exports, _require, module){
      /**
      * Basically a glorified setTimeout that I inevitably
      * implement in any auto-save context.
      * @param  {Number} time ms
      * @return {Timer}
      */

      module.exports = function(time){
        var time = time || 1000;
        var timer;
        var resetTimer = function(fn){
          timer = setTimeout(fn, time);
        };
        return function(fn){
          clearTimeout(timer);
          resetTimer(fn);
        }
      };


    });
    _require.register("yields-editable/index.js", function(exports, _require, module){

      /**
      * dependencies
      */

      var History = _require('history')
      , emitter = _require('emitter')
      , events = _require('events')
      , autosave = _require('auto-save')(500);

      /**
      * Export `Editable`.
      */

      module.exports = Editable;

      /**
      * Initialize new `Editable`.
      *
      * @param {Element} el
      * @param {Array} stack
      */

      function Editable(el, stack){
        var self = this instanceof Editable;
        if (!self) return new Editable(el, stack);
        if (!el) throw new TypeError('expects an element');
        this.history = new History(stack || []);
        this.history.max(100);
        this.events = events(el, this);
        this.el = el;
      }

      /**
      * Mixins.
      */

      emitter(Editable.prototype);

      /**
      * Get editable contents.
      *
      * @return {String}
      * @api public
      */

      Editable.prototype.toString =
      Editable.prototype.contents = function(){
        return this.el.innerHTML;
      };

      /**
      * Toggle editable state.
      *
      * @return {Editable}
      * @api public
      */

      Editable.prototype.toggle = function(){
        return 'true' == this.el.contentEditable
        ? this.disable()
        : this.enable();
      };

      /**
      * Enable editable.
      *
      * @return {Editable}
      * @api public
      */

      Editable.prototype.enable = function(){
        this.el.contentEditable = true;
        this.events.bind('keyup', 'onstatechange');
        this.events.bind('click', 'onstatechange');
        this.events.bind('focus', 'onstatechange');
        this.events.bind('paste', 'onchange');
        this.events.bind('input', 'onchange');
        this.emit('enable');
        return this;
      };

      /**
      * Disable editable.
      *
      * @return {Editable}
      * @api public
      */

      Editable.prototype.disable = function(){
        this.el.contentEditable = false;
        this.events.unbind();
        this.emit('disable');
        return this;
      };

      /**
      * Get range.
      *
      * TODO: x-browser
      *
      * @return {Range}
      * @api public
      */

      Editable.prototype.range = function(){
        return document.createRange();
      };

      /**
      * Get selection.
      *
      * TODO: x-browser
      *
      * @return {Selection}
      * @api public
      */

      Editable.prototype.selection = function(){
        return window.getSelection();
      };

      /**
      * Undo.
      *
      * @return {Editable}
      * @api public
      */

      Editable.prototype.undo = function(){
        var buf = this.history.prev();
        if (!buf) return this;
        this.el.innerHTML = buf;
        position(this.el, buf.at);
        this.emit('state');
        return this;
      };

      /**
      * Redo.
      *
      * @return {Editable}
      * @api public
      */

      Editable.prototype.redo = function(){
        var buf = this.history.next();
        if (!buf) return this;
        this.el.innerHTML = buf;
        position(this.el, buf.at);
        this.emit('state');
        return this;
      };

      /**
      * Execute the given `cmd` with `val`.
      *
      * @param {String} cmd
      * @param {Mixed} val
      * @return {Editable}
      * @api public
      */

      Editable.prototype.execute = function(cmd, val){
        document.execCommand(cmd, false, val);
        this.onstatechange({});
        return this;
      };

      /**
      * Query `cmd` state.
      *
      * @param {String} cmd
      * @return {Boolean}
      * @api public
      */

      Editable.prototype.state = function(cmd){
        var length = this.history.vals.length - 1
        , stack = this.history;

        if ('undo' == cmd) return 0 < stack.i;
        if ('redo' == cmd) return length > stack.i;
        return document.queryCommandState(cmd);
      };

      /**
      * Emit `state`.
      *
      * @param {Event} e
      * @return {Editable}
      * @api private
      */

      Editable.prototype.onstatechange = function(e){
        var history = this.history.vals.length;

        if ('focus' == e.type && 0 == history) {
          this.onchange();
        }

        this.emit('state', e);
        return this;
      };

      /**
      * Emit `change` and push current `buf` to history.
      *
      * @param {Event} e
      * @return {Editable}
      * @api private
      */

      Editable.prototype.onchange = function(e){
        var self = this;
        autosave(function(){
          var buf = new String(self.toString());
          buf.at = position(self.el);
          self.history.add(buf);
          return self.emit('change', e);
        });
      };

      /**
      * Set / get caret position with `el`.
      *
      * @param {Element} el
      * @param {Number} at
      * @return {Number}
      * @api private
      */

      function position(el, at){
        if (1 == arguments.length) {
          var range = window.getSelection().getRangeAt(0);
          var clone = range.cloneRange();
          clone.selectNodeContents(el);
          clone.setEnd(range.endContainer, range.endOffset);
          return clone.toString().length;
        }

        var length = 0
        , abort;

        visit(el, function(node){
          if (3 != node.nodeType) return;
          length += node.textContent.length;
          if (length >= at) {
            if (abort) return;
            abort = true;
            var sel = document.getSelection();
            var range = document.createRange();
            var sub = length - node.textContent.length;
            range.setStart(node, at - sub);
            range.setEnd(node, at - sub);
            sel.removeAllRanges();
            sel.addRange(range);
            return true;
          }
        });
      }

      /**
      * Walk all text nodes of `node`.
      *
      * @param {Element|Node} node
      * @param {Function} fn
      * @api private
      */

      function visit(node, fn){
        var nodes = node.childNodes;
        for (var i = 0; i < nodes.length; ++i) {
          if (fn(nodes[i])) break;
          visit(nodes[i], fn);
        }
      }



    });










    _require.alias("yields-editable/index.js", "type-tester/deps/editable/index.js");
    _require.alias("yields-editable/index.js", "type-tester/deps/editable/index.js");
    _require.alias("yields-editable/index.js", "editable/index.js");
    _require.alias("component-history/index.js", "yields-editable/deps/history/index.js");

    _require.alias("component-emitter/index.js", "yields-editable/deps/emitter/index.js");

    _require.alias("component-events/index.js", "yields-editable/deps/events/index.js");
    _require.alias("component-event/index.js", "component-events/deps/event/index.js");

    _require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
    _require.alias("component-closest/index.js", "component-delegate/deps/closest/index.js");
    _require.alias("component-closest/index.js", "component-delegate/deps/closest/index.js");
    _require.alias("component-matches-selector/index.js", "component-closest/deps/matches-selector/index.js");
    _require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

    _require.alias("component-closest/index.js", "component-closest/index.js");
    _require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

    _require.alias("bmcmahen-auto-save/index.js", "yields-editable/deps/auto-save/index.js");
    _require.alias("bmcmahen-auto-save/index.js", "yields-editable/deps/auto-save/index.js");
    _require.alias("bmcmahen-auto-save/index.js", "bmcmahen-auto-save/index.js");
    _require.alias("yields-editable/index.js", "yields-editable/index.js");


    // See the vendor/README.md
    Editable = _require('editable')
    
module.exports = _require;
},{}],2:[function(require,module,exports){
(function (global){
; var __browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
/**
* findAndReplaceDOMText v 0.4.2
* @author James Padolsey http://james.padolsey.com
* @license http://unlicense.org/UNLICENSE
*
* Matches the text of a DOM node against a regular expression
* and replaces each match (or node-separated portions of the match)
* in the specified element.
*/
window.findAndReplaceDOMText = (function() {

	var PORTION_MODE_RETAIN = 'retain';
	var PORTION_MODE_FIRST = 'first';

	var doc = document;
	var toString = {}.toString;

	function isArray(a) {
		return toString.call(a) == '[object Array]';
	}

	function escapeRegExp(s) {
		return String(s).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
	}

	function exposed() {
		// Try deprecated arg signature first:
		return deprecated.apply(null, arguments) || findAndReplaceDOMText.apply(null, arguments);
	}

	function deprecated(regex, node, replacement, captureGroup, elFilter) {
		if ((node && !node.nodeType) && arguments.length <= 2) {
			return false;
		}
		var isReplacementFunction = typeof replacement == 'function';

		if (isReplacementFunction) {
			replacement = (function(original) {
				return function(portion, match) {
					return original(portion.text, match.startIndex);
				};
			}(replacement));
		}

		// Awkward support for deprecated argument signature (<0.4.0)
		var instance = findAndReplaceDOMText(node, {

			find: regex,

			wrap: isReplacementFunction ? null : replacement,
			replace: isReplacementFunction ? replacement : '$' + (captureGroup || '&'),

			prepMatch: function(m, mi) {

				// Support captureGroup (a deprecated feature)

				if (!m[0]) throw 'findAndReplaceDOMText cannot handle zero-length matches';

				if (captureGroup > 0) {
					var cg = m[captureGroup];
					m.index += m[0].indexOf(cg);
					m[0] = cg;
				}

				m.endIndex = m.index + m[0].length;
				m.startIndex = m.index;
				m.index = mi;

				return m;
			},
			filterElements: elFilter
		});

		exposed.revert = function() {
			return instance.revert();
		};

		return true;
	}

	/**
	* findAndReplaceDOMText
	*
	* Locates matches and replaces with replacementNode
	*
	* @param {Node} node Element or Text node to search within
	* @param {RegExp} options.find The regular expression to match
	* @param {String|Element} [options.wrap] A NodeName, or a Node to clone
	* @param {String|Function} [options.replace='$&'] What to replace each match with
	* @param {Function} [options.filterElements] A Function to be called to check whether to
	*	process an element. (returning true = process element,
	*	returning false = avoid element)
	*/
	function findAndReplaceDOMText(node, options) {
		return new Finder(node, options);
	}

	exposed.Finder = Finder;

	/**
	* Finder -- encapsulates logic to find and replace.
	*/
	function Finder(node, options) {

		options.portionMode = options.portionMode || PORTION_MODE_RETAIN;

		this.node = node;
		this.options = options;

		// ENable match-preparation method to be passed as option:
		this.prepMatch = options.prepMatch || this.prepMatch;

		this.reverts = [];

		this.matches = this.search();

		if (this.matches.length) {
			this.processMatches();
		}

	}

	Finder.prototype = {

		/**
		* Searches for all matches that comply with the instance's 'match' option
		*/
		search: function() {

			var match;
			var matchIndex = 0;
			var regex = this.options.find;
			var text = this.getAggregateText();
			var matches = [];

			regex = typeof regex === 'string' ? RegExp(escapeRegExp(regex), 'g') : regex;

			if (regex.global) {
				while (match = regex.exec(text)) {
					matches.push(this.prepMatch(match, matchIndex++));
				}
			} else {
				if (match = text.match(regex)) {
					matches.push(this.prepMatch(match, 0));
				}
			}

			return matches;

		},

		/**
		* Prepares a single match with useful meta info:
		*/
		prepMatch: function(match, matchIndex) {

			if (!match[0]) {
				throw new Error('findAndReplaceDOMText cannot handle zero-length matches');
			}

			match.endIndex = match.index + match[0].length;
			match.startIndex = match.index;
			match.index = matchIndex;

			return match;
		},

		/**
		* Gets aggregate text within subject node
		*/
		getAggregateText: function() {

			var elementFilter = this.options.filterElements;

			return getText(this.node);

			/**
			* Gets aggregate text of a node without resorting
			* to broken innerText/textContent
			*/
			function getText(node) {

				if (node.nodeType === 3) {
					return node.data;
				}

				if (elementFilter && !elementFilter(node)) {
					return '';
				}

				var txt = '';

				if (node = node.firstChild) do {
					txt += getText(node);
				} while (node = node.nextSibling);

				return txt;

			}

		},

		/**
		* Steps through the target node, looking for matches, and
		* calling replaceFn when a match is found.
		*/
		processMatches: function() {

			var matches = this.matches;
			var node = this.node;
			var elementFilter = this.options.filterElements;

			var startPortion,
			endPortion,
			innerPortions = [],
			curNode = node,
			match = matches.shift(),
			atIndex = 0, // i.e. nodeAtIndex
			matchIndex = 0,
			portionIndex = 0,
			doAvoidNode,
			nodeStack = [node];

			out: while (true) {

				if (curNode.nodeType === 3) {

					if (!endPortion && curNode.length + atIndex >= match.endIndex) {

						// We've found the ending
						endPortion = {
							node: curNode,
							index: portionIndex++,
							text: curNode.data.substring(match.startIndex - atIndex, match.endIndex - atIndex),
							indexInMatch: atIndex - match.startIndex,
							indexInNode: match.startIndex - atIndex, // always zero for end-portions
							endIndexInNode: match.endIndex - atIndex,
							isEnd: true
						};

					} else if (startPortion) {
						// Intersecting node
						innerPortions.push({
							node: curNode,
							index: portionIndex++,
							text: curNode.data,
							indexInMatch: atIndex - match.startIndex,
							indexInNode: 0 // always zero for inner-portions
						});
					}

					if (!startPortion && curNode.length + atIndex > match.startIndex) {
						// We've found the match start
						startPortion = {
							node: curNode,
							index: portionIndex++,
							indexInMatch: 0,
							indexInNode: match.startIndex - atIndex,
							endIndexInNode: match.endIndex - atIndex,
							text: curNode.data.substring(match.startIndex - atIndex, match.endIndex - atIndex)
						};
					}

					atIndex += curNode.data.length;

				}

				doAvoidNode = curNode.nodeType === 1 && elementFilter && !elementFilter(curNode);

				if (startPortion && endPortion) {

					curNode = this.replaceMatch(match, startPortion, innerPortions, endPortion);

					// processMatches has to return the node that replaced the endNode
					// and then we step back so we can continue from the end of the
					// match:

					atIndex -= (endPortion.node.data.length - endPortion.endIndexInNode);

					startPortion = null;
					endPortion = null;
					innerPortions = [];
					match = matches.shift();
					portionIndex = 0;
					matchIndex++;

					if (!match) {
						break; // no more matches
					}

				} else if (
					!doAvoidNode &&
					(curNode.firstChild || curNode.nextSibling)
				) {
					// Move down or forward:
					if (curNode.firstChild) {
						nodeStack.push(curNode);
						curNode = curNode.firstChild;
					} else {
						curNode = curNode.nextSibling;
					}
					continue;
				}

				// Move forward or up:
				while (true) {
					if (curNode.nextSibling) {
						curNode = curNode.nextSibling;
						break;
					}
					curNode = nodeStack.pop();
					if (curNode === node) {
						break out;
					}
				}

			}

		},

		/**
		* Reverts ... TODO
		*/
		revert: function() {
			// Reversion occurs backwards so as to avoid nodes subsequently
			// replaced during the matching phase (a forward process):
			for (var l = this.reverts.length; l--;) {
				this.reverts[l]();
			}
			this.reverts = [];
		},

		prepareReplacementString: function(string, portion, match, matchIndex) {
			var portionMode = this.options.portionMode;
			if (
				portionMode === PORTION_MODE_FIRST &&
				portion.indexInMatch > 0
			) {
				return '';
			}
			string = string.replace(/\$(\d+|&|`|')/g, function($0, t) {
				var replacement;
				switch(t) {
					case '&':
						replacement = match[0];
						break;
						case '`':
							replacement = match.input.substring(0, match.startIndex);
							break;
							case '\'':
								replacement = match.input.substring(match.endIndex);
								break;
								default:
									replacement = match[+t];
								}
								return replacement;
							});

							if (portionMode === PORTION_MODE_FIRST) {
								return string;
							}

							if (portion.isEnd) {
								return string.substring(portion.indexInMatch);
							}

							return string.substring(portion.indexInMatch, portion.indexInMatch + portion.text.length);
						},

						getPortionReplacementNode: function(portion, match, matchIndex) {

							var replacement = this.options.replace || '$&';
							var wrapper = this.options.wrap;

							if (wrapper && wrapper.nodeType) {
								// Wrapper has been provided as a stencil-node for us to clone:
								var clone = doc.createElement('div');
								clone.innerHTML = wrapper.outerHTML || new XMLSerializer().serializeToString(wrapper);
								wrapper = clone.firstChild;
							}

							if (typeof replacement == 'function') {
								replacement = replacement(portion, match, matchIndex);
								if (replacement && replacement.nodeType) {
									return replacement;
								}
								return doc.createTextNode(String(replacement));
							}

							var el = typeof wrapper == 'string' ? doc.createElement(wrapper) : wrapper;

							replacement = doc.createTextNode(
								this.prepareReplacementString(
									replacement, portion, match, matchIndex
								)
							);

							if (!replacement.data) {
								return replacement;
							}

							if (!el) {
								return replacement;
							}

							el.appendChild(replacement);

							return el;
						},

						replaceMatch: function(match, startPortion, innerPortions, endPortion) {

							var matchStartNode = startPortion.node;
							var matchEndNode = endPortion.node;

							var preceedingTextNode;
							var followingTextNode;

							if (matchStartNode === matchEndNode) {

								var node = matchStartNode;

								if (startPortion.indexInNode > 0) {
									// Add `before` text node (before the match)
									preceedingTextNode = doc.createTextNode(node.data.substring(0, startPortion.indexInNode));
									node.parentNode.insertBefore(preceedingTextNode, node);
								}

								// Create the replacement node:
								var newNode = this.getPortionReplacementNode(
									endPortion,
									match
								);

								node.parentNode.insertBefore(newNode, node);

								if (endPortion.endIndexInNode < node.length) { // ?????
									// Add `after` text node (after the match)
									followingTextNode = doc.createTextNode(node.data.substring(endPortion.endIndexInNode));
									node.parentNode.insertBefore(followingTextNode, node);
								}

								node.parentNode.removeChild(node);

								this.reverts.push(function() {
									if (preceedingTextNode === newNode.previousSibling) {
										preceedingTextNode.parentNode.removeChild(preceedingTextNode);
									}
									if (followingTextNode === newNode.nextSibling) {
										followingTextNode.parentNode.removeChild(followingTextNode);
									}
									newNode.parentNode.replaceChild(node, newNode);
								});

								return newNode;

							} else {
								// Replace matchStartNode -> [innerMatchNodes...] -> matchEndNode (in that order)


								preceedingTextNode = doc.createTextNode(
									matchStartNode.data.substring(0, startPortion.indexInNode)
								);

								followingTextNode = doc.createTextNode(
									matchEndNode.data.substring(endPortion.endIndexInNode)
								);

								var firstNode = this.getPortionReplacementNode(
									startPortion,
									match
								);

								var innerNodes = [];

								for (var i = 0, l = innerPortions.length; i < l; ++i) {
									var portion = innerPortions[i];
									var innerNode = this.getPortionReplacementNode(
										portion,
										match
									);
									portion.node.parentNode.replaceChild(innerNode, portion.node);
									this.reverts.push((function(portion, innerNode) {
										return function() {
											innerNode.parentNode.replaceChild(portion.node, innerNode);
										};
									}(portion, innerNode)));
									innerNodes.push(innerNode);
								}

								var lastNode = this.getPortionReplacementNode(
									endPortion,
									match
								);

								matchStartNode.parentNode.insertBefore(preceedingTextNode, matchStartNode);
								matchStartNode.parentNode.insertBefore(firstNode, matchStartNode);
								matchStartNode.parentNode.removeChild(matchStartNode);

								matchEndNode.parentNode.insertBefore(lastNode, matchEndNode);
								matchEndNode.parentNode.insertBefore(followingTextNode, matchEndNode);
								matchEndNode.parentNode.removeChild(matchEndNode);

								this.reverts.push(function() {
									preceedingTextNode.parentNode.removeChild(preceedingTextNode);
									firstNode.parentNode.replaceChild(matchStartNode, firstNode);
									followingTextNode.parentNode.removeChild(followingTextNode);
									lastNode.parentNode.replaceChild(matchEndNode, lastNode);
								});

								return lastNode;
							}
						}

					};

					return exposed;

				}());
				

; browserify_shim__define__module__export__(typeof findAndReplaceDOMText != "undefined" ? findAndReplaceDOMText : window.findAndReplaceDOMText);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
/**
 * Font Feature Abettings 0.1.0
 * https://github.com/kennethormandy/font-feature-abettings
 * @author Kenneth Ormandy http://kennethormandy.com
 * @license Copyright © 2014–2015 Kenneth Ormandy.
 *          Available under the MIT license.
 */

module.exports = function (gsub, gnames) {

  var item
  var feat
  var patterns = {}
  var permitted = ['liga', 'dlig', 'lnum'] // Options
  var figures = ['pnum', 'onum', 'lnum', 'tnum']
  var iterate

  /**
   * Flatten gsub, wizardry by @sintaxi
   */
  iterate = function (node, prefix) {
    var arr = []

    // Nothing to do
    if (Object.prototype.toString.call(node) !== '[object Object]') {
      return prefix || []
    }

    // Inception
    for (var key in node) {
      arr.push(iterate(gnames[node[key]], (prefix || '') + gnames[key]))
    }

    // Flatten
    // return [].concat.apply([], arr)
    return arr
  }

  /**
   * Flatten gsub table into feature names
   *
   */
  for (feat in gsub) {
    if (gsub.hasOwnProperty(feat)) {
      if (figures.indexOf(feat) !== -1) {
        // Hard-code numerals if there are numeral styles
        patterns[feat] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      } else if (permitted.indexOf(feat) !== -1) {
        patterns[feat] = []
        for (item in gsub[feat]) {
          var gsubPortion = gsub[feat][item]
          // It seems like this should all be part of @sintaxi’s thing, too
          if (gsub[feat].hasOwnProperty(item)) {
            // if (gsubPortion.length === 1) {
            //   console.log(gnames[gsubPortion[0]])
            // } else
            if (Object.prototype.toString.call(gsubPortion) === '[object Object]') {
              patterns[feat].push.apply(patterns[feat], iterate(gsubPortion, gnames[item]))
            }
            // else {
            //   // If it’s not an object, it’s a single character substitution
            //   return patterns += ',' + iterate(gsub[feat]).join())
            // }
          }
        }
      }
    }
  }

  /**
   * Return flattened features
   *
   */
  return patterns
}

},{}],4:[function(require,module,exports){
module.exports={
    "font-family": "Klinic Slab",
    "font-style": "normal",
    "font-weight": 400,
    "feat": [
        "aalt",
        "c2sc",
        "case",
        "dlig",
        "liga",
        "lnum",
        "salt",
        "smcp",
        "ss01"
    ],
    "gsub": {
        "aalt": {
            "9": [
                463,
                560
            ],
            "11": [
                462
            ],
            "19": [
                566
            ],
            "20": [
                567
            ],
            "21": [
                535
            ],
            "22": [
                536
            ],
            "23": [
                537
            ],
            "24": [
                538
            ],
            "25": [
                539
            ],
            "26": [
                540
            ],
            "27": [
                541
            ],
            "34": [
                542
            ],
            "35": [
                543
            ],
            "36": [
                544
            ],
            "37": [
                464
            ],
            "38": [
                573
            ],
            "39": [
                466
            ],
            "40": [
                467
            ],
            "41": [
                468
            ],
            "42": [
                469
            ],
            "43": [
                470
            ],
            "44": [
                471
            ],
            "45": [
                472
            ],
            "46": [
                473
            ],
            "47": [
                474
            ],
            "48": [
                475
            ],
            "49": [
                476
            ],
            "50": [
                477
            ],
            "51": [
                478
            ],
            "52": [
                479
            ],
            "53": [
                480
            ],
            "54": [
                481
            ],
            "55": [
                482
            ],
            "56": [
                483
            ],
            "57": [
                484
            ],
            "58": [
                485
            ],
            "59": [
                486
            ],
            "60": [
                487
            ],
            "61": [
                488
            ],
            "68": [
                466,
                545
            ],
            "69": [
                489
            ],
            "70": [
                490
            ],
            "71": [
                491
            ],
            "72": [
                570
            ],
            "74": [
                472,
                555
            ],
            "76": [
                474,
                428
            ],
            "77": [
                571
            ],
            "78": [
                465
            ],
            "79": [
                467
            ],
            "80": [
                468
            ],
            "81": [
                469
            ],
            "82": [
                470
            ],
            "83": [
                471
            ],
            "84": [
                473
            ],
            "85": [
                475
            ],
            "86": [
                476
            ],
            "87": [
                477
            ],
            "88": [
                478
            ],
            "89": [
                479
            ],
            "90": [
                480
            ],
            "91": [
                481
            ],
            "92": [
                482
            ],
            "93": [
                483
            ],
            "94": [
                484
            ],
            "95": [
                485
            ],
            "128": [
                486
            ],
            "129": [
                487
            ],
            "130": [
                488
            ],
            "131": [
                489
            ],
            "132": [
                490
            ],
            "133": [
                491
            ],
            "134": [
                568
            ],
            "135": [
                572
            ],
            "136": [
                569
            ],
            "137": [
                492
            ],
            "138": [
                493
            ],
            "139": [
                494
            ],
            "140": [
                495
            ],
            "141": [
                496
            ],
            "142": [
                497
            ],
            "143": [
                498
            ],
            "144": [
                499
            ],
            "145": [
                500
            ],
            "146": [
                501
            ],
            "147": [
                502
            ],
            "148": [
                503
            ],
            "149": [
                504
            ],
            "150": [
                505
            ],
            "153": [
                506
            ],
            "154": [
                507
            ],
            "155": [
                508
            ],
            "156": [
                509
            ],
            "157": [
                510
            ],
            "158": [
                511
            ],
            "161": [
                498,
                546
            ],
            "162": [
                499,
                547
            ],
            "163": [
                500,
                548
            ],
            "164": [
                501,
                549
            ],
            "165": [
                502,
                550
            ],
            "166": [
                503,
                551
            ],
            "167": [
                512
            ],
            "168": [
                513
            ],
            "169": [
                514
            ],
            "170": [
                515
            ],
            "171": [
                516
            ],
            "172": [
                517
            ],
            "173": [
                518
            ],
            "174": [
                519
            ],
            "175": [
                520
            ],
            "176": [
                521
            ],
            "177": [
                522
            ],
            "178": [
                523
            ],
            "179": [
                524
            ],
            "180": [
                525
            ],
            "181": [
                526
            ],
            "182": [
                527
            ],
            "185": [
                504
            ],
            "186": [
                505
            ],
            "187": [
                506
            ],
            "188": [
                507
            ],
            "189": [
                508
            ],
            "190": [
                509
            ],
            "191": [
                510
            ],
            "192": [
                511
            ],
            "194": [
                370,
                552
            ],
            "196": [
                369,
                553
            ],
            "198": [
                371,
                554
            ],
            "199": [
                512
            ],
            "200": [
                513
            ],
            "201": [
                514
            ],
            "202": [
                515
            ],
            "203": [
                516
            ],
            "204": [
                517
            ],
            "205": [
                518
            ],
            "206": [
                519
            ],
            "207": [
                520
            ],
            "208": [
                521
            ],
            "209": [
                522
            ],
            "210": [
                523
            ],
            "211": [
                524
            ],
            "212": [
                525
            ],
            "213": [
                526
            ],
            "214": [
                527
            ],
            "215": [
                528
            ],
            "216": [
                370
            ],
            "217": [
                369
            ],
            "218": [
                371
            ],
            "219": [
                373
            ],
            "220": [
                373
            ],
            "222": [
                386,
                556
            ],
            "224": [
                385,
                557
            ],
            "226": [
                388,
                558
            ],
            "228": [
                387,
                559
            ],
            "229": [
                375
            ],
            "230": [
                375
            ],
            "231": [
                376
            ],
            "232": [
                376
            ],
            "233": [
                374
            ],
            "234": [
                374
            ],
            "235": [
                377
            ],
            "236": [
                377
            ],
            "237": [
                378
            ],
            "238": [
                378
            ],
            "239": [
                382
            ],
            "240": [
                382
            ],
            "241": [
                379
            ],
            "242": [
                379
            ],
            "243": [
                381
            ],
            "244": [
                381
            ],
            "245": [
                384
            ],
            "248": [
                384
            ],
            "249": [
                380
            ],
            "250": [
                380
            ],
            "251": [
                386
            ],
            "252": [
                385
            ],
            "253": [
                388
            ],
            "254": [
                387
            ],
            "255": [
                390
            ],
            "256": [
                390
            ],
            "257": [
                389
            ],
            "258": [
                389
            ],
            "259": [
                394
            ],
            "260": [
                394
            ],
            "261": [
                392
            ],
            "262": [
                392
            ],
            "265": [
                391
            ],
            "266": [
                391
            ],
            "267": [
                393
            ],
            "268": [
                393
            ],
            "269": [
                428
            ],
            "270": [
                474
            ],
            "271": [
                395
            ],
            "272": [
                395
            ],
            "273": [
                396
            ],
            "274": [
                396
            ],
            "275": [
                397
            ],
            "276": [
                397
            ],
            "277": [
                399
            ],
            "278": [
                399
            ],
            "279": [
                398
            ],
            "280": [
                398
            ],
            "281": [
                400
            ],
            "282": [
                400
            ],
            "283": [
                456
            ],
            "284": [
                456
            ],
            "285": [
                401
            ],
            "286": [
                401
            ],
            "287": [
                403
            ],
            "288": [
                403
            ],
            "289": [
                402
            ],
            "290": [
                402
            ],
            "291": [
                383
            ],
            "292": [
                383
            ],
            "293": [
                406
            ],
            "294": [
                406
            ],
            "295": [
                404
            ],
            "296": [
                404
            ],
            "297": [
                405
            ],
            "298": [
                405
            ],
            "299": [
                360
            ],
            "300": [
                360
            ],
            "301": [
                408
            ],
            "302": [
                408
            ],
            "303": [
                410
            ],
            "304": [
                410
            ],
            "305": [
                409
            ],
            "306": [
                409
            ],
            "307": [
                411
            ],
            "308": [
                411
            ],
            "309": [
                413
            ],
            "310": [
                413
            ],
            "311": [
                412
            ],
            "312": [
                412
            ],
            "313": [
                459
            ],
            "314": [
                459
            ],
            "315": [
                417
            ],
            "316": [
                417
            ],
            "319": [
                416
            ],
            "320": [
                416
            ],
            "321": [
                415
            ],
            "322": [
                415
            ],
            "323": [
                423
            ],
            "324": [
                423
            ],
            "325": [
                420
            ],
            "328": [
                420
            ],
            "329": [
                418
            ],
            "330": [
                418
            ],
            "331": [
                422
            ],
            "332": [
                422
            ],
            "333": [
                419
            ],
            "334": [
                419
            ]
        },
        "c2sc": {
            "4": [
                462
            ],
            "9": [
                463
            ],
            "11": [
                566
            ],
            "12": [
                567
            ],
            "34": [
                464
            ],
            "35": [
                573
            ],
            "36": [
                466
            ],
            "37": [
                467
            ],
            "38": [
                468
            ],
            "39": [
                469
            ],
            "40": [
                470
            ],
            "41": [
                471
            ],
            "42": [
                472
            ],
            "43": [
                473
            ],
            "44": [
                474
            ],
            "45": [
                475
            ],
            "46": [
                476
            ],
            "47": [
                477
            ],
            "48": [
                478
            ],
            "49": [
                479
            ],
            "50": [
                480
            ],
            "51": [
                481
            ],
            "52": [
                482
            ],
            "53": [
                483
            ],
            "54": [
                484
            ],
            "55": [
                485
            ],
            "56": [
                486
            ],
            "57": [
                487
            ],
            "58": [
                488
            ],
            "59": [
                489
            ],
            "60": [
                490
            ],
            "61": [
                491
            ],
            "62": [
                570
            ],
            "64": [
                571
            ],
            "67": [
                465
            ],
            "94": [
                568
            ],
            "95": [
                572
            ],
            "96": [
                569
            ],
            "98": [
                492
            ],
            "105": [
                493
            ],
            "112": [
                494
            ],
            "117": [
                495
            ],
            "121": [
                496
            ],
            "128": [
                497
            ],
            "129": [
                498
            ],
            "130": [
                499
            ],
            "131": [
                500
            ],
            "132": [
                501
            ],
            "133": [
                502
            ],
            "134": [
                503
            ],
            "135": [
                504
            ],
            "136": [
                505
            ],
            "137": [
                506
            ],
            "138": [
                507
            ],
            "139": [
                508
            ],
            "140": [
                509
            ],
            "141": [
                510
            ],
            "142": [
                511
            ],
            "143": [
                512
            ],
            "144": [
                513
            ],
            "145": [
                514
            ],
            "146": [
                515
            ],
            "147": [
                516
            ],
            "148": [
                517
            ],
            "149": [
                518
            ],
            "150": [
                519
            ],
            "151": [
                520
            ],
            "153": [
                521
            ],
            "154": [
                522
            ],
            "155": [
                523
            ],
            "156": [
                524
            ],
            "157": [
                525
            ],
            "158": [
                526
            ],
            "159": [
                527
            ],
            "193": [
                370
            ],
            "195": [
                369
            ],
            "197": [
                371
            ],
            "199": [
                373
            ],
            "201": [
                375
            ],
            "203": [
                376
            ],
            "205": [
                374
            ],
            "207": [
                377
            ],
            "209": [
                378
            ],
            "211": [
                382
            ],
            "213": [
                379
            ],
            "215": [
                381
            ],
            "217": [
                384
            ],
            "219": [
                380
            ],
            "221": [
                386
            ],
            "223": [
                385
            ],
            "225": [
                388
            ],
            "227": [
                387
            ],
            "229": [
                390
            ],
            "231": [
                389
            ],
            "233": [
                394
            ],
            "235": [
                392
            ],
            "237": [
                391
            ],
            "239": [
                393
            ],
            "241": [
                428
            ],
            "243": [
                395
            ],
            "245": [
                396
            ],
            "248": [
                397
            ],
            "250": [
                399
            ],
            "252": [
                398
            ],
            "254": [
                400
            ],
            "256": [
                456
            ],
            "258": [
                401
            ],
            "260": [
                403
            ],
            "262": [
                402
            ],
            "265": [
                383
            ],
            "267": [
                406
            ],
            "269": [
                404
            ],
            "271": [
                405
            ],
            "273": [
                360
            ],
            "275": [
                408
            ],
            "277": [
                410
            ],
            "279": [
                409
            ],
            "281": [
                411
            ],
            "283": [
                413
            ],
            "285": [
                412
            ],
            "287": [
                459
            ],
            "289": [
                417
            ],
            "291": [
                416
            ],
            "293": [
                415
            ],
            "295": [
                423
            ],
            "297": [
                420
            ],
            "299": [
                418
            ],
            "301": [
                422
            ],
            "303": [
                419
            ],
            "305": [
                421
            ],
            "307": [
                424
            ],
            "309": [
                425
            ],
            "311": [
                528
            ],
            "312": [
                426
            ],
            "314": [
                427
            ],
            "316": [
                461
            ],
            "319": [
                372
            ],
            "321": [
                407
            ],
            "323": [
                414
            ],
            "325": [
                575
            ],
            "328": [
                453
            ],
            "329": [
                452
            ],
            "330": [
                451
            ],
            "331": [
                454
            ],
            "332": [
                458
            ],
            "333": [
                457
            ],
            "334": [
                460
            ],
            "335": [
                455
            ],
            "560": [
                574
            ]
        },
        "case": {
            "11": [
                429
            ],
            "12": [
                430
            ],
            "16": [
                441
            ],
            "18": [
                561
            ],
            "35": [
                368
            ],
            "62": [
                431
            ],
            "63": [
                562
            ],
            "64": [
                432
            ],
            "94": [
                433
            ],
            "95": [
                563
            ],
            "96": [
                434
            ],
            "98": [
                435
            ],
            "103": [
                564
            ],
            "108": [
                437
            ],
            "120": [
                444
            ],
            "124": [
                438
            ],
            "128": [
                436
            ],
            "336": [
                442
            ],
            "337": [
                443
            ],
            "346": [
                565
            ],
            "349": [
                439
            ],
            "350": [
                440
            ]
        },
        "dlig": {
            "55": {
                "75": 576
            },
            "70": {
                "87": 577
            },
            "86": {
                "87": 534
            }
        },
        "liga": {
            "73": {
                "69": 583,
                "73": 529,
                "75": 584,
                "76": 530,
                "77": 585,
                "78": 586,
                "79": 531,
                "87": 587
            },
            "87": {
                "87": 588
            }
        },
        "lnum": {
            "19": [
                535
            ],
            "20": [
                536
            ],
            "21": [
                537
            ],
            "22": [
                538
            ],
            "23": [
                539
            ],
            "24": [
                540
            ],
            "25": [
                541
            ],
            "26": [
                542
            ],
            "27": [
                543
            ]
        },
        "salt": {
            "68": [
                545
            ],
            "74": [
                555
            ],
            "161": [
                546
            ],
            "162": [
                547
            ],
            "163": [
                548
            ],
            "164": [
                549
            ],
            "165": [
                550
            ],
            "166": [
                551
            ],
            "194": [
                552
            ],
            "196": [
                553
            ],
            "198": [
                554
            ],
            "222": [
                556
            ],
            "224": [
                557
            ],
            "226": [
                558
            ],
            "228": [
                559
            ]
        },
        "smcp": {
            "68": [
                466
            ],
            "69": [
                467
            ],
            "70": [
                468
            ],
            "71": [
                469
            ],
            "72": [
                470
            ],
            "73": [
                471
            ],
            "74": [
                472
            ],
            "75": [
                473
            ],
            "76": [
                474
            ],
            "77": [
                475
            ],
            "78": [
                476
            ],
            "79": [
                477
            ],
            "80": [
                478
            ],
            "81": [
                479
            ],
            "82": [
                480
            ],
            "83": [
                481
            ],
            "84": [
                482
            ],
            "85": [
                483
            ],
            "86": [
                484
            ],
            "87": [
                485
            ],
            "88": [
                486
            ],
            "89": [
                487
            ],
            "90": [
                488
            ],
            "91": [
                489
            ],
            "92": [
                490
            ],
            "93": [
                491
            ],
            "161": [
                498
            ],
            "162": [
                499
            ],
            "163": [
                500
            ],
            "164": [
                501
            ],
            "165": [
                502
            ],
            "166": [
                503
            ],
            "167": [
                504
            ],
            "168": [
                505
            ],
            "169": [
                506
            ],
            "170": [
                507
            ],
            "171": [
                508
            ],
            "172": [
                509
            ],
            "173": [
                510
            ],
            "174": [
                511
            ],
            "175": [
                512
            ],
            "176": [
                513
            ],
            "177": [
                514
            ],
            "178": [
                515
            ],
            "179": [
                516
            ],
            "180": [
                517
            ],
            "181": [
                518
            ],
            "182": [
                519
            ],
            "183": [
                520
            ],
            "185": [
                521
            ],
            "186": [
                522
            ],
            "187": [
                523
            ],
            "188": [
                524
            ],
            "189": [
                525
            ],
            "190": [
                526
            ],
            "191": [
                527
            ],
            "192": [
                528
            ],
            "194": [
                370
            ],
            "196": [
                369
            ],
            "198": [
                371
            ],
            "200": [
                373
            ],
            "202": [
                375
            ],
            "204": [
                376
            ],
            "206": [
                374
            ],
            "208": [
                377
            ],
            "210": [
                378
            ],
            "212": [
                382
            ],
            "214": [
                379
            ],
            "216": [
                381
            ],
            "218": [
                384
            ],
            "220": [
                380
            ],
            "222": [
                386
            ],
            "224": [
                385
            ],
            "226": [
                388
            ],
            "228": [
                387
            ],
            "230": [
                390
            ],
            "232": [
                389
            ],
            "234": [
                394
            ],
            "236": [
                392
            ],
            "238": [
                391
            ],
            "240": [
                393
            ],
            "242": [
                474
            ],
            "244": [
                395
            ],
            "246": [
                396
            ],
            "249": [
                397
            ],
            "251": [
                399
            ],
            "253": [
                398
            ],
            "255": [
                400
            ],
            "257": [
                456
            ],
            "259": [
                401
            ],
            "261": [
                403
            ],
            "263": [
                402
            ],
            "266": [
                383
            ],
            "268": [
                406
            ],
            "270": [
                404
            ],
            "272": [
                405
            ],
            "274": [
                360
            ],
            "276": [
                408
            ],
            "278": [
                410
            ],
            "280": [
                409
            ],
            "282": [
                411
            ],
            "284": [
                413
            ],
            "286": [
                412
            ],
            "288": [
                459
            ],
            "290": [
                417
            ],
            "292": [
                416
            ],
            "294": [
                415
            ],
            "296": [
                423
            ],
            "298": [
                420
            ],
            "300": [
                418
            ],
            "302": [
                422
            ],
            "304": [
                419
            ],
            "306": [
                421
            ],
            "308": [
                424
            ],
            "310": [
                425
            ],
            "313": [
                426
            ],
            "315": [
                427
            ],
            "317": [
                461
            ],
            "320": [
                372
            ],
            "322": [
                407
            ],
            "324": [
                414
            ],
            "326": [
                575
            ]
        },
        "ss01": {
            "9": [
                560
            ]
        }
    },
    "gnames": {
        "0": ".notdef",
        "1": ".null",
        "2": "nonmarkingreturn",
        "3": "space",
        "4": "exclam",
        "5": "quotedbl",
        "6": "numbersign",
        "7": "dollar",
        "8": "percent",
        "9": "ampersand",
        "10": "quotesingle",
        "11": "parenleft",
        "12": "parenright",
        "13": "asterisk",
        "14": "plus",
        "15": "comma",
        "16": "hyphen",
        "17": "period",
        "18": "slash",
        "19": "zero",
        "20": "one",
        "21": "two",
        "22": "three",
        "23": "four",
        "24": "five",
        "25": "six",
        "26": "seven",
        "27": "eight",
        "28": "nine",
        "29": "colon",
        "30": "semicolon",
        "31": "less",
        "32": "equal",
        "33": "greater",
        "34": "question",
        "35": "at",
        "36": "A",
        "37": "B",
        "38": "C",
        "39": "D",
        "40": "E",
        "41": "F",
        "42": "G",
        "43": "H",
        "44": "I",
        "45": "J",
        "46": "K",
        "47": "L",
        "48": "M",
        "49": "N",
        "50": "O",
        "51": "P",
        "52": "Q",
        "53": "R",
        "54": "S",
        "55": "T",
        "56": "U",
        "57": "V",
        "58": "W",
        "59": "X",
        "60": "Y",
        "61": "Z",
        "62": "bracketleft",
        "63": "backslash",
        "64": "bracketright",
        "65": "asciicircum",
        "66": "underscore",
        "67": "grave",
        "68": "a",
        "69": "b",
        "70": "c",
        "71": "d",
        "72": "e",
        "73": "f",
        "74": "g",
        "75": "h",
        "76": "i",
        "77": "j",
        "78": "k",
        "79": "l",
        "80": "m",
        "81": "n",
        "82": "o",
        "83": "p",
        "84": "q",
        "85": "r",
        "86": "s",
        "87": "t",
        "88": "u",
        "89": "v",
        "90": "w",
        "91": "x",
        "92": "y",
        "93": "z",
        "94": "braceleft",
        "95": "bar",
        "96": "braceright",
        "97": "asciitilde",
        "98": "exclamdown",
        "99": "cent",
        "100": "sterling",
        "101": "currency",
        "102": "yen",
        "103": "brokenbar",
        "104": "section",
        "105": "dieresis",
        "106": "copyright",
        "107": "ordfeminine",
        "108": "guillemotleft",
        "109": "logicalnot",
        "110": "uni00AD",
        "111": "registered",
        "112": "macron",
        "113": "degree",
        "114": "plusminus",
        "115": "twosuperior",
        "116": "threesuperior",
        "117": "acute",
        "118": "mu",
        "119": "paragraph",
        "120": "periodcentered",
        "121": "cedilla",
        "122": "onesuperior",
        "123": "ordmasculine",
        "124": "guillemotright",
        "125": "onequarter",
        "126": "onehalf",
        "127": "threequarters",
        "128": "questiondown",
        "129": "Agrave",
        "130": "Aacute",
        "131": "Acircumflex",
        "132": "Atilde",
        "133": "Adieresis",
        "134": "Aring",
        "135": "AE",
        "136": "Ccedilla",
        "137": "Egrave",
        "138": "Eacute",
        "139": "Ecircumflex",
        "140": "Edieresis",
        "141": "Igrave",
        "142": "Iacute",
        "143": "Icircumflex",
        "144": "Idieresis",
        "145": "Eth",
        "146": "Ntilde",
        "147": "Ograve",
        "148": "Oacute",
        "149": "Ocircumflex",
        "150": "Otilde",
        "151": "Odieresis",
        "152": "multiply",
        "153": "Oslash",
        "154": "Ugrave",
        "155": "Uacute",
        "156": "Ucircumflex",
        "157": "Udieresis",
        "158": "Yacute",
        "159": "Thorn",
        "160": "germandbls",
        "161": "agrave",
        "162": "aacute",
        "163": "acircumflex",
        "164": "atilde",
        "165": "adieresis",
        "166": "aring",
        "167": "ae",
        "168": "ccedilla",
        "169": "egrave",
        "170": "eacute",
        "171": "ecircumflex",
        "172": "edieresis",
        "173": "igrave",
        "174": "iacute",
        "175": "icircumflex",
        "176": "idieresis",
        "177": "eth",
        "178": "ntilde",
        "179": "ograve",
        "180": "oacute",
        "181": "ocircumflex",
        "182": "otilde",
        "183": "odieresis",
        "184": "divide",
        "185": "oslash",
        "186": "ugrave",
        "187": "uacute",
        "188": "ucircumflex",
        "189": "udieresis",
        "190": "yacute",
        "191": "thorn",
        "192": "ydieresis",
        "193": "Amacron",
        "194": "amacron",
        "195": "Abreve",
        "196": "abreve",
        "197": "Aogonek",
        "198": "aogonek",
        "199": "Cacute",
        "200": "cacute",
        "201": "Ccircumflex",
        "202": "ccircumflex",
        "203": "Cdotaccent",
        "204": "cdotaccent",
        "205": "Ccaron",
        "206": "ccaron",
        "207": "Dcaron",
        "208": "dcaron",
        "209": "Dcroat",
        "210": "dcroat",
        "211": "Emacron",
        "212": "emacron",
        "213": "Ebreve",
        "214": "ebreve",
        "215": "Edotaccent",
        "216": "edotaccent",
        "217": "Eogonek",
        "218": "eogonek",
        "219": "Ecaron",
        "220": "ecaron",
        "221": "Gcircumflex",
        "222": "gcircumflex",
        "223": "Gbreve",
        "224": "gbreve",
        "225": "Gdotaccent",
        "226": "gdotaccent",
        "227": "Gcommaaccent",
        "228": "gcommaaccent",
        "229": "Hcircumflex",
        "230": "hcircumflex",
        "231": "Hbar",
        "232": "hbar",
        "233": "Itilde",
        "234": "itilde",
        "235": "Imacron",
        "236": "imacron",
        "237": "Ibreve",
        "238": "ibreve",
        "239": "Iogonek",
        "240": "iogonek",
        "241": "Idotaccent",
        "242": "dotlessi",
        "243": "Jcircumflex",
        "244": "jcircumflex",
        "245": "Kcommaaccent",
        "246": "kcommaaccent",
        "247": "kgreenlandic",
        "248": "Lacute",
        "249": "lacute",
        "250": "Lcommaaccent",
        "251": "lcommaaccent",
        "252": "Lcaron",
        "253": "lcaron",
        "254": "Ldot",
        "255": "ldot",
        "256": "Lslash",
        "257": "lslash",
        "258": "Nacute",
        "259": "nacute",
        "260": "Ncommaaccent",
        "261": "ncommaaccent",
        "262": "Ncaron",
        "263": "ncaron",
        "264": "napostrophe",
        "265": "Eng",
        "266": "eng",
        "267": "Omacron",
        "268": "omacron",
        "269": "Obreve",
        "270": "obreve",
        "271": "Ohungarumlaut",
        "272": "ohungarumlaut",
        "273": "OE",
        "274": "oe",
        "275": "Racute",
        "276": "racute",
        "277": "Rcommaaccent",
        "278": "rcommaaccent",
        "279": "Rcaron",
        "280": "rcaron",
        "281": "Sacute",
        "282": "sacute",
        "283": "Scircumflex",
        "284": "scircumflex",
        "285": "Scedilla",
        "286": "scedilla",
        "287": "Scaron",
        "288": "scaron",
        "289": "Tcommaaccent",
        "290": "tcommaaccent",
        "291": "Tcaron",
        "292": "tcaron",
        "293": "Tbar",
        "294": "tbar",
        "295": "Utilde",
        "296": "utilde",
        "297": "Umacron",
        "298": "umacron",
        "299": "Ubreve",
        "300": "ubreve",
        "301": "Uring",
        "302": "uring",
        "303": "Uhungarumlaut",
        "304": "uhungarumlaut",
        "305": "Uogonek",
        "306": "uogonek",
        "307": "Wcircumflex",
        "308": "wcircumflex",
        "309": "Ycircumflex",
        "310": "ycircumflex",
        "311": "Ydieresis",
        "312": "Zacute",
        "313": "zacute",
        "314": "Zdotaccent",
        "315": "zdotaccent",
        "316": "Zcaron",
        "317": "zcaron",
        "318": "longs",
        "319": "AEacute",
        "320": "aeacute",
        "321": "Oslashacute",
        "322": "oslashacute",
        "323": "Scommaaccent",
        "324": "scommaaccent",
        "325": "uni021A",
        "326": "uni021B",
        "327": "dotlessj",
        "328": "circumflex",
        "329": "caron",
        "330": "breve",
        "331": "dotaccent",
        "332": "ring",
        "333": "ogonek",
        "334": "tilde",
        "335": "hungarumlaut",
        "336": "endash",
        "337": "emdash",
        "338": "quoteleft",
        "339": "quoteright",
        "340": "quotesinglbase",
        "341": "quotedblleft",
        "342": "quotedblright",
        "343": "quotedblbase",
        "344": "dagger",
        "345": "daggerdbl",
        "346": "bullet",
        "347": "ellipsis",
        "348": "perthousand",
        "349": "guilsinglleft",
        "350": "guilsinglright",
        "351": "fraction",
        "352": "Euro",
        "353": "numero",
        "354": "trademark",
        "355": "minus",
        "356": "approxequal",
        "357": "notequal",
        "358": "lessequal",
        "359": "greaterequal",
        "360": "OE.smcp",
        "361": "dotaccent.cap",
        "362": "breve.cap",
        "363": "ogonek.cap",
        "364": "cedilla.cap",
        "365": "ring.cap",
        "366": "tilde.cap",
        "367": "circumflex.cap",
        "368": "at.cap",
        "369": "Abreve.smcp",
        "370": "Amacron.smcp",
        "371": "Aogonek.smcp",
        "372": "AEacute.smcp",
        "373": "Cacute.smcp",
        "374": "Ccaron.smcp",
        "375": "Ccircumflex.smcp",
        "376": "Cdotaccent.smcp",
        "377": "Dcaron.smcp",
        "378": "Dcroat.smcp",
        "379": "Ebreve.smcp",
        "380": "Ecaron.smcp",
        "381": "Edotaccent.smcp",
        "382": "Emacron.smcp",
        "383": "Eng.smcp",
        "384": "Eogonek.smcp",
        "385": "Gbreve.smcp",
        "386": "Gcircumflex.smcp",
        "387": "Gcommaaccent.smcp",
        "388": "Gdotaccent.smcp",
        "389": "Hbar.smcp",
        "390": "Hcircumflex.smcp",
        "391": "Ibreve.smcp",
        "392": "Imacron.smcp",
        "393": "Iogonek.smcp",
        "394": "Itilde.smcp",
        "395": "Jcircumflex.smcp",
        "396": "Kcommaaccent.smcp",
        "397": "Lacute.smcp",
        "398": "Lcaron.smcp",
        "399": "Lcommaaccent.smcp",
        "400": "Ldot.smcp",
        "401": "Nacute.smcp",
        "402": "Ncaron.smcp",
        "403": "Ncommaaccent.smcp",
        "404": "Obreve.smcp",
        "405": "Ohungarumlaut.smcp",
        "406": "Omacron.smcp",
        "407": "Oslashacute.smcp",
        "408": "Racute.smcp",
        "409": "Rcaron.smcp",
        "410": "Rcommaaccent.smcp",
        "411": "Sacute.smcp",
        "412": "Scedilla.smcp",
        "413": "Scircumflex.smcp",
        "414": "Scommaaccent.smcp",
        "415": "Tbar.smcp",
        "416": "Tcaron.smcp",
        "417": "Tcommaaccent.smcp",
        "418": "Ubreve.smcp",
        "419": "Uhungarumlaut.smcp",
        "420": "Umacron.smcp",
        "421": "Uogonek.smcp",
        "422": "Uring.smcp",
        "423": "Utilde.smcp",
        "424": "Wcircumflex.smcp",
        "425": "Ycircumflex.smcp",
        "426": "Zacute.smcp",
        "427": "Zdotaccent.smcp",
        "428": "Idotaccent.smcp",
        "429": "parenleft.cap",
        "430": "parenright.cap",
        "431": "bracketleft.cap",
        "432": "bracketright.cap",
        "433": "braceleft.cap",
        "434": "braceright.cap",
        "435": "exclamdown.cap",
        "436": "questiondown.cap",
        "437": "guillemotleft.cap",
        "438": "guillemotright.cap",
        "439": "guilsinglleft.cap",
        "440": "guilsinglright.cap",
        "441": "hyphen.cap",
        "442": "endash.cap",
        "443": "emdash.cap",
        "444": "periodcentered.cap",
        "445": "acute.cap",
        "446": "caron.cap",
        "447": "dieresis.cap",
        "448": "grave.cap",
        "449": "hungarumlaut.cap",
        "450": "macron.cap",
        "451": "breve.smcp",
        "452": "caron.smcp",
        "453": "circumflex.smcp",
        "454": "dotaccent.smcp",
        "455": "hungarumlaut.smcp",
        "456": "Lslash.smcp",
        "457": "ogonek.smcp",
        "458": "ring.smcp",
        "459": "Scaron.smcp",
        "460": "tilde.smcp",
        "461": "Zcaron.smcp",
        "462": "exclam.smcp",
        "463": "ampersand.smcp",
        "464": "question.smcp",
        "465": "grave.smcp",
        "466": "A.smcp",
        "467": "B.smcp",
        "468": "C.smcp",
        "469": "D.smcp",
        "470": "E.smcp",
        "471": "F.smcp",
        "472": "G.smcp",
        "473": "H.smcp",
        "474": "I.smcp",
        "475": "J.smcp",
        "476": "K.smcp",
        "477": "L.smcp",
        "478": "M.smcp",
        "479": "N.smcp",
        "480": "O.smcp",
        "481": "P.smcp",
        "482": "Q.smcp",
        "483": "R.smcp",
        "484": "S.smcp",
        "485": "T.smcp",
        "486": "U.smcp",
        "487": "V.smcp",
        "488": "W.smcp",
        "489": "X.smcp",
        "490": "Y.smcp",
        "491": "Z.smcp",
        "492": "exclamdown.smcp",
        "493": "dieresis.smcp",
        "494": "macron.smcp",
        "495": "acute.smcp",
        "496": "cedilla.smcp",
        "497": "questiondown.smcp",
        "498": "Agrave.smcp",
        "499": "Aacute.smcp",
        "500": "Acircumflex.smcp",
        "501": "Atilde.smcp",
        "502": "Adieresis.smcp",
        "503": "Aring.smcp",
        "504": "AE.smcp",
        "505": "Ccedilla.smcp",
        "506": "Egrave.smcp",
        "507": "Eacute.smcp",
        "508": "Ecircumflex.smcp",
        "509": "Edieresis.smcp",
        "510": "Igrave.smcp",
        "511": "Iacute.smcp",
        "512": "Icircumflex.smcp",
        "513": "Idieresis.smcp",
        "514": "Eth.smcp",
        "515": "Ntilde.smcp",
        "516": "Ograve.smcp",
        "517": "Oacute.smcp",
        "518": "Ocircumflex.smcp",
        "519": "Otilde.smcp",
        "520": "Odieresis.smcp",
        "521": "Oslash.smcp",
        "522": "Ugrave.smcp",
        "523": "Uacute.smcp",
        "524": "Ucircumflex.smcp",
        "525": "Udieresis.smcp",
        "526": "Yacute.smcp",
        "527": "Thorn.smcp",
        "528": "Ydieresis.smcp",
        "529": "f_f",
        "530": "fi",
        "531": "fl",
        "532": "f_f_i",
        "533": "f_f_l",
        "534": "s_t",
        "535": "zero.lf",
        "536": "one.lf",
        "537": "two.lf",
        "538": "three.lf",
        "539": "four.lf",
        "540": "five.lf",
        "541": "six.lf",
        "542": "seven.lf",
        "543": "eight.lf",
        "544": "nine.lf",
        "545": "a.alt",
        "546": "agrave.alt",
        "547": "aacute.alt",
        "548": "acircumflex.alt",
        "549": "atilde.alt",
        "550": "adieresis.alt",
        "551": "aring.alt",
        "552": "amacron.alt",
        "553": "abreve.alt",
        "554": "aogonek.alt",
        "555": "g.alt",
        "556": "gcircumflex.alt",
        "557": "gbreve.alt",
        "558": "gdotaccent.alt",
        "559": "uni0123.alt",
        "560": "ampersand.alt",
        "561": "slash.cap",
        "562": "backslash.cap",
        "563": "bar.cap",
        "564": "brokenbar.cap",
        "565": "bullet.cap",
        "566": "parenleft.smcp",
        "567": "parenright.smcp",
        "568": "braceleft.smcp",
        "569": "braceright.smcp",
        "570": "bracketleft.smcp",
        "571": "bracketright.smcp",
        "572": "bar.smcp",
        "573": "at.smcp",
        "574": "ampersand.alt.smcp",
        "575": "uni021A.smcp",
        "576": "T_h",
        "577": "c_t",
        "578": "f_f_b",
        "579": "f_f_h",
        "580": "f_f_j",
        "581": "f_f_k",
        "582": "f_f_t",
        "583": "f_b",
        "584": "f_h",
        "585": "f_j",
        "586": "f_k",
        "587": "f_t",
        "588": "t_t"
    }
}

},{}],5:[function(require,module,exports){
var component = require('./vendor/editable.js')
var Editable = component('yields-editable')
var data = require('../test/fixtures/klinic-slab.json')
var fontFeatureAbettings = require('../')
var findAndReplaceDOMText = require('./vendor/findAndReplaceDOMText')

var el = document.querySelector('.js-editable')
var ctrl = document.querySelector('.js-control')
var edit = new Editable(el)
var pattenrs = fontFeatureAbettings(data.gsub, data.gnames)

edit.enable()
edit.on('state', function (e) {
  var ft
  e.preventDefault()
  // console.log(e)
  ctrl.innerHTML = el.innerHTML

  for (ft in pattenrs) {
    if (pattenrs.hasOwnProperty(ft)) {
      var p = pattenrs[ft]
      // p = p.split(',')
      // p.shift()

      // ffk, ffi, and ffl are hard-coded as an example of where
      // the RegExp should work better, from longest phrase
      // to shortest. Array flattening would need to
      // take this into account, too.
      // var regArr = '(ffi)|(ffl)|(ffk)|(' + p.join(')|(') + ')'
      var regArr = '(' + p.join(')|(') + ')'

      var reg = new RegExp(regArr, 'g')

      findAndReplaceDOMText(ctrl, {
        find: reg,
        wrap: 'mark',
        replace: function (portion, match) {
          var e = document.createElement('mark')
          e.setAttribute('data-content', portion.text)
          e.setAttribute('data-feat', ft)
          e.setAttribute('data-highlighted', true)
          e.classList.add('is-feat', 'is-' + ft)
          e.innerHTML = portion.text
          return e
        }
      })

    }
  }

})

},{"../":3,"../test/fixtures/klinic-slab.json":4,"./vendor/editable.js":1,"./vendor/findAndReplaceDOMText":2}]},{},[5])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy92ZW5kb3IvZWRpdGFibGUuanMiLCJleGFtcGxlcy92ZW5kb3IvZmluZEFuZFJlcGxhY2VET01UZXh0LmpzIiwiaW5kZXguanMiLCJ0ZXN0L2ZpeHR1cmVzL2tsaW5pYy1zbGFiLmpzb24iLCJleGFtcGxlcy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM3Z0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyMEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuLyoqXG4qIFJlcXVpcmUgdGhlIGdpdmVuIHBhdGguXG4qXG4qIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4qIEByZXR1cm4ge09iamVjdH0gZXhwb3J0c1xuKiBAYXBpIHB1YmxpY1xuKi9cblxuZnVuY3Rpb24gX3JlcXVpcmUocGF0aCwgcGFyZW50LCBvcmlnKSB7XG4gIHZhciByZXNvbHZlZCA9IF9yZXF1aXJlLnJlc29sdmUocGF0aCk7XG5cbiAgLy8gbG9va3VwIGZhaWxlZFxuICBpZiAobnVsbCA9PSByZXNvbHZlZCkge1xuICAgIG9yaWcgPSBvcmlnIHx8IHBhdGg7XG4gICAgcGFyZW50ID0gcGFyZW50IHx8ICdyb290JztcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdGYWlsZWQgdG8gcmVxdWlyZSBcIicgKyBvcmlnICsgJ1wiIGZyb20gXCInICsgcGFyZW50ICsgJ1wiJyk7XG4gICAgZXJyLnBhdGggPSBvcmlnO1xuICAgIGVyci5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgZXJyLl9yZXF1aXJlID0gdHJ1ZTtcbiAgICB0aHJvdyBlcnI7XG4gIH1cblxuICB2YXIgbW9kdWxlID0gX3JlcXVpcmUubW9kdWxlc1tyZXNvbHZlZF07XG5cbiAgLy8gcGVyZm9ybSByZWFsIHJlcXVpcmUoKVxuICAvLyBieSBpbnZva2luZyB0aGUgbW9kdWxlJ3NcbiAgLy8gcmVnaXN0ZXJlZCBmdW5jdGlvblxuICBpZiAoIW1vZHVsZS5fcmVzb2x2aW5nICYmICFtb2R1bGUuZXhwb3J0cykge1xuICAgIHZhciBtb2QgPSB7fTtcbiAgICBtb2QuZXhwb3J0cyA9IHt9O1xuICAgIG1vZC5jbGllbnQgPSBtb2QuY29tcG9uZW50ID0gdHJ1ZTtcbiAgICBtb2R1bGUuX3Jlc29sdmluZyA9IHRydWU7XG4gICAgbW9kdWxlLmNhbGwodGhpcywgbW9kLmV4cG9ydHMsIF9yZXF1aXJlLnJlbGF0aXZlKHJlc29sdmVkKSwgbW9kKTtcbiAgICBkZWxldGUgbW9kdWxlLl9yZXNvbHZpbmc7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBtb2QuZXhwb3J0cztcbiAgfVxuXG4gIHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLyoqXG4qIFJlZ2lzdGVyZWQgbW9kdWxlcy5cbiovXG5cbl9yZXF1aXJlLm1vZHVsZXMgPSB7fTtcblxuLyoqXG4qIFJlZ2lzdGVyZWQgYWxpYXNlcy5cbiovXG5cbl9yZXF1aXJlLmFsaWFzZXMgPSB7fTtcblxuLyoqXG4qIFJlc29sdmUgYHBhdGhgLlxuKlxuKiBMb29rdXA6XG4qXG4qICAgLSBQQVRIL2luZGV4LmpzXG4qICAgLSBQQVRILmpzXG4qICAgLSBQQVRIXG4qXG4qIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4qIEByZXR1cm4ge1N0cmluZ30gcGF0aCBvciBudWxsXG4qIEBhcGkgcHJpdmF0ZVxuKi9cblxuX3JlcXVpcmUucmVzb2x2ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgaWYgKHBhdGguY2hhckF0KDApID09PSAnLycpIHBhdGggPSBwYXRoLnNsaWNlKDEpO1xuXG4gIHZhciBwYXRocyA9IFtcbiAgcGF0aCxcbiAgcGF0aCArICcuanMnLFxuICBwYXRoICsgJy5qc29uJyxcbiAgcGF0aCArICcvaW5kZXguanMnLFxuICBwYXRoICsgJy9pbmRleC5qc29uJ1xuICBdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcGF0aCA9IHBhdGhzW2ldO1xuICAgIGlmIChfcmVxdWlyZS5tb2R1bGVzLmhhc093blByb3BlcnR5KHBhdGgpKSByZXR1cm4gcGF0aDtcbiAgICBpZiAoX3JlcXVpcmUuYWxpYXNlcy5oYXNPd25Qcm9wZXJ0eShwYXRoKSkgcmV0dXJuIF9yZXF1aXJlLmFsaWFzZXNbcGF0aF07XG4gIH1cbn07XG5cbi8qKlxuKiBOb3JtYWxpemUgYHBhdGhgIHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50IHBhdGguXG4qXG4qIEBwYXJhbSB7U3RyaW5nfSBjdXJyXG4qIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4qIEByZXR1cm4ge1N0cmluZ31cbiogQGFwaSBwcml2YXRlXG4qL1xuXG5fcmVxdWlyZS5ub3JtYWxpemUgPSBmdW5jdGlvbihjdXJyLCBwYXRoKSB7XG4gIHZhciBzZWdzID0gW107XG5cbiAgaWYgKCcuJyAhPSBwYXRoLmNoYXJBdCgwKSkgcmV0dXJuIHBhdGg7XG5cbiAgY3VyciA9IGN1cnIuc3BsaXQoJy8nKTtcbiAgcGF0aCA9IHBhdGguc3BsaXQoJy8nKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoJy4uJyA9PSBwYXRoW2ldKSB7XG4gICAgICBjdXJyLnBvcCgpO1xuICAgIH0gZWxzZSBpZiAoJy4nICE9IHBhdGhbaV0gJiYgJycgIT0gcGF0aFtpXSkge1xuICAgICAgc2Vncy5wdXNoKHBhdGhbaV0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjdXJyLmNvbmNhdChzZWdzKS5qb2luKCcvJyk7XG59O1xuXG4vKipcbiogUmVnaXN0ZXIgbW9kdWxlIGF0IGBwYXRoYCB3aXRoIGNhbGxiYWNrIGBkZWZpbml0aW9uYC5cbipcbiogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiogQHBhcmFtIHtGdW5jdGlvbn0gZGVmaW5pdGlvblxuKiBAYXBpIHByaXZhdGVcbiovXG5cbl9yZXF1aXJlLnJlZ2lzdGVyID0gZnVuY3Rpb24ocGF0aCwgZGVmaW5pdGlvbikge1xuICBfcmVxdWlyZS5tb2R1bGVzW3BhdGhdID0gZGVmaW5pdGlvbjtcbn07XG5cbi8qKlxuKiBBbGlhcyBhIG1vZHVsZSBkZWZpbml0aW9uLlxuKlxuKiBAcGFyYW0ge1N0cmluZ30gZnJvbVxuKiBAcGFyYW0ge1N0cmluZ30gdG9cbiogQGFwaSBwcml2YXRlXG4qL1xuXG5fcmVxdWlyZS5hbGlhcyA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIGlmICghX3JlcXVpcmUubW9kdWxlcy5oYXNPd25Qcm9wZXJ0eShmcm9tKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGFsaWFzIFwiJyArIGZyb20gKyAnXCIsIGl0IGRvZXMgbm90IGV4aXN0Jyk7XG4gIH1cbiAgX3JlcXVpcmUuYWxpYXNlc1t0b10gPSBmcm9tO1xufTtcblxuLyoqXG4qIFJldHVybiBhIHJlcXVpcmUgZnVuY3Rpb24gcmVsYXRpdmUgdG8gdGhlIGBwYXJlbnRgIHBhdGguXG4qXG4qIEBwYXJhbSB7U3RyaW5nfSBwYXJlbnRcbiogQHJldHVybiB7RnVuY3Rpb259XG4qIEBhcGkgcHJpdmF0ZVxuKi9cblxuX3JlcXVpcmUucmVsYXRpdmUgPSBmdW5jdGlvbihwYXJlbnQpIHtcbiAgdmFyIHAgPSBfcmVxdWlyZS5ub3JtYWxpemUocGFyZW50LCAnLi4nKTtcblxuICAvKipcbiAgKiBsYXN0SW5kZXhPZiBoZWxwZXIuXG4gICovXG5cbiAgZnVuY3Rpb24gbGFzdEluZGV4T2YoYXJyLCBvYmopIHtcbiAgICB2YXIgaSA9IGFyci5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWYgKGFycltpXSA9PT0gb2JqKSByZXR1cm4gaTtcbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgLyoqXG4gICogVGhlIHJlbGF0aXZlIHJlcXVpcmUoKSBpdHNlbGYuXG4gICovXG5cbiAgZnVuY3Rpb24gbG9jYWxSZXF1aXJlKHBhdGgpIHtcbiAgICB2YXIgcmVzb2x2ZWQgPSBsb2NhbFJlcXVpcmUucmVzb2x2ZShwYXRoKTtcbiAgICByZXR1cm4gX3JlcXVpcmUocmVzb2x2ZWQsIHBhcmVudCwgcGF0aCk7XG4gIH1cblxuICAvKipcbiAgKiBSZXNvbHZlIHJlbGF0aXZlIHRvIHRoZSBwYXJlbnQuXG4gICovXG5cbiAgbG9jYWxSZXF1aXJlLnJlc29sdmUgPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgdmFyIGMgPSBwYXRoLmNoYXJBdCgwKTtcbiAgICBpZiAoJy8nID09IGMpIHJldHVybiBwYXRoLnNsaWNlKDEpO1xuICAgIGlmICgnLicgPT0gYykgcmV0dXJuIF9yZXF1aXJlLm5vcm1hbGl6ZShwLCBwYXRoKTtcblxuICAgIC8vIHJlc29sdmUgZGVwcyBieSByZXR1cm5pbmdcbiAgICAvLyB0aGUgZGVwIGluIHRoZSBuZWFyZXN0IFwiZGVwc1wiXG4gICAgLy8gZGlyZWN0b3J5XG4gICAgdmFyIHNlZ3MgPSBwYXJlbnQuc3BsaXQoJy8nKTtcbiAgICB2YXIgaSA9IGxhc3RJbmRleE9mKHNlZ3MsICdkZXBzJykgKyAxO1xuICAgIGlmICghaSkgaSA9IDA7XG4gICAgcGF0aCA9IHNlZ3Muc2xpY2UoMCwgaSArIDEpLmpvaW4oJy8nKSArICcvZGVwcy8nICsgcGF0aDtcbiAgICByZXR1cm4gcGF0aDtcbiAgfTtcblxuICAvKipcbiAgKiBDaGVjayBpZiBtb2R1bGUgaXMgZGVmaW5lZCBhdCBgcGF0aGAuXG4gICovXG5cbiAgbG9jYWxSZXF1aXJlLmV4aXN0cyA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICByZXR1cm4gX3JlcXVpcmUubW9kdWxlcy5oYXNPd25Qcm9wZXJ0eShsb2NhbFJlcXVpcmUucmVzb2x2ZShwYXRoKSk7XG4gIH07XG5cbiAgcmV0dXJuIGxvY2FsUmVxdWlyZTtcbn07XG5fcmVxdWlyZS5yZWdpc3RlcihcImNvbXBvbmVudC1oaXN0b3J5L2luZGV4LmpzXCIsIGZ1bmN0aW9uKGV4cG9ydHMsIF9yZXF1aXJlLCBtb2R1bGUpe1xuXG4gIC8qKlxuICAqIEV4cG9zZSBgSGlzdG9yeWAuXG4gICovXG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBIaXN0b3J5O1xuXG4gIC8qKlxuICAqIEluaXRpYWxpemUgYSBgSGlzdG9yeWAgd2l0aCB0aGUgZ2l2ZW4gYHZhbHNgLlxuICAqXG4gICogQHBhcmFtIHtBcnJheX0gdmFsc1xuICAqIEBhcGkgcHVibGljXG4gICovXG5cbiAgZnVuY3Rpb24gSGlzdG9yeSh2YWxzKSB7XG4gICAgdGhpcy52YWxzID0gdmFscyB8fCBbXTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgdGhpcy5tYXgoMTAwMCk7XG4gIH1cblxuICAvKipcbiAgKiBDYXAgdGhlIGVudHJpZXMuXG4gICpcbiAgKiBAYXBpIHByaXZhdGVcbiAgKi9cblxuICBIaXN0b3J5LnByb3RvdHlwZS5jYXAgPSBmdW5jdGlvbigpe1xuICAgIHZhciBtYXggPSB0aGlzLl9tYXg7XG4gICAgdmFyIGxlbiA9IHRoaXMudmFscy5sZW5ndGg7XG4gICAgdmFyIHJlbW92ZSA9IGxlbiAtIG1heDtcbiAgICBpZiAocmVtb3ZlIDw9IDApIHJldHVybjtcbiAgICB3aGlsZSAocmVtb3ZlLS0pIHRoaXMudmFscy5zaGlmdCgpO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfTtcblxuICAvKipcbiAgKiBTZXQgdGhlIG1heGltdW0gbnVtYmVyIG9mIGVudHJpZXMgdG8gYG5gLlxuICAqXG4gICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAgKiBAcmV0dXJuIHtIaXN0b3J5fVxuICAqIEBhcGkgcHVibGljXG4gICovXG5cbiAgSGlzdG9yeS5wcm90b3R5cGUubWF4ID0gZnVuY3Rpb24obil7XG4gICAgdGhpcy5fbWF4ID0gbjtcbiAgICB0aGlzLmNhcCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAqIEFkZCBhIGB2YWxgLlxuICAqXG4gICogQHBhcmFtIHtPYmplY3R9IHZhbFxuICAqIEByZXR1cm4ge0hpc3Rvcnl9XG4gICogQGFwaSBwdWJsaWNcbiAgKi9cblxuICBIaXN0b3J5LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih2YWwpe1xuICAgIHRoaXMuaSA9IHRoaXMudmFscy5wdXNoKHZhbCk7XG4gICAgdGhpcy5jYXAoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgKiBDeWNsZSBiYWNrd2FyZHMgdGhyb3VnaCBoaXN0b3J5LlxuICAqXG4gICogQHJldHVybiB7T2JqZWN0fVxuICAqIEBhcGkgcHVibGljXG4gICovXG5cbiAgSGlzdG9yeS5wcm90b3R5cGUucHJldiA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKHRoaXMuaSA8PSAwKSByZXR1cm47XG4gICAgcmV0dXJuIHRoaXMudmFsc1stLXRoaXMuaV07XG4gIH07XG5cbiAgLyoqXG4gICogQ3ljbGUgZm9yd2FyZCB0aHJvdWdoIGhpc3RvcnkuXG4gICpcbiAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICogQGFwaSBwdWJsaWNcbiAgKi9cblxuICBIaXN0b3J5LnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgbGVuID0gdGhpcy52YWxzLmxlbmd0aDtcbiAgICBpZiAodGhpcy5pID49IGxlbikgcmV0dXJuO1xuICAgIHJldHVybiB0aGlzLnZhbHNbKyt0aGlzLmldO1xuICB9O1xuXG4gIC8qKlxuICAqIFJlc2V0IHRoZSBoaXN0b3J5IGluZGV4LlxuICAqXG4gICogQHJldHVybiB7SGlzdG9yeX1cbiAgKiBAYXBpIHB1YmxpY1xuICAqL1xuXG4gIEhpc3RvcnkucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmkgPSB0aGlzLnZhbHMubGVuZ3RoO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG59KTtcbl9yZXF1aXJlLnJlZ2lzdGVyKFwiY29tcG9uZW50LWVtaXR0ZXIvaW5kZXguanNcIiwgZnVuY3Rpb24oZXhwb3J0cywgX3JlcXVpcmUsIG1vZHVsZSl7XG5cbiAgLyoqXG4gICogRXhwb3NlIGBFbWl0dGVyYC5cbiAgKi9cblxuICBtb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG5cbiAgLyoqXG4gICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gICpcbiAgKiBAYXBpIHB1YmxpY1xuICAqL1xuXG4gIGZ1bmN0aW9uIEVtaXR0ZXIob2JqKSB7XG4gICAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG4gIH07XG5cbiAgLyoqXG4gICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAgKlxuICAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICogQGFwaSBwcml2YXRlXG4gICovXG5cbiAgZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gICAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICAvKipcbiAgKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxuICAqXG4gICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgKiBAcmV0dXJuIHtFbWl0dGVyfVxuICAqIEBhcGkgcHVibGljXG4gICovXG5cbiAgRW1pdHRlci5wcm90b3R5cGUub24gPVxuICBFbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gICAgKHRoaXMuX2NhbGxiYWNrc1tldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcbiAgKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICAqXG4gICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgKiBAcmV0dXJuIHtFbWl0dGVyfVxuICAqIEBhcGkgcHVibGljXG4gICovXG5cbiAgRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAgIGZ1bmN0aW9uIG9uKCkge1xuICAgICAgc2VsZi5vZmYoZXZlbnQsIG9uKTtcbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgb24uZm4gPSBmbjtcbiAgICB0aGlzLm9uKGV2ZW50LCBvbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAgKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAgKlxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICogQHJldHVybiB7RW1pdHRlcn1cbiAgKiBAYXBpIHB1YmxpY1xuICAqL1xuXG4gIEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG4gIEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbiAgRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbiAgRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gICAgLy8gYWxsXG4gICAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBzcGVjaWZpYyBldmVudFxuICAgIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICAgIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAgIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gICAgdmFyIGNiO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAgKlxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gICovXG5cbiAgRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAsIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG5cbiAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICAqXG4gICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICogQHJldHVybiB7QXJyYXl9XG4gICogQGFwaSBwdWJsaWNcbiAgKi9cblxuICBFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAgIHJldHVybiB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdO1xuICB9O1xuXG4gIC8qKlxuICAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAgKlxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICogQGFwaSBwdWJsaWNcbiAgKi9cblxuICBFbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gICAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG4gIH07XG5cbn0pO1xuX3JlcXVpcmUucmVnaXN0ZXIoXCJjb21wb25lbnQtZXZlbnQvaW5kZXguanNcIiwgZnVuY3Rpb24oZXhwb3J0cywgX3JlcXVpcmUsIG1vZHVsZSl7XG4gIHZhciBiaW5kID0gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAnYXR0YWNoRXZlbnQnLFxuICB1bmJpbmQgPSB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciA/ICdyZW1vdmVFdmVudExpc3RlbmVyJyA6ICdkZXRhY2hFdmVudCcsXG4gIHByZWZpeCA9IGJpbmQgIT09ICdhZGRFdmVudExpc3RlbmVyJyA/ICdvbicgOiAnJztcblxuICAvKipcbiAgKiBCaW5kIGBlbGAgZXZlbnQgYHR5cGVgIHRvIGBmbmAuXG4gICpcbiAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAqIEBhcGkgcHVibGljXG4gICovXG5cbiAgZXhwb3J0cy5iaW5kID0gZnVuY3Rpb24oZWwsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgICBlbFtiaW5kXShwcmVmaXggKyB0eXBlLCBmbiwgY2FwdHVyZSB8fCBmYWxzZSk7XG4gICAgcmV0dXJuIGZuO1xuICB9O1xuXG4gIC8qKlxuICAqIFVuYmluZCBgZWxgIGV2ZW50IGB0eXBlYCdzIGNhbGxiYWNrIGBmbmAuXG4gICpcbiAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAqIEBhcGkgcHVibGljXG4gICovXG5cbiAgZXhwb3J0cy51bmJpbmQgPSBmdW5jdGlvbihlbCwgdHlwZSwgZm4sIGNhcHR1cmUpe1xuICAgIGVsW3VuYmluZF0ocHJlZml4ICsgdHlwZSwgZm4sIGNhcHR1cmUgfHwgZmFsc2UpO1xuICAgIHJldHVybiBmbjtcbiAgfTtcbn0pO1xuX3JlcXVpcmUucmVnaXN0ZXIoXCJjb21wb25lbnQtcXVlcnkvaW5kZXguanNcIiwgZnVuY3Rpb24oZXhwb3J0cywgX3JlcXVpcmUsIG1vZHVsZSl7XG4gIGZ1bmN0aW9uIG9uZShzZWxlY3RvciwgZWwpIHtcbiAgICByZXR1cm4gZWwucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gIH1cblxuICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWxlY3RvciwgZWwpe1xuICAgIGVsID0gZWwgfHwgZG9jdW1lbnQ7XG4gICAgcmV0dXJuIG9uZShzZWxlY3RvciwgZWwpO1xuICB9O1xuXG4gIGV4cG9ydHMuYWxsID0gZnVuY3Rpb24oc2VsZWN0b3IsIGVsKXtcbiAgICBlbCA9IGVsIHx8IGRvY3VtZW50O1xuICAgIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgfTtcblxuICBleHBvcnRzLmVuZ2luZSA9IGZ1bmN0aW9uKG9iail7XG4gICAgaWYgKCFvYmoub25lKSB0aHJvdyBuZXcgRXJyb3IoJy5vbmUgY2FsbGJhY2sgcmVxdWlyZWQnKTtcbiAgICBpZiAoIW9iai5hbGwpIHRocm93IG5ldyBFcnJvcignLmFsbCBjYWxsYmFjayByZXF1aXJlZCcpO1xuICAgIG9uZSA9IG9iai5vbmU7XG4gICAgZXhwb3J0cy5hbGwgPSBvYmouYWxsO1xuICAgIHJldHVybiBleHBvcnRzO1xuICB9O1xuXG59KTtcbl9yZXF1aXJlLnJlZ2lzdGVyKFwiY29tcG9uZW50LW1hdGNoZXMtc2VsZWN0b3IvaW5kZXguanNcIiwgZnVuY3Rpb24oZXhwb3J0cywgX3JlcXVpcmUsIG1vZHVsZSl7XG4gIC8qKlxuICAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gICovXG5cbiAgdmFyIHF1ZXJ5ID0gX3JlcXVpcmUoJ3F1ZXJ5Jyk7XG5cbiAgLyoqXG4gICogRWxlbWVudCBwcm90b3R5cGUuXG4gICovXG5cbiAgdmFyIHByb3RvID0gRWxlbWVudC5wcm90b3R5cGU7XG5cbiAgLyoqXG4gICogVmVuZG9yIGZ1bmN0aW9uLlxuICAqL1xuXG4gIHZhciB2ZW5kb3IgPSBwcm90by5tYXRjaGVzXG4gIHx8IHByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvclxuICB8fCBwcm90by5tb3pNYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ubXNNYXRjaGVzU2VsZWN0b3JcbiAgfHwgcHJvdG8ub01hdGNoZXNTZWxlY3RvcjtcblxuICAvKipcbiAgKiBFeHBvc2UgYG1hdGNoKClgLlxuICAqL1xuXG4gIG1vZHVsZS5leHBvcnRzID0gbWF0Y2g7XG5cbiAgLyoqXG4gICogTWF0Y2ggYGVsYCB0byBgc2VsZWN0b3JgLlxuICAqXG4gICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICogQGFwaSBwdWJsaWNcbiAgKi9cblxuICBmdW5jdGlvbiBtYXRjaChlbCwgc2VsZWN0b3IpIHtcbiAgICBpZiAoIWVsIHx8IGVsLm5vZGVUeXBlICE9PSAxKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHZlbmRvcikgcmV0dXJuIHZlbmRvci5jYWxsKGVsLCBzZWxlY3Rvcik7XG4gICAgdmFyIG5vZGVzID0gcXVlcnkuYWxsKHNlbGVjdG9yLCBlbC5wYXJlbnROb2RlKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAobm9kZXNbaV0gPT0gZWwpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxufSk7XG5fcmVxdWlyZS5yZWdpc3RlcihcImNvbXBvbmVudC1jbG9zZXN0L2luZGV4LmpzXCIsIGZ1bmN0aW9uKGV4cG9ydHMsIF9yZXF1aXJlLCBtb2R1bGUpe1xuICB2YXIgbWF0Y2hlcyA9IF9yZXF1aXJlKCdtYXRjaGVzLXNlbGVjdG9yJylcblxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbGVtZW50LCBzZWxlY3RvciwgY2hlY2tZb1NlbGYsIHJvb3QpIHtcbiAgICBlbGVtZW50ID0gY2hlY2tZb1NlbGYgPyB7cGFyZW50Tm9kZTogZWxlbWVudH0gOiBlbGVtZW50XG5cbiAgICByb290ID0gcm9vdCB8fCBkb2N1bWVudFxuXG4gICAgLy8gTWFrZSBzdXJlIGBlbGVtZW50ICE9PSBkb2N1bWVudGAgYW5kIGBlbGVtZW50ICE9IG51bGxgXG4gICAgLy8gb3RoZXJ3aXNlIHdlIGdldCBhbiBpbGxlZ2FsIGludm9jYXRpb25cbiAgICB3aGlsZSAoKGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGUpICYmIGVsZW1lbnQgIT09IGRvY3VtZW50KSB7XG4gICAgICBpZiAobWF0Y2hlcyhlbGVtZW50LCBzZWxlY3RvcikpXG4gICAgICAgIHJldHVybiBlbGVtZW50XG4gICAgICAgIC8vIEFmdGVyIGBtYXRjaGVzYCBvbiB0aGUgZWRnZSBjYXNlIHRoYXRcbiAgICAgICAgLy8gdGhlIHNlbGVjdG9yIG1hdGNoZXMgdGhlIHJvb3RcbiAgICAgICAgLy8gKHdoZW4gdGhlIHJvb3QgaXMgbm90IHRoZSBkb2N1bWVudClcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IHJvb3QpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH0pO1xuICAgIF9yZXF1aXJlLnJlZ2lzdGVyKFwiY29tcG9uZW50LWRlbGVnYXRlL2luZGV4LmpzXCIsIGZ1bmN0aW9uKGV4cG9ydHMsIF9yZXF1aXJlLCBtb2R1bGUpe1xuICAgICAgLyoqXG4gICAgICAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gICAgICAqL1xuXG4gICAgICB2YXIgY2xvc2VzdCA9IF9yZXF1aXJlKCdjbG9zZXN0JylcbiAgICAgICwgZXZlbnQgPSBfcmVxdWlyZSgnZXZlbnQnKTtcblxuICAgICAgLyoqXG4gICAgICAqIERlbGVnYXRlIGV2ZW50IGB0eXBlYCB0byBgc2VsZWN0b3JgXG4gICAgICAqIGFuZCBpbnZva2UgYGZuKGUpYC4gQSBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgKiBpcyByZXR1cm5lZCB3aGljaCBtYXkgYmUgcGFzc2VkIHRvIGAudW5iaW5kKClgLlxuICAgICAgKlxuICAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvclxuICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmVcbiAgICAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAgICAqIEBhcGkgcHVibGljXG4gICAgICAqL1xuXG4gICAgICBleHBvcnRzLmJpbmQgPSBmdW5jdGlvbihlbCwgc2VsZWN0b3IsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgICAgICAgcmV0dXJuIGV2ZW50LmJpbmQoZWwsIHR5cGUsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gICAgICAgICAgZS5kZWxlZ2F0ZVRhcmdldCA9IGNsb3Nlc3QodGFyZ2V0LCBzZWxlY3RvciwgdHJ1ZSwgZWwpO1xuICAgICAgICAgIGlmIChlLmRlbGVnYXRlVGFyZ2V0KSBmbi5jYWxsKGVsLCBlKTtcbiAgICAgICAgfSwgY2FwdHVyZSk7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICogVW5iaW5kIGV2ZW50IGB0eXBlYCdzIGNhbGxiYWNrIGBmbmAuXG4gICAgICAqXG4gICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAgICAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICAgICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gICAgICAqIEBhcGkgcHVibGljXG4gICAgICAqL1xuXG4gICAgICBleHBvcnRzLnVuYmluZCA9IGZ1bmN0aW9uKGVsLCB0eXBlLCBmbiwgY2FwdHVyZSl7XG4gICAgICAgIGV2ZW50LnVuYmluZChlbCwgdHlwZSwgZm4sIGNhcHR1cmUpO1xuICAgICAgfTtcblxuICAgIH0pO1xuICAgIF9yZXF1aXJlLnJlZ2lzdGVyKFwiY29tcG9uZW50LWV2ZW50cy9pbmRleC5qc1wiLCBmdW5jdGlvbihleHBvcnRzLCBfcmVxdWlyZSwgbW9kdWxlKXtcblxuICAgICAgLyoqXG4gICAgICAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gICAgICAqL1xuXG4gICAgICB2YXIgZXZlbnRzID0gX3JlcXVpcmUoJ2V2ZW50Jyk7XG4gICAgICB2YXIgZGVsZWdhdGUgPSBfcmVxdWlyZSgnZGVsZWdhdGUnKTtcblxuICAgICAgLyoqXG4gICAgICAqIEV4cG9zZSBgRXZlbnRzYC5cbiAgICAgICovXG5cbiAgICAgIG1vZHVsZS5leHBvcnRzID0gRXZlbnRzO1xuXG4gICAgICAvKipcbiAgICAgICogSW5pdGlhbGl6ZSBhbiBgRXZlbnRzYCB3aXRoIHRoZSBnaXZlblxuICAgICAgKiBgZWxgIG9iamVjdCB3aGljaCBldmVudHMgd2lsbCBiZSBib3VuZCB0byxcbiAgICAgICogYW5kIHRoZSBgb2JqYCB3aGljaCB3aWxsIHJlY2VpdmUgbWV0aG9kIGNhbGxzLlxuICAgICAgKlxuICAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxcbiAgICAgICogQHBhcmFtIHtPYmplY3R9IG9ialxuICAgICAgKiBAYXBpIHB1YmxpY1xuICAgICAgKi9cblxuICAgICAgZnVuY3Rpb24gRXZlbnRzKGVsLCBvYmopIHtcbiAgICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEV2ZW50cykpIHJldHVybiBuZXcgRXZlbnRzKGVsLCBvYmopO1xuICAgICAgICBpZiAoIWVsKSB0aHJvdyBuZXcgRXJyb3IoJ2VsZW1lbnQgcmVxdWlyZWQnKTtcbiAgICAgICAgaWYgKCFvYmopIHRocm93IG5ldyBFcnJvcignb2JqZWN0IHJlcXVpcmVkJyk7XG4gICAgICAgIHRoaXMuZWwgPSBlbDtcbiAgICAgICAgdGhpcy5vYmogPSBvYmo7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICogU3Vic2NyaXB0aW9uIGhlbHBlci5cbiAgICAgICovXG5cbiAgICAgIEV2ZW50cy5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24oZXZlbnQsIG1ldGhvZCwgY2Ipe1xuICAgICAgICB0aGlzLl9ldmVudHNbZXZlbnRdID0gdGhpcy5fZXZlbnRzW2V2ZW50XSB8fCB7fTtcbiAgICAgICAgdGhpcy5fZXZlbnRzW2V2ZW50XVttZXRob2RdID0gY2I7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICogQmluZCB0byBgZXZlbnRgIHdpdGggb3B0aW9uYWwgYG1ldGhvZGAgbmFtZS5cbiAgICAgICogV2hlbiBgbWV0aG9kYCBpcyB1bmRlZmluZWQgaXQgYmVjb21lcyBgZXZlbnRgXG4gICAgICAqIHdpdGggdGhlIFwib25cIiBwcmVmaXguXG4gICAgICAqXG4gICAgICAqIEV4YW1wbGVzOlxuICAgICAgKlxuICAgICAgKiAgRGlyZWN0IGV2ZW50IGhhbmRsaW5nOlxuICAgICAgKlxuICAgICAgKiAgICBldmVudHMuYmluZCgnY2xpY2snKSAvLyBpbXBsaWVzIFwib25jbGlja1wiXG4gICAgICAqICAgIGV2ZW50cy5iaW5kKCdjbGljaycsICdyZW1vdmUnKVxuICAgICAgKiAgICBldmVudHMuYmluZCgnY2xpY2snLCAnc29ydCcsICdhc2MnKVxuICAgICAgKlxuICAgICAgKiAgRGVsZWdhdGVkIGV2ZW50IGhhbmRsaW5nOlxuICAgICAgKlxuICAgICAgKiAgICBldmVudHMuYmluZCgnY2xpY2sgbGkgPiBhJylcbiAgICAgICogICAgZXZlbnRzLmJpbmQoJ2NsaWNrIGxpID4gYScsICdyZW1vdmUnKVxuICAgICAgKiAgICBldmVudHMuYmluZCgnY2xpY2sgYS5zb3J0LWFzY2VuZGluZycsICdzb3J0JywgJ2FzYycpXG4gICAgICAqICAgIGV2ZW50cy5iaW5kKCdjbGljayBhLnNvcnQtZGVzY2VuZGluZycsICdzb3J0JywgJ2Rlc2MnKVxuICAgICAgKlxuICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgICAgICogQHBhcmFtIHtTdHJpbmd8ZnVuY3Rpb259IFttZXRob2RdXG4gICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAgKiBAYXBpIHB1YmxpY1xuICAgICAgKi9cblxuICAgICAgRXZlbnRzLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24oZXZlbnQsIG1ldGhvZCl7XG4gICAgICAgIHZhciBlID0gcGFyc2UoZXZlbnQpO1xuICAgICAgICB2YXIgZWwgPSB0aGlzLmVsO1xuICAgICAgICB2YXIgb2JqID0gdGhpcy5vYmo7XG4gICAgICAgIHZhciBuYW1lID0gZS5uYW1lO1xuICAgICAgICB2YXIgbWV0aG9kID0gbWV0aG9kIHx8ICdvbicgKyBuYW1lO1xuICAgICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcblxuICAgICAgICAvLyBjYWxsYmFja1xuICAgICAgICBmdW5jdGlvbiBjYigpe1xuICAgICAgICAgIHZhciBhID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLmNvbmNhdChhcmdzKTtcbiAgICAgICAgICBvYmpbbWV0aG9kXS5hcHBseShvYmosIGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYmluZFxuICAgICAgICBpZiAoZS5zZWxlY3Rvcikge1xuICAgICAgICAgIGNiID0gZGVsZWdhdGUuYmluZChlbCwgZS5zZWxlY3RvciwgbmFtZSwgY2IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGV2ZW50cy5iaW5kKGVsLCBuYW1lLCBjYik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdWJzY3JpcHRpb24gZm9yIHVuYmluZGluZ1xuICAgICAgICB0aGlzLnN1YihuYW1lLCBtZXRob2QsIGNiKTtcblxuICAgICAgICByZXR1cm4gY2I7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICogVW5iaW5kIGEgc2luZ2xlIGJpbmRpbmcsIGFsbCBiaW5kaW5ncyBmb3IgYGV2ZW50YCxcbiAgICAgICogb3IgYWxsIGJpbmRpbmdzIHdpdGhpbiB0aGUgbWFuYWdlci5cbiAgICAgICpcbiAgICAgICogRXhhbXBsZXM6XG4gICAgICAqXG4gICAgICAqICBVbmJpbmQgZGlyZWN0IGhhbmRsZXJzOlxuICAgICAgKlxuICAgICAgKiAgICAgZXZlbnRzLnVuYmluZCgnY2xpY2snLCAncmVtb3ZlJylcbiAgICAgICogICAgIGV2ZW50cy51bmJpbmQoJ2NsaWNrJylcbiAgICAgICogICAgIGV2ZW50cy51bmJpbmQoKVxuICAgICAgKlxuICAgICAgKiBVbmJpbmQgZGVsZWdhdGUgaGFuZGxlcnM6XG4gICAgICAqXG4gICAgICAqICAgICBldmVudHMudW5iaW5kKCdjbGljaycsICdyZW1vdmUnKVxuICAgICAgKiAgICAgZXZlbnRzLnVuYmluZCgnY2xpY2snKVxuICAgICAgKiAgICAgZXZlbnRzLnVuYmluZCgpXG4gICAgICAqXG4gICAgICAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBbZXZlbnRdXG4gICAgICAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBbbWV0aG9kXVxuICAgICAgKiBAYXBpIHB1YmxpY1xuICAgICAgKi9cblxuICAgICAgRXZlbnRzLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbihldmVudCwgbWV0aG9kKXtcbiAgICAgICAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMudW5iaW5kQWxsKCk7XG4gICAgICAgIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aGlzLnVuYmluZEFsbE9mKGV2ZW50KTtcblxuICAgICAgICAvLyBubyBiaW5kaW5ncyBmb3IgdGhpcyBldmVudFxuICAgICAgICB2YXIgYmluZGluZ3MgPSB0aGlzLl9ldmVudHNbZXZlbnRdO1xuICAgICAgICBpZiAoIWJpbmRpbmdzKSByZXR1cm47XG5cbiAgICAgICAgLy8gbm8gYmluZGluZ3MgZm9yIHRoaXMgbWV0aG9kXG4gICAgICAgIHZhciBjYiA9IGJpbmRpbmdzW21ldGhvZF07XG4gICAgICAgIGlmICghY2IpIHJldHVybjtcblxuICAgICAgICBldmVudHMudW5iaW5kKHRoaXMuZWwsIGV2ZW50LCBjYik7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICogVW5iaW5kIGFsbCBldmVudHMuXG4gICAgICAqXG4gICAgICAqIEBhcGkgcHJpdmF0ZVxuICAgICAgKi9cblxuICAgICAgRXZlbnRzLnByb3RvdHlwZS51bmJpbmRBbGwgPSBmdW5jdGlvbigpe1xuICAgICAgICBmb3IgKHZhciBldmVudCBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgICAgICB0aGlzLnVuYmluZEFsbE9mKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAqIFVuYmluZCBhbGwgZXZlbnRzIGZvciBgZXZlbnRgLlxuICAgICAgKlxuICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgICAgICogQGFwaSBwcml2YXRlXG4gICAgICAqL1xuXG4gICAgICBFdmVudHMucHJvdG90eXBlLnVuYmluZEFsbE9mID0gZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICB2YXIgYmluZGluZ3MgPSB0aGlzLl9ldmVudHNbZXZlbnRdO1xuICAgICAgICBpZiAoIWJpbmRpbmdzKSByZXR1cm47XG5cbiAgICAgICAgZm9yICh2YXIgbWV0aG9kIGluIGJpbmRpbmdzKSB7XG4gICAgICAgICAgdGhpcy51bmJpbmQoZXZlbnQsIG1ldGhvZCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgKiBQYXJzZSBgZXZlbnRgLlxuICAgICAgKlxuICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgICovXG5cbiAgICAgIGZ1bmN0aW9uIHBhcnNlKGV2ZW50KSB7XG4gICAgICAgIHZhciBwYXJ0cyA9IGV2ZW50LnNwbGl0KC8gKy8pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG5hbWU6IHBhcnRzLnNoaWZ0KCksXG4gICAgICAgICAgc2VsZWN0b3I6IHBhcnRzLmpvaW4oJyAnKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9KTtcbiAgICBfcmVxdWlyZS5yZWdpc3RlcihcImJtY21haGVuLWF1dG8tc2F2ZS9pbmRleC5qc1wiLCBmdW5jdGlvbihleHBvcnRzLCBfcmVxdWlyZSwgbW9kdWxlKXtcbiAgICAgIC8qKlxuICAgICAgKiBCYXNpY2FsbHkgYSBnbG9yaWZpZWQgc2V0VGltZW91dCB0aGF0IEkgaW5ldml0YWJseVxuICAgICAgKiBpbXBsZW1lbnQgaW4gYW55IGF1dG8tc2F2ZSBjb250ZXh0LlxuICAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHRpbWUgbXNcbiAgICAgICogQHJldHVybiB7VGltZXJ9XG4gICAgICAqL1xuXG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgICAgICB2YXIgdGltZSA9IHRpbWUgfHwgMTAwMDtcbiAgICAgICAgdmFyIHRpbWVyO1xuICAgICAgICB2YXIgcmVzZXRUaW1lciA9IGZ1bmN0aW9uKGZuKXtcbiAgICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZm4sIHRpbWUpO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZm4pe1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgcmVzZXRUaW1lcihmbik7XG4gICAgICAgIH1cbiAgICAgIH07XG5cblxuICAgIH0pO1xuICAgIF9yZXF1aXJlLnJlZ2lzdGVyKFwieWllbGRzLWVkaXRhYmxlL2luZGV4LmpzXCIsIGZ1bmN0aW9uKGV4cG9ydHMsIF9yZXF1aXJlLCBtb2R1bGUpe1xuXG4gICAgICAvKipcbiAgICAgICogZGVwZW5kZW5jaWVzXG4gICAgICAqL1xuXG4gICAgICB2YXIgSGlzdG9yeSA9IF9yZXF1aXJlKCdoaXN0b3J5JylcbiAgICAgICwgZW1pdHRlciA9IF9yZXF1aXJlKCdlbWl0dGVyJylcbiAgICAgICwgZXZlbnRzID0gX3JlcXVpcmUoJ2V2ZW50cycpXG4gICAgICAsIGF1dG9zYXZlID0gX3JlcXVpcmUoJ2F1dG8tc2F2ZScpKDUwMCk7XG5cbiAgICAgIC8qKlxuICAgICAgKiBFeHBvcnQgYEVkaXRhYmxlYC5cbiAgICAgICovXG5cbiAgICAgIG1vZHVsZS5leHBvcnRzID0gRWRpdGFibGU7XG5cbiAgICAgIC8qKlxuICAgICAgKiBJbml0aWFsaXplIG5ldyBgRWRpdGFibGVgLlxuICAgICAgKlxuICAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gICAgICAqIEBwYXJhbSB7QXJyYXl9IHN0YWNrXG4gICAgICAqL1xuXG4gICAgICBmdW5jdGlvbiBFZGl0YWJsZShlbCwgc3RhY2spe1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMgaW5zdGFuY2VvZiBFZGl0YWJsZTtcbiAgICAgICAgaWYgKCFzZWxmKSByZXR1cm4gbmV3IEVkaXRhYmxlKGVsLCBzdGFjayk7XG4gICAgICAgIGlmICghZWwpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4cGVjdHMgYW4gZWxlbWVudCcpO1xuICAgICAgICB0aGlzLmhpc3RvcnkgPSBuZXcgSGlzdG9yeShzdGFjayB8fCBbXSk7XG4gICAgICAgIHRoaXMuaGlzdG9yeS5tYXgoMTAwKTtcbiAgICAgICAgdGhpcy5ldmVudHMgPSBldmVudHMoZWwsIHRoaXMpO1xuICAgICAgICB0aGlzLmVsID0gZWw7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgKiBNaXhpbnMuXG4gICAgICAqL1xuXG4gICAgICBlbWl0dGVyKEVkaXRhYmxlLnByb3RvdHlwZSk7XG5cbiAgICAgIC8qKlxuICAgICAgKiBHZXQgZWRpdGFibGUgY29udGVudHMuXG4gICAgICAqXG4gICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgICogQGFwaSBwdWJsaWNcbiAgICAgICovXG5cbiAgICAgIEVkaXRhYmxlLnByb3RvdHlwZS50b1N0cmluZyA9XG4gICAgICBFZGl0YWJsZS5wcm90b3R5cGUuY29udGVudHMgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5lbC5pbm5lckhUTUw7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICogVG9nZ2xlIGVkaXRhYmxlIHN0YXRlLlxuICAgICAgKlxuICAgICAgKiBAcmV0dXJuIHtFZGl0YWJsZX1cbiAgICAgICogQGFwaSBwdWJsaWNcbiAgICAgICovXG5cbiAgICAgIEVkaXRhYmxlLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gJ3RydWUnID09IHRoaXMuZWwuY29udGVudEVkaXRhYmxlXG4gICAgICAgID8gdGhpcy5kaXNhYmxlKClcbiAgICAgICAgOiB0aGlzLmVuYWJsZSgpO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAqIEVuYWJsZSBlZGl0YWJsZS5cbiAgICAgICpcbiAgICAgICogQHJldHVybiB7RWRpdGFibGV9XG4gICAgICAqIEBhcGkgcHVibGljXG4gICAgICAqL1xuXG4gICAgICBFZGl0YWJsZS5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5lbC5jb250ZW50RWRpdGFibGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmV2ZW50cy5iaW5kKCdrZXl1cCcsICdvbnN0YXRlY2hhbmdlJyk7XG4gICAgICAgIHRoaXMuZXZlbnRzLmJpbmQoJ2NsaWNrJywgJ29uc3RhdGVjaGFuZ2UnKTtcbiAgICAgICAgdGhpcy5ldmVudHMuYmluZCgnZm9jdXMnLCAnb25zdGF0ZWNoYW5nZScpO1xuICAgICAgICB0aGlzLmV2ZW50cy5iaW5kKCdwYXN0ZScsICdvbmNoYW5nZScpO1xuICAgICAgICB0aGlzLmV2ZW50cy5iaW5kKCdpbnB1dCcsICdvbmNoYW5nZScpO1xuICAgICAgICB0aGlzLmVtaXQoJ2VuYWJsZScpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgKiBEaXNhYmxlIGVkaXRhYmxlLlxuICAgICAgKlxuICAgICAgKiBAcmV0dXJuIHtFZGl0YWJsZX1cbiAgICAgICogQGFwaSBwdWJsaWNcbiAgICAgICovXG5cbiAgICAgIEVkaXRhYmxlLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdGhpcy5lbC5jb250ZW50RWRpdGFibGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ldmVudHMudW5iaW5kKCk7XG4gICAgICAgIHRoaXMuZW1pdCgnZGlzYWJsZScpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgKiBHZXQgcmFuZ2UuXG4gICAgICAqXG4gICAgICAqIFRPRE86IHgtYnJvd3NlclxuICAgICAgKlxuICAgICAgKiBAcmV0dXJuIHtSYW5nZX1cbiAgICAgICogQGFwaSBwdWJsaWNcbiAgICAgICovXG5cbiAgICAgIEVkaXRhYmxlLnByb3RvdHlwZS5yYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAqIEdldCBzZWxlY3Rpb24uXG4gICAgICAqXG4gICAgICAqIFRPRE86IHgtYnJvd3NlclxuICAgICAgKlxuICAgICAgKiBAcmV0dXJuIHtTZWxlY3Rpb259XG4gICAgICAqIEBhcGkgcHVibGljXG4gICAgICAqL1xuXG4gICAgICBFZGl0YWJsZS5wcm90b3R5cGUuc2VsZWN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgKiBVbmRvLlxuICAgICAgKlxuICAgICAgKiBAcmV0dXJuIHtFZGl0YWJsZX1cbiAgICAgICogQGFwaSBwdWJsaWNcbiAgICAgICovXG5cbiAgICAgIEVkaXRhYmxlLnByb3RvdHlwZS51bmRvID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGJ1ZiA9IHRoaXMuaGlzdG9yeS5wcmV2KCk7XG4gICAgICAgIGlmICghYnVmKSByZXR1cm4gdGhpcztcbiAgICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSBidWY7XG4gICAgICAgIHBvc2l0aW9uKHRoaXMuZWwsIGJ1Zi5hdCk7XG4gICAgICAgIHRoaXMuZW1pdCgnc3RhdGUnKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICogUmVkby5cbiAgICAgICpcbiAgICAgICogQHJldHVybiB7RWRpdGFibGV9XG4gICAgICAqIEBhcGkgcHVibGljXG4gICAgICAqL1xuXG4gICAgICBFZGl0YWJsZS5wcm90b3R5cGUucmVkbyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBidWYgPSB0aGlzLmhpc3RvcnkubmV4dCgpO1xuICAgICAgICBpZiAoIWJ1ZikgcmV0dXJuIHRoaXM7XG4gICAgICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gYnVmO1xuICAgICAgICBwb3NpdGlvbih0aGlzLmVsLCBidWYuYXQpO1xuICAgICAgICB0aGlzLmVtaXQoJ3N0YXRlJyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAqIEV4ZWN1dGUgdGhlIGdpdmVuIGBjbWRgIHdpdGggYHZhbGAuXG4gICAgICAqXG4gICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjbWRcbiAgICAgICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gICAgICAqIEByZXR1cm4ge0VkaXRhYmxlfVxuICAgICAgKiBAYXBpIHB1YmxpY1xuICAgICAgKi9cblxuICAgICAgRWRpdGFibGUucHJvdG90eXBlLmV4ZWN1dGUgPSBmdW5jdGlvbihjbWQsIHZhbCl7XG4gICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKGNtZCwgZmFsc2UsIHZhbCk7XG4gICAgICAgIHRoaXMub25zdGF0ZWNoYW5nZSh7fSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAqIFF1ZXJ5IGBjbWRgIHN0YXRlLlxuICAgICAgKlxuICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY21kXG4gICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAqIEBhcGkgcHVibGljXG4gICAgICAqL1xuXG4gICAgICBFZGl0YWJsZS5wcm90b3R5cGUuc3RhdGUgPSBmdW5jdGlvbihjbWQpe1xuICAgICAgICB2YXIgbGVuZ3RoID0gdGhpcy5oaXN0b3J5LnZhbHMubGVuZ3RoIC0gMVxuICAgICAgICAsIHN0YWNrID0gdGhpcy5oaXN0b3J5O1xuXG4gICAgICAgIGlmICgndW5kbycgPT0gY21kKSByZXR1cm4gMCA8IHN0YWNrLmk7XG4gICAgICAgIGlmICgncmVkbycgPT0gY21kKSByZXR1cm4gbGVuZ3RoID4gc3RhY2suaTtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5Q29tbWFuZFN0YXRlKGNtZCk7XG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICogRW1pdCBgc3RhdGVgLlxuICAgICAgKlxuICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXG4gICAgICAqIEByZXR1cm4ge0VkaXRhYmxlfVxuICAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgICovXG5cbiAgICAgIEVkaXRhYmxlLnByb3RvdHlwZS5vbnN0YXRlY2hhbmdlID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHZhciBoaXN0b3J5ID0gdGhpcy5oaXN0b3J5LnZhbHMubGVuZ3RoO1xuXG4gICAgICAgIGlmICgnZm9jdXMnID09IGUudHlwZSAmJiAwID09IGhpc3RvcnkpIHtcbiAgICAgICAgICB0aGlzLm9uY2hhbmdlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVtaXQoJ3N0YXRlJywgZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAqIEVtaXQgYGNoYW5nZWAgYW5kIHB1c2ggY3VycmVudCBgYnVmYCB0byBoaXN0b3J5LlxuICAgICAgKlxuICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXG4gICAgICAqIEByZXR1cm4ge0VkaXRhYmxlfVxuICAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgICovXG5cbiAgICAgIEVkaXRhYmxlLnByb3RvdHlwZS5vbmNoYW5nZSA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGF1dG9zYXZlKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgdmFyIGJ1ZiA9IG5ldyBTdHJpbmcoc2VsZi50b1N0cmluZygpKTtcbiAgICAgICAgICBidWYuYXQgPSBwb3NpdGlvbihzZWxmLmVsKTtcbiAgICAgICAgICBzZWxmLmhpc3RvcnkuYWRkKGJ1Zik7XG4gICAgICAgICAgcmV0dXJuIHNlbGYuZW1pdCgnY2hhbmdlJywgZSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAqIFNldCAvIGdldCBjYXJldCBwb3NpdGlvbiB3aXRoIGBlbGAuXG4gICAgICAqXG4gICAgICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGF0XG4gICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgICogQGFwaSBwcml2YXRlXG4gICAgICAqL1xuXG4gICAgICBmdW5jdGlvbiBwb3NpdGlvbihlbCwgYXQpe1xuICAgICAgICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIHJhbmdlID0gd2luZG93LmdldFNlbGVjdGlvbigpLmdldFJhbmdlQXQoMCk7XG4gICAgICAgICAgdmFyIGNsb25lID0gcmFuZ2UuY2xvbmVSYW5nZSgpO1xuICAgICAgICAgIGNsb25lLnNlbGVjdE5vZGVDb250ZW50cyhlbCk7XG4gICAgICAgICAgY2xvbmUuc2V0RW5kKHJhbmdlLmVuZENvbnRhaW5lciwgcmFuZ2UuZW5kT2Zmc2V0KTtcbiAgICAgICAgICByZXR1cm4gY2xvbmUudG9TdHJpbmcoKS5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGVuZ3RoID0gMFxuICAgICAgICAsIGFib3J0O1xuXG4gICAgICAgIHZpc2l0KGVsLCBmdW5jdGlvbihub2RlKXtcbiAgICAgICAgICBpZiAoMyAhPSBub2RlLm5vZGVUeXBlKSByZXR1cm47XG4gICAgICAgICAgbGVuZ3RoICs9IG5vZGUudGV4dENvbnRlbnQubGVuZ3RoO1xuICAgICAgICAgIGlmIChsZW5ndGggPj0gYXQpIHtcbiAgICAgICAgICAgIGlmIChhYm9ydCkgcmV0dXJuO1xuICAgICAgICAgICAgYWJvcnQgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIHNlbCA9IGRvY3VtZW50LmdldFNlbGVjdGlvbigpO1xuICAgICAgICAgICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgICAgIHZhciBzdWIgPSBsZW5ndGggLSBub2RlLnRleHRDb250ZW50Lmxlbmd0aDtcbiAgICAgICAgICAgIHJhbmdlLnNldFN0YXJ0KG5vZGUsIGF0IC0gc3ViKTtcbiAgICAgICAgICAgIHJhbmdlLnNldEVuZChub2RlLCBhdCAtIHN1Yik7XG4gICAgICAgICAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgICAgICBzZWwuYWRkUmFuZ2UocmFuZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAqIFdhbGsgYWxsIHRleHQgbm9kZXMgb2YgYG5vZGVgLlxuICAgICAgKlxuICAgICAgKiBAcGFyYW0ge0VsZW1lbnR8Tm9kZX0gbm9kZVxuICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgICovXG5cbiAgICAgIGZ1bmN0aW9uIHZpc2l0KG5vZGUsIGZuKXtcbiAgICAgICAgdmFyIG5vZGVzID0gbm9kZS5jaGlsZE5vZGVzO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgaWYgKGZuKG5vZGVzW2ldKSkgYnJlYWs7XG4gICAgICAgICAgdmlzaXQobm9kZXNbaV0sIGZuKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG5cblxuICAgIH0pO1xuXG5cblxuXG5cblxuXG5cblxuXG4gICAgX3JlcXVpcmUuYWxpYXMoXCJ5aWVsZHMtZWRpdGFibGUvaW5kZXguanNcIiwgXCJ0eXBlLXRlc3Rlci9kZXBzL2VkaXRhYmxlL2luZGV4LmpzXCIpO1xuICAgIF9yZXF1aXJlLmFsaWFzKFwieWllbGRzLWVkaXRhYmxlL2luZGV4LmpzXCIsIFwidHlwZS10ZXN0ZXIvZGVwcy9lZGl0YWJsZS9pbmRleC5qc1wiKTtcbiAgICBfcmVxdWlyZS5hbGlhcyhcInlpZWxkcy1lZGl0YWJsZS9pbmRleC5qc1wiLCBcImVkaXRhYmxlL2luZGV4LmpzXCIpO1xuICAgIF9yZXF1aXJlLmFsaWFzKFwiY29tcG9uZW50LWhpc3RvcnkvaW5kZXguanNcIiwgXCJ5aWVsZHMtZWRpdGFibGUvZGVwcy9oaXN0b3J5L2luZGV4LmpzXCIpO1xuXG4gICAgX3JlcXVpcmUuYWxpYXMoXCJjb21wb25lbnQtZW1pdHRlci9pbmRleC5qc1wiLCBcInlpZWxkcy1lZGl0YWJsZS9kZXBzL2VtaXR0ZXIvaW5kZXguanNcIik7XG5cbiAgICBfcmVxdWlyZS5hbGlhcyhcImNvbXBvbmVudC1ldmVudHMvaW5kZXguanNcIiwgXCJ5aWVsZHMtZWRpdGFibGUvZGVwcy9ldmVudHMvaW5kZXguanNcIik7XG4gICAgX3JlcXVpcmUuYWxpYXMoXCJjb21wb25lbnQtZXZlbnQvaW5kZXguanNcIiwgXCJjb21wb25lbnQtZXZlbnRzL2RlcHMvZXZlbnQvaW5kZXguanNcIik7XG5cbiAgICBfcmVxdWlyZS5hbGlhcyhcImNvbXBvbmVudC1kZWxlZ2F0ZS9pbmRleC5qc1wiLCBcImNvbXBvbmVudC1ldmVudHMvZGVwcy9kZWxlZ2F0ZS9pbmRleC5qc1wiKTtcbiAgICBfcmVxdWlyZS5hbGlhcyhcImNvbXBvbmVudC1jbG9zZXN0L2luZGV4LmpzXCIsIFwiY29tcG9uZW50LWRlbGVnYXRlL2RlcHMvY2xvc2VzdC9pbmRleC5qc1wiKTtcbiAgICBfcmVxdWlyZS5hbGlhcyhcImNvbXBvbmVudC1jbG9zZXN0L2luZGV4LmpzXCIsIFwiY29tcG9uZW50LWRlbGVnYXRlL2RlcHMvY2xvc2VzdC9pbmRleC5qc1wiKTtcbiAgICBfcmVxdWlyZS5hbGlhcyhcImNvbXBvbmVudC1tYXRjaGVzLXNlbGVjdG9yL2luZGV4LmpzXCIsIFwiY29tcG9uZW50LWNsb3Nlc3QvZGVwcy9tYXRjaGVzLXNlbGVjdG9yL2luZGV4LmpzXCIpO1xuICAgIF9yZXF1aXJlLmFsaWFzKFwiY29tcG9uZW50LXF1ZXJ5L2luZGV4LmpzXCIsIFwiY29tcG9uZW50LW1hdGNoZXMtc2VsZWN0b3IvZGVwcy9xdWVyeS9pbmRleC5qc1wiKTtcblxuICAgIF9yZXF1aXJlLmFsaWFzKFwiY29tcG9uZW50LWNsb3Nlc3QvaW5kZXguanNcIiwgXCJjb21wb25lbnQtY2xvc2VzdC9pbmRleC5qc1wiKTtcbiAgICBfcmVxdWlyZS5hbGlhcyhcImNvbXBvbmVudC1ldmVudC9pbmRleC5qc1wiLCBcImNvbXBvbmVudC1kZWxlZ2F0ZS9kZXBzL2V2ZW50L2luZGV4LmpzXCIpO1xuXG4gICAgX3JlcXVpcmUuYWxpYXMoXCJibWNtYWhlbi1hdXRvLXNhdmUvaW5kZXguanNcIiwgXCJ5aWVsZHMtZWRpdGFibGUvZGVwcy9hdXRvLXNhdmUvaW5kZXguanNcIik7XG4gICAgX3JlcXVpcmUuYWxpYXMoXCJibWNtYWhlbi1hdXRvLXNhdmUvaW5kZXguanNcIiwgXCJ5aWVsZHMtZWRpdGFibGUvZGVwcy9hdXRvLXNhdmUvaW5kZXguanNcIik7XG4gICAgX3JlcXVpcmUuYWxpYXMoXCJibWNtYWhlbi1hdXRvLXNhdmUvaW5kZXguanNcIiwgXCJibWNtYWhlbi1hdXRvLXNhdmUvaW5kZXguanNcIik7XG4gICAgX3JlcXVpcmUuYWxpYXMoXCJ5aWVsZHMtZWRpdGFibGUvaW5kZXguanNcIiwgXCJ5aWVsZHMtZWRpdGFibGUvaW5kZXguanNcIik7XG5cblxuICAgIC8vIFNlZSB0aGUgdmVuZG9yL1JFQURNRS5tZFxuICAgIEVkaXRhYmxlID0gX3JlcXVpcmUoJ2VkaXRhYmxlJylcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gX3JlcXVpcmU7IiwiOyB2YXIgX19icm93c2VyaWZ5X3NoaW1fcmVxdWlyZV9fPXJlcXVpcmU7KGZ1bmN0aW9uIGJyb3dzZXJpZnlTaGltKG1vZHVsZSwgZXhwb3J0cywgcmVxdWlyZSwgZGVmaW5lLCBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXykge1xuLyoqXG4qIGZpbmRBbmRSZXBsYWNlRE9NVGV4dCB2IDAuNC4yXG4qIEBhdXRob3IgSmFtZXMgUGFkb2xzZXkgaHR0cDovL2phbWVzLnBhZG9sc2V5LmNvbVxuKiBAbGljZW5zZSBodHRwOi8vdW5saWNlbnNlLm9yZy9VTkxJQ0VOU0VcbipcbiogTWF0Y2hlcyB0aGUgdGV4dCBvZiBhIERPTSBub2RlIGFnYWluc3QgYSByZWd1bGFyIGV4cHJlc3Npb25cbiogYW5kIHJlcGxhY2VzIGVhY2ggbWF0Y2ggKG9yIG5vZGUtc2VwYXJhdGVkIHBvcnRpb25zIG9mIHRoZSBtYXRjaClcbiogaW4gdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuKi9cbndpbmRvdy5maW5kQW5kUmVwbGFjZURPTVRleHQgPSAoZnVuY3Rpb24oKSB7XG5cblx0dmFyIFBPUlRJT05fTU9ERV9SRVRBSU4gPSAncmV0YWluJztcblx0dmFyIFBPUlRJT05fTU9ERV9GSVJTVCA9ICdmaXJzdCc7XG5cblx0dmFyIGRvYyA9IGRvY3VtZW50O1xuXHR2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxuXHRmdW5jdGlvbiBpc0FycmF5KGEpIHtcblx0XHRyZXR1cm4gdG9TdHJpbmcuY2FsbChhKSA9PSAnW29iamVjdCBBcnJheV0nO1xuXHR9XG5cblx0ZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHMpIHtcblx0XHRyZXR1cm4gU3RyaW5nKHMpLnJlcGxhY2UoLyhbLiorP149IToke30oKXxbXFxdXFwvXFxcXF0pL2csICdcXFxcJDEnKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGV4cG9zZWQoKSB7XG5cdFx0Ly8gVHJ5IGRlcHJlY2F0ZWQgYXJnIHNpZ25hdHVyZSBmaXJzdDpcblx0XHRyZXR1cm4gZGVwcmVjYXRlZC5hcHBseShudWxsLCBhcmd1bWVudHMpIHx8IGZpbmRBbmRSZXBsYWNlRE9NVGV4dC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGVwcmVjYXRlZChyZWdleCwgbm9kZSwgcmVwbGFjZW1lbnQsIGNhcHR1cmVHcm91cCwgZWxGaWx0ZXIpIHtcblx0XHRpZiAoKG5vZGUgJiYgIW5vZGUubm9kZVR5cGUpICYmIGFyZ3VtZW50cy5sZW5ndGggPD0gMikge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHR2YXIgaXNSZXBsYWNlbWVudEZ1bmN0aW9uID0gdHlwZW9mIHJlcGxhY2VtZW50ID09ICdmdW5jdGlvbic7XG5cblx0XHRpZiAoaXNSZXBsYWNlbWVudEZ1bmN0aW9uKSB7XG5cdFx0XHRyZXBsYWNlbWVudCA9IChmdW5jdGlvbihvcmlnaW5hbCkge1xuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24ocG9ydGlvbiwgbWF0Y2gpIHtcblx0XHRcdFx0XHRyZXR1cm4gb3JpZ2luYWwocG9ydGlvbi50ZXh0LCBtYXRjaC5zdGFydEluZGV4KTtcblx0XHRcdFx0fTtcblx0XHRcdH0ocmVwbGFjZW1lbnQpKTtcblx0XHR9XG5cblx0XHQvLyBBd2t3YXJkIHN1cHBvcnQgZm9yIGRlcHJlY2F0ZWQgYXJndW1lbnQgc2lnbmF0dXJlICg8MC40LjApXG5cdFx0dmFyIGluc3RhbmNlID0gZmluZEFuZFJlcGxhY2VET01UZXh0KG5vZGUsIHtcblxuXHRcdFx0ZmluZDogcmVnZXgsXG5cblx0XHRcdHdyYXA6IGlzUmVwbGFjZW1lbnRGdW5jdGlvbiA/IG51bGwgOiByZXBsYWNlbWVudCxcblx0XHRcdHJlcGxhY2U6IGlzUmVwbGFjZW1lbnRGdW5jdGlvbiA/IHJlcGxhY2VtZW50IDogJyQnICsgKGNhcHR1cmVHcm91cCB8fCAnJicpLFxuXG5cdFx0XHRwcmVwTWF0Y2g6IGZ1bmN0aW9uKG0sIG1pKSB7XG5cblx0XHRcdFx0Ly8gU3VwcG9ydCBjYXB0dXJlR3JvdXAgKGEgZGVwcmVjYXRlZCBmZWF0dXJlKVxuXG5cdFx0XHRcdGlmICghbVswXSkgdGhyb3cgJ2ZpbmRBbmRSZXBsYWNlRE9NVGV4dCBjYW5ub3QgaGFuZGxlIHplcm8tbGVuZ3RoIG1hdGNoZXMnO1xuXG5cdFx0XHRcdGlmIChjYXB0dXJlR3JvdXAgPiAwKSB7XG5cdFx0XHRcdFx0dmFyIGNnID0gbVtjYXB0dXJlR3JvdXBdO1xuXHRcdFx0XHRcdG0uaW5kZXggKz0gbVswXS5pbmRleE9mKGNnKTtcblx0XHRcdFx0XHRtWzBdID0gY2c7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRtLmVuZEluZGV4ID0gbS5pbmRleCArIG1bMF0ubGVuZ3RoO1xuXHRcdFx0XHRtLnN0YXJ0SW5kZXggPSBtLmluZGV4O1xuXHRcdFx0XHRtLmluZGV4ID0gbWk7XG5cblx0XHRcdFx0cmV0dXJuIG07XG5cdFx0XHR9LFxuXHRcdFx0ZmlsdGVyRWxlbWVudHM6IGVsRmlsdGVyXG5cdFx0fSk7XG5cblx0XHRleHBvc2VkLnJldmVydCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIGluc3RhbmNlLnJldmVydCgpO1xuXHRcdH07XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQqIGZpbmRBbmRSZXBsYWNlRE9NVGV4dFxuXHQqXG5cdCogTG9jYXRlcyBtYXRjaGVzIGFuZCByZXBsYWNlcyB3aXRoIHJlcGxhY2VtZW50Tm9kZVxuXHQqXG5cdCogQHBhcmFtIHtOb2RlfSBub2RlIEVsZW1lbnQgb3IgVGV4dCBub2RlIHRvIHNlYXJjaCB3aXRoaW5cblx0KiBAcGFyYW0ge1JlZ0V4cH0gb3B0aW9ucy5maW5kIFRoZSByZWd1bGFyIGV4cHJlc3Npb24gdG8gbWF0Y2hcblx0KiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fSBbb3B0aW9ucy53cmFwXSBBIE5vZGVOYW1lLCBvciBhIE5vZGUgdG8gY2xvbmVcblx0KiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gW29wdGlvbnMucmVwbGFjZT0nJCYnXSBXaGF0IHRvIHJlcGxhY2UgZWFjaCBtYXRjaCB3aXRoXG5cdCogQHBhcmFtIHtGdW5jdGlvbn0gW29wdGlvbnMuZmlsdGVyRWxlbWVudHNdIEEgRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHRvIGNoZWNrIHdoZXRoZXIgdG9cblx0Klx0cHJvY2VzcyBhbiBlbGVtZW50LiAocmV0dXJuaW5nIHRydWUgPSBwcm9jZXNzIGVsZW1lbnQsXG5cdCpcdHJldHVybmluZyBmYWxzZSA9IGF2b2lkIGVsZW1lbnQpXG5cdCovXG5cdGZ1bmN0aW9uIGZpbmRBbmRSZXBsYWNlRE9NVGV4dChub2RlLCBvcHRpb25zKSB7XG5cdFx0cmV0dXJuIG5ldyBGaW5kZXIobm9kZSwgb3B0aW9ucyk7XG5cdH1cblxuXHRleHBvc2VkLkZpbmRlciA9IEZpbmRlcjtcblxuXHQvKipcblx0KiBGaW5kZXIgLS0gZW5jYXBzdWxhdGVzIGxvZ2ljIHRvIGZpbmQgYW5kIHJlcGxhY2UuXG5cdCovXG5cdGZ1bmN0aW9uIEZpbmRlcihub2RlLCBvcHRpb25zKSB7XG5cblx0XHRvcHRpb25zLnBvcnRpb25Nb2RlID0gb3B0aW9ucy5wb3J0aW9uTW9kZSB8fCBQT1JUSU9OX01PREVfUkVUQUlOO1xuXG5cdFx0dGhpcy5ub2RlID0gbm9kZTtcblx0XHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG5cdFx0Ly8gRU5hYmxlIG1hdGNoLXByZXBhcmF0aW9uIG1ldGhvZCB0byBiZSBwYXNzZWQgYXMgb3B0aW9uOlxuXHRcdHRoaXMucHJlcE1hdGNoID0gb3B0aW9ucy5wcmVwTWF0Y2ggfHwgdGhpcy5wcmVwTWF0Y2g7XG5cblx0XHR0aGlzLnJldmVydHMgPSBbXTtcblxuXHRcdHRoaXMubWF0Y2hlcyA9IHRoaXMuc2VhcmNoKCk7XG5cblx0XHRpZiAodGhpcy5tYXRjaGVzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5wcm9jZXNzTWF0Y2hlcygpO1xuXHRcdH1cblxuXHR9XG5cblx0RmluZGVyLnByb3RvdHlwZSA9IHtcblxuXHRcdC8qKlxuXHRcdCogU2VhcmNoZXMgZm9yIGFsbCBtYXRjaGVzIHRoYXQgY29tcGx5IHdpdGggdGhlIGluc3RhbmNlJ3MgJ21hdGNoJyBvcHRpb25cblx0XHQqL1xuXHRcdHNlYXJjaDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBtYXRjaDtcblx0XHRcdHZhciBtYXRjaEluZGV4ID0gMDtcblx0XHRcdHZhciByZWdleCA9IHRoaXMub3B0aW9ucy5maW5kO1xuXHRcdFx0dmFyIHRleHQgPSB0aGlzLmdldEFnZ3JlZ2F0ZVRleHQoKTtcblx0XHRcdHZhciBtYXRjaGVzID0gW107XG5cblx0XHRcdHJlZ2V4ID0gdHlwZW9mIHJlZ2V4ID09PSAnc3RyaW5nJyA/IFJlZ0V4cChlc2NhcGVSZWdFeHAocmVnZXgpLCAnZycpIDogcmVnZXg7XG5cblx0XHRcdGlmIChyZWdleC5nbG9iYWwpIHtcblx0XHRcdFx0d2hpbGUgKG1hdGNoID0gcmVnZXguZXhlYyh0ZXh0KSkge1xuXHRcdFx0XHRcdG1hdGNoZXMucHVzaCh0aGlzLnByZXBNYXRjaChtYXRjaCwgbWF0Y2hJbmRleCsrKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmIChtYXRjaCA9IHRleHQubWF0Y2gocmVnZXgpKSB7XG5cdFx0XHRcdFx0bWF0Y2hlcy5wdXNoKHRoaXMucHJlcE1hdGNoKG1hdGNoLCAwKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG1hdGNoZXM7XG5cblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0KiBQcmVwYXJlcyBhIHNpbmdsZSBtYXRjaCB3aXRoIHVzZWZ1bCBtZXRhIGluZm86XG5cdFx0Ki9cblx0XHRwcmVwTWF0Y2g6IGZ1bmN0aW9uKG1hdGNoLCBtYXRjaEluZGV4KSB7XG5cblx0XHRcdGlmICghbWF0Y2hbMF0pIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdmaW5kQW5kUmVwbGFjZURPTVRleHQgY2Fubm90IGhhbmRsZSB6ZXJvLWxlbmd0aCBtYXRjaGVzJyk7XG5cdFx0XHR9XG5cblx0XHRcdG1hdGNoLmVuZEluZGV4ID0gbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGg7XG5cdFx0XHRtYXRjaC5zdGFydEluZGV4ID0gbWF0Y2guaW5kZXg7XG5cdFx0XHRtYXRjaC5pbmRleCA9IG1hdGNoSW5kZXg7XG5cblx0XHRcdHJldHVybiBtYXRjaDtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0KiBHZXRzIGFnZ3JlZ2F0ZSB0ZXh0IHdpdGhpbiBzdWJqZWN0IG5vZGVcblx0XHQqL1xuXHRcdGdldEFnZ3JlZ2F0ZVRleHQ6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgZWxlbWVudEZpbHRlciA9IHRoaXMub3B0aW9ucy5maWx0ZXJFbGVtZW50cztcblxuXHRcdFx0cmV0dXJuIGdldFRleHQodGhpcy5ub2RlKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQqIEdldHMgYWdncmVnYXRlIHRleHQgb2YgYSBub2RlIHdpdGhvdXQgcmVzb3J0aW5nXG5cdFx0XHQqIHRvIGJyb2tlbiBpbm5lclRleHQvdGV4dENvbnRlbnRcblx0XHRcdCovXG5cdFx0XHRmdW5jdGlvbiBnZXRUZXh0KG5vZGUpIHtcblxuXHRcdFx0XHRpZiAobm9kZS5ub2RlVHlwZSA9PT0gMykge1xuXHRcdFx0XHRcdHJldHVybiBub2RlLmRhdGE7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoZWxlbWVudEZpbHRlciAmJiAhZWxlbWVudEZpbHRlcihub2RlKSkge1xuXHRcdFx0XHRcdHJldHVybiAnJztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHZhciB0eHQgPSAnJztcblxuXHRcdFx0XHRpZiAobm9kZSA9IG5vZGUuZmlyc3RDaGlsZCkgZG8ge1xuXHRcdFx0XHRcdHR4dCArPSBnZXRUZXh0KG5vZGUpO1xuXHRcdFx0XHR9IHdoaWxlIChub2RlID0gbm9kZS5uZXh0U2libGluZyk7XG5cblx0XHRcdFx0cmV0dXJuIHR4dDtcblxuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCogU3RlcHMgdGhyb3VnaCB0aGUgdGFyZ2V0IG5vZGUsIGxvb2tpbmcgZm9yIG1hdGNoZXMsIGFuZFxuXHRcdCogY2FsbGluZyByZXBsYWNlRm4gd2hlbiBhIG1hdGNoIGlzIGZvdW5kLlxuXHRcdCovXG5cdFx0cHJvY2Vzc01hdGNoZXM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgbWF0Y2hlcyA9IHRoaXMubWF0Y2hlcztcblx0XHRcdHZhciBub2RlID0gdGhpcy5ub2RlO1xuXHRcdFx0dmFyIGVsZW1lbnRGaWx0ZXIgPSB0aGlzLm9wdGlvbnMuZmlsdGVyRWxlbWVudHM7XG5cblx0XHRcdHZhciBzdGFydFBvcnRpb24sXG5cdFx0XHRlbmRQb3J0aW9uLFxuXHRcdFx0aW5uZXJQb3J0aW9ucyA9IFtdLFxuXHRcdFx0Y3VyTm9kZSA9IG5vZGUsXG5cdFx0XHRtYXRjaCA9IG1hdGNoZXMuc2hpZnQoKSxcblx0XHRcdGF0SW5kZXggPSAwLCAvLyBpLmUuIG5vZGVBdEluZGV4XG5cdFx0XHRtYXRjaEluZGV4ID0gMCxcblx0XHRcdHBvcnRpb25JbmRleCA9IDAsXG5cdFx0XHRkb0F2b2lkTm9kZSxcblx0XHRcdG5vZGVTdGFjayA9IFtub2RlXTtcblxuXHRcdFx0b3V0OiB3aGlsZSAodHJ1ZSkge1xuXG5cdFx0XHRcdGlmIChjdXJOb2RlLm5vZGVUeXBlID09PSAzKSB7XG5cblx0XHRcdFx0XHRpZiAoIWVuZFBvcnRpb24gJiYgY3VyTm9kZS5sZW5ndGggKyBhdEluZGV4ID49IG1hdGNoLmVuZEluZGV4KSB7XG5cblx0XHRcdFx0XHRcdC8vIFdlJ3ZlIGZvdW5kIHRoZSBlbmRpbmdcblx0XHRcdFx0XHRcdGVuZFBvcnRpb24gPSB7XG5cdFx0XHRcdFx0XHRcdG5vZGU6IGN1ck5vZGUsXG5cdFx0XHRcdFx0XHRcdGluZGV4OiBwb3J0aW9uSW5kZXgrKyxcblx0XHRcdFx0XHRcdFx0dGV4dDogY3VyTm9kZS5kYXRhLnN1YnN0cmluZyhtYXRjaC5zdGFydEluZGV4IC0gYXRJbmRleCwgbWF0Y2guZW5kSW5kZXggLSBhdEluZGV4KSxcblx0XHRcdFx0XHRcdFx0aW5kZXhJbk1hdGNoOiBhdEluZGV4IC0gbWF0Y2guc3RhcnRJbmRleCxcblx0XHRcdFx0XHRcdFx0aW5kZXhJbk5vZGU6IG1hdGNoLnN0YXJ0SW5kZXggLSBhdEluZGV4LCAvLyBhbHdheXMgemVybyBmb3IgZW5kLXBvcnRpb25zXG5cdFx0XHRcdFx0XHRcdGVuZEluZGV4SW5Ob2RlOiBtYXRjaC5lbmRJbmRleCAtIGF0SW5kZXgsXG5cdFx0XHRcdFx0XHRcdGlzRW5kOiB0cnVlXG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChzdGFydFBvcnRpb24pIHtcblx0XHRcdFx0XHRcdC8vIEludGVyc2VjdGluZyBub2RlXG5cdFx0XHRcdFx0XHRpbm5lclBvcnRpb25zLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRub2RlOiBjdXJOb2RlLFxuXHRcdFx0XHRcdFx0XHRpbmRleDogcG9ydGlvbkluZGV4KyssXG5cdFx0XHRcdFx0XHRcdHRleHQ6IGN1ck5vZGUuZGF0YSxcblx0XHRcdFx0XHRcdFx0aW5kZXhJbk1hdGNoOiBhdEluZGV4IC0gbWF0Y2guc3RhcnRJbmRleCxcblx0XHRcdFx0XHRcdFx0aW5kZXhJbk5vZGU6IDAgLy8gYWx3YXlzIHplcm8gZm9yIGlubmVyLXBvcnRpb25zXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIXN0YXJ0UG9ydGlvbiAmJiBjdXJOb2RlLmxlbmd0aCArIGF0SW5kZXggPiBtYXRjaC5zdGFydEluZGV4KSB7XG5cdFx0XHRcdFx0XHQvLyBXZSd2ZSBmb3VuZCB0aGUgbWF0Y2ggc3RhcnRcblx0XHRcdFx0XHRcdHN0YXJ0UG9ydGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0bm9kZTogY3VyTm9kZSxcblx0XHRcdFx0XHRcdFx0aW5kZXg6IHBvcnRpb25JbmRleCsrLFxuXHRcdFx0XHRcdFx0XHRpbmRleEluTWF0Y2g6IDAsXG5cdFx0XHRcdFx0XHRcdGluZGV4SW5Ob2RlOiBtYXRjaC5zdGFydEluZGV4IC0gYXRJbmRleCxcblx0XHRcdFx0XHRcdFx0ZW5kSW5kZXhJbk5vZGU6IG1hdGNoLmVuZEluZGV4IC0gYXRJbmRleCxcblx0XHRcdFx0XHRcdFx0dGV4dDogY3VyTm9kZS5kYXRhLnN1YnN0cmluZyhtYXRjaC5zdGFydEluZGV4IC0gYXRJbmRleCwgbWF0Y2guZW5kSW5kZXggLSBhdEluZGV4KVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRhdEluZGV4ICs9IGN1ck5vZGUuZGF0YS5sZW5ndGg7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRvQXZvaWROb2RlID0gY3VyTm9kZS5ub2RlVHlwZSA9PT0gMSAmJiBlbGVtZW50RmlsdGVyICYmICFlbGVtZW50RmlsdGVyKGN1ck5vZGUpO1xuXG5cdFx0XHRcdGlmIChzdGFydFBvcnRpb24gJiYgZW5kUG9ydGlvbikge1xuXG5cdFx0XHRcdFx0Y3VyTm9kZSA9IHRoaXMucmVwbGFjZU1hdGNoKG1hdGNoLCBzdGFydFBvcnRpb24sIGlubmVyUG9ydGlvbnMsIGVuZFBvcnRpb24pO1xuXG5cdFx0XHRcdFx0Ly8gcHJvY2Vzc01hdGNoZXMgaGFzIHRvIHJldHVybiB0aGUgbm9kZSB0aGF0IHJlcGxhY2VkIHRoZSBlbmROb2RlXG5cdFx0XHRcdFx0Ly8gYW5kIHRoZW4gd2Ugc3RlcCBiYWNrIHNvIHdlIGNhbiBjb250aW51ZSBmcm9tIHRoZSBlbmQgb2YgdGhlXG5cdFx0XHRcdFx0Ly8gbWF0Y2g6XG5cblx0XHRcdFx0XHRhdEluZGV4IC09IChlbmRQb3J0aW9uLm5vZGUuZGF0YS5sZW5ndGggLSBlbmRQb3J0aW9uLmVuZEluZGV4SW5Ob2RlKTtcblxuXHRcdFx0XHRcdHN0YXJ0UG9ydGlvbiA9IG51bGw7XG5cdFx0XHRcdFx0ZW5kUG9ydGlvbiA9IG51bGw7XG5cdFx0XHRcdFx0aW5uZXJQb3J0aW9ucyA9IFtdO1xuXHRcdFx0XHRcdG1hdGNoID0gbWF0Y2hlcy5zaGlmdCgpO1xuXHRcdFx0XHRcdHBvcnRpb25JbmRleCA9IDA7XG5cdFx0XHRcdFx0bWF0Y2hJbmRleCsrO1xuXG5cdFx0XHRcdFx0aWYgKCFtYXRjaCkge1xuXHRcdFx0XHRcdFx0YnJlYWs7IC8vIG5vIG1vcmUgbWF0Y2hlc1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdCFkb0F2b2lkTm9kZSAmJlxuXHRcdFx0XHRcdChjdXJOb2RlLmZpcnN0Q2hpbGQgfHwgY3VyTm9kZS5uZXh0U2libGluZylcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0Ly8gTW92ZSBkb3duIG9yIGZvcndhcmQ6XG5cdFx0XHRcdFx0aWYgKGN1ck5vZGUuZmlyc3RDaGlsZCkge1xuXHRcdFx0XHRcdFx0bm9kZVN0YWNrLnB1c2goY3VyTm9kZSk7XG5cdFx0XHRcdFx0XHRjdXJOb2RlID0gY3VyTm9kZS5maXJzdENoaWxkO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjdXJOb2RlID0gY3VyTm9kZS5uZXh0U2libGluZztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBNb3ZlIGZvcndhcmQgb3IgdXA6XG5cdFx0XHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRcdFx0aWYgKGN1ck5vZGUubmV4dFNpYmxpbmcpIHtcblx0XHRcdFx0XHRcdGN1ck5vZGUgPSBjdXJOb2RlLm5leHRTaWJsaW5nO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGN1ck5vZGUgPSBub2RlU3RhY2sucG9wKCk7XG5cdFx0XHRcdFx0aWYgKGN1ck5vZGUgPT09IG5vZGUpIHtcblx0XHRcdFx0XHRcdGJyZWFrIG91dDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCogUmV2ZXJ0cyAuLi4gVE9ET1xuXHRcdCovXG5cdFx0cmV2ZXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIFJldmVyc2lvbiBvY2N1cnMgYmFja3dhcmRzIHNvIGFzIHRvIGF2b2lkIG5vZGVzIHN1YnNlcXVlbnRseVxuXHRcdFx0Ly8gcmVwbGFjZWQgZHVyaW5nIHRoZSBtYXRjaGluZyBwaGFzZSAoYSBmb3J3YXJkIHByb2Nlc3MpOlxuXHRcdFx0Zm9yICh2YXIgbCA9IHRoaXMucmV2ZXJ0cy5sZW5ndGg7IGwtLTspIHtcblx0XHRcdFx0dGhpcy5yZXZlcnRzW2xdKCk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnJldmVydHMgPSBbXTtcblx0XHR9LFxuXG5cdFx0cHJlcGFyZVJlcGxhY2VtZW50U3RyaW5nOiBmdW5jdGlvbihzdHJpbmcsIHBvcnRpb24sIG1hdGNoLCBtYXRjaEluZGV4KSB7XG5cdFx0XHR2YXIgcG9ydGlvbk1vZGUgPSB0aGlzLm9wdGlvbnMucG9ydGlvbk1vZGU7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdHBvcnRpb25Nb2RlID09PSBQT1JUSU9OX01PREVfRklSU1QgJiZcblx0XHRcdFx0cG9ydGlvbi5pbmRleEluTWF0Y2ggPiAwXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuICcnO1xuXHRcdFx0fVxuXHRcdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoL1xcJChcXGQrfCZ8YHwnKS9nLCBmdW5jdGlvbigkMCwgdCkge1xuXHRcdFx0XHR2YXIgcmVwbGFjZW1lbnQ7XG5cdFx0XHRcdHN3aXRjaCh0KSB7XG5cdFx0XHRcdFx0Y2FzZSAnJic6XG5cdFx0XHRcdFx0XHRyZXBsYWNlbWVudCA9IG1hdGNoWzBdO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlICdgJzpcblx0XHRcdFx0XHRcdFx0cmVwbGFjZW1lbnQgPSBtYXRjaC5pbnB1dC5zdWJzdHJpbmcoMCwgbWF0Y2guc3RhcnRJbmRleCk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRjYXNlICdcXCcnOlxuXHRcdFx0XHRcdFx0XHRcdHJlcGxhY2VtZW50ID0gbWF0Y2guaW5wdXQuc3Vic3RyaW5nKG1hdGNoLmVuZEluZGV4KTtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0cmVwbGFjZW1lbnQgPSBtYXRjaFsrdF07XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXBsYWNlbWVudDtcblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKHBvcnRpb25Nb2RlID09PSBQT1JUSU9OX01PREVfRklSU1QpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc3RyaW5nO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKHBvcnRpb24uaXNFbmQpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc3RyaW5nLnN1YnN0cmluZyhwb3J0aW9uLmluZGV4SW5NYXRjaCk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gc3RyaW5nLnN1YnN0cmluZyhwb3J0aW9uLmluZGV4SW5NYXRjaCwgcG9ydGlvbi5pbmRleEluTWF0Y2ggKyBwb3J0aW9uLnRleHQubGVuZ3RoKTtcblx0XHRcdFx0XHRcdH0sXG5cblx0XHRcdFx0XHRcdGdldFBvcnRpb25SZXBsYWNlbWVudE5vZGU6IGZ1bmN0aW9uKHBvcnRpb24sIG1hdGNoLCBtYXRjaEluZGV4KSB7XG5cblx0XHRcdFx0XHRcdFx0dmFyIHJlcGxhY2VtZW50ID0gdGhpcy5vcHRpb25zLnJlcGxhY2UgfHwgJyQmJztcblx0XHRcdFx0XHRcdFx0dmFyIHdyYXBwZXIgPSB0aGlzLm9wdGlvbnMud3JhcDtcblxuXHRcdFx0XHRcdFx0XHRpZiAod3JhcHBlciAmJiB3cmFwcGVyLm5vZGVUeXBlKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gV3JhcHBlciBoYXMgYmVlbiBwcm92aWRlZCBhcyBhIHN0ZW5jaWwtbm9kZSBmb3IgdXMgdG8gY2xvbmU6XG5cdFx0XHRcdFx0XHRcdFx0dmFyIGNsb25lID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHRcdFx0XHRcdGNsb25lLmlubmVySFRNTCA9IHdyYXBwZXIub3V0ZXJIVE1MIHx8IG5ldyBYTUxTZXJpYWxpemVyKCkuc2VyaWFsaXplVG9TdHJpbmcod3JhcHBlcik7XG5cdFx0XHRcdFx0XHRcdFx0d3JhcHBlciA9IGNsb25lLmZpcnN0Q2hpbGQ7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIHJlcGxhY2VtZW50ID09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXBsYWNlbWVudCA9IHJlcGxhY2VtZW50KHBvcnRpb24sIG1hdGNoLCBtYXRjaEluZGV4KTtcblx0XHRcdFx0XHRcdFx0XHRpZiAocmVwbGFjZW1lbnQgJiYgcmVwbGFjZW1lbnQubm9kZVR5cGUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXBsYWNlbWVudDtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGRvYy5jcmVhdGVUZXh0Tm9kZShTdHJpbmcocmVwbGFjZW1lbnQpKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHZhciBlbCA9IHR5cGVvZiB3cmFwcGVyID09ICdzdHJpbmcnID8gZG9jLmNyZWF0ZUVsZW1lbnQod3JhcHBlcikgOiB3cmFwcGVyO1xuXG5cdFx0XHRcdFx0XHRcdHJlcGxhY2VtZW50ID0gZG9jLmNyZWF0ZVRleHROb2RlKFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMucHJlcGFyZVJlcGxhY2VtZW50U3RyaW5nKFxuXHRcdFx0XHRcdFx0XHRcdFx0cmVwbGFjZW1lbnQsIHBvcnRpb24sIG1hdGNoLCBtYXRjaEluZGV4XG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghcmVwbGFjZW1lbnQuZGF0YSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXBsYWNlbWVudDtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmICghZWwpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVwbGFjZW1lbnQ7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRlbC5hcHBlbmRDaGlsZChyZXBsYWNlbWVudCk7XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIGVsO1xuXHRcdFx0XHRcdFx0fSxcblxuXHRcdFx0XHRcdFx0cmVwbGFjZU1hdGNoOiBmdW5jdGlvbihtYXRjaCwgc3RhcnRQb3J0aW9uLCBpbm5lclBvcnRpb25zLCBlbmRQb3J0aW9uKSB7XG5cblx0XHRcdFx0XHRcdFx0dmFyIG1hdGNoU3RhcnROb2RlID0gc3RhcnRQb3J0aW9uLm5vZGU7XG5cdFx0XHRcdFx0XHRcdHZhciBtYXRjaEVuZE5vZGUgPSBlbmRQb3J0aW9uLm5vZGU7XG5cblx0XHRcdFx0XHRcdFx0dmFyIHByZWNlZWRpbmdUZXh0Tm9kZTtcblx0XHRcdFx0XHRcdFx0dmFyIGZvbGxvd2luZ1RleHROb2RlO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChtYXRjaFN0YXJ0Tm9kZSA9PT0gbWF0Y2hFbmROb2RlKSB7XG5cblx0XHRcdFx0XHRcdFx0XHR2YXIgbm9kZSA9IG1hdGNoU3RhcnROb2RlO1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHN0YXJ0UG9ydGlvbi5pbmRleEluTm9kZSA+IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIEFkZCBgYmVmb3JlYCB0ZXh0IG5vZGUgKGJlZm9yZSB0aGUgbWF0Y2gpXG5cdFx0XHRcdFx0XHRcdFx0XHRwcmVjZWVkaW5nVGV4dE5vZGUgPSBkb2MuY3JlYXRlVGV4dE5vZGUobm9kZS5kYXRhLnN1YnN0cmluZygwLCBzdGFydFBvcnRpb24uaW5kZXhJbk5vZGUpKTtcblx0XHRcdFx0XHRcdFx0XHRcdG5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUocHJlY2VlZGluZ1RleHROb2RlLCBub2RlKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHQvLyBDcmVhdGUgdGhlIHJlcGxhY2VtZW50IG5vZGU6XG5cdFx0XHRcdFx0XHRcdFx0dmFyIG5ld05vZGUgPSB0aGlzLmdldFBvcnRpb25SZXBsYWNlbWVudE5vZGUoXG5cdFx0XHRcdFx0XHRcdFx0XHRlbmRQb3J0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdFx0bWF0Y2hcblx0XHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdFx0bm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCBub2RlKTtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChlbmRQb3J0aW9uLmVuZEluZGV4SW5Ob2RlIDwgbm9kZS5sZW5ndGgpIHsgLy8gPz8/Pz9cblx0XHRcdFx0XHRcdFx0XHRcdC8vIEFkZCBgYWZ0ZXJgIHRleHQgbm9kZSAoYWZ0ZXIgdGhlIG1hdGNoKVxuXHRcdFx0XHRcdFx0XHRcdFx0Zm9sbG93aW5nVGV4dE5vZGUgPSBkb2MuY3JlYXRlVGV4dE5vZGUobm9kZS5kYXRhLnN1YnN0cmluZyhlbmRQb3J0aW9uLmVuZEluZGV4SW5Ob2RlKSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRub2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGZvbGxvd2luZ1RleHROb2RlLCBub2RlKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG5cblx0XHRcdFx0XHRcdFx0XHR0aGlzLnJldmVydHMucHVzaChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChwcmVjZWVkaW5nVGV4dE5vZGUgPT09IG5ld05vZGUucHJldmlvdXNTaWJsaW5nKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHByZWNlZWRpbmdUZXh0Tm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHByZWNlZWRpbmdUZXh0Tm9kZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoZm9sbG93aW5nVGV4dE5vZGUgPT09IG5ld05vZGUubmV4dFNpYmxpbmcpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Zm9sbG93aW5nVGV4dE5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChmb2xsb3dpbmdUZXh0Tm9kZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRuZXdOb2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5vZGUsIG5ld05vZGUpO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG5ld05vZGU7XG5cblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBSZXBsYWNlIG1hdGNoU3RhcnROb2RlIC0+IFtpbm5lck1hdGNoTm9kZXMuLi5dIC0+IG1hdGNoRW5kTm9kZSAoaW4gdGhhdCBvcmRlcilcblxuXG5cdFx0XHRcdFx0XHRcdFx0cHJlY2VlZGluZ1RleHROb2RlID0gZG9jLmNyZWF0ZVRleHROb2RlKFxuXHRcdFx0XHRcdFx0XHRcdFx0bWF0Y2hTdGFydE5vZGUuZGF0YS5zdWJzdHJpbmcoMCwgc3RhcnRQb3J0aW9uLmluZGV4SW5Ob2RlKVxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0XHRmb2xsb3dpbmdUZXh0Tm9kZSA9IGRvYy5jcmVhdGVUZXh0Tm9kZShcblx0XHRcdFx0XHRcdFx0XHRcdG1hdGNoRW5kTm9kZS5kYXRhLnN1YnN0cmluZyhlbmRQb3J0aW9uLmVuZEluZGV4SW5Ob2RlKVxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0XHR2YXIgZmlyc3ROb2RlID0gdGhpcy5nZXRQb3J0aW9uUmVwbGFjZW1lbnROb2RlKFxuXHRcdFx0XHRcdFx0XHRcdFx0c3RhcnRQb3J0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdFx0bWF0Y2hcblx0XHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdFx0dmFyIGlubmVyTm9kZXMgPSBbXTtcblxuXHRcdFx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwLCBsID0gaW5uZXJQb3J0aW9ucy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBwb3J0aW9uID0gaW5uZXJQb3J0aW9uc1tpXTtcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBpbm5lck5vZGUgPSB0aGlzLmdldFBvcnRpb25SZXBsYWNlbWVudE5vZGUoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHBvcnRpb24sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1hdGNoXG5cdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0cG9ydGlvbi5ub2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGlubmVyTm9kZSwgcG9ydGlvbi5ub2RlKTtcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMucmV2ZXJ0cy5wdXNoKChmdW5jdGlvbihwb3J0aW9uLCBpbm5lck5vZGUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlubmVyTm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChwb3J0aW9uLm5vZGUsIGlubmVyTm9kZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHR9KHBvcnRpb24sIGlubmVyTm9kZSkpKTtcblx0XHRcdFx0XHRcdFx0XHRcdGlubmVyTm9kZXMucHVzaChpbm5lck5vZGUpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdHZhciBsYXN0Tm9kZSA9IHRoaXMuZ2V0UG9ydGlvblJlcGxhY2VtZW50Tm9kZShcblx0XHRcdFx0XHRcdFx0XHRcdGVuZFBvcnRpb24sXG5cdFx0XHRcdFx0XHRcdFx0XHRtYXRjaFxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0XHRtYXRjaFN0YXJ0Tm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShwcmVjZWVkaW5nVGV4dE5vZGUsIG1hdGNoU3RhcnROb2RlKTtcblx0XHRcdFx0XHRcdFx0XHRtYXRjaFN0YXJ0Tm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShmaXJzdE5vZGUsIG1hdGNoU3RhcnROb2RlKTtcblx0XHRcdFx0XHRcdFx0XHRtYXRjaFN0YXJ0Tm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG1hdGNoU3RhcnROb2RlKTtcblxuXHRcdFx0XHRcdFx0XHRcdG1hdGNoRW5kTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShsYXN0Tm9kZSwgbWF0Y2hFbmROb2RlKTtcblx0XHRcdFx0XHRcdFx0XHRtYXRjaEVuZE5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZm9sbG93aW5nVGV4dE5vZGUsIG1hdGNoRW5kTm9kZSk7XG5cdFx0XHRcdFx0XHRcdFx0bWF0Y2hFbmROb2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobWF0Y2hFbmROb2RlKTtcblxuXHRcdFx0XHRcdFx0XHRcdHRoaXMucmV2ZXJ0cy5wdXNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cHJlY2VlZGluZ1RleHROb2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocHJlY2VlZGluZ1RleHROb2RlKTtcblx0XHRcdFx0XHRcdFx0XHRcdGZpcnN0Tm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChtYXRjaFN0YXJ0Tm9kZSwgZmlyc3ROb2RlKTtcblx0XHRcdFx0XHRcdFx0XHRcdGZvbGxvd2luZ1RleHROb2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZm9sbG93aW5nVGV4dE5vZGUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0bGFzdE5vZGUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobWF0Y2hFbmROb2RlLCBsYXN0Tm9kZSk7XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gbGFzdE5vZGU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRyZXR1cm4gZXhwb3NlZDtcblxuXHRcdFx0XHR9KCkpO1xuXHRcdFx0XHRcblxuOyBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXyh0eXBlb2YgZmluZEFuZFJlcGxhY2VET01UZXh0ICE9IFwidW5kZWZpbmVkXCIgPyBmaW5kQW5kUmVwbGFjZURPTVRleHQgOiB3aW5kb3cuZmluZEFuZFJlcGxhY2VET01UZXh0KTtcblxufSkuY2FsbChnbG9iYWwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZnVuY3Rpb24gZGVmaW5lRXhwb3J0KGV4KSB7IG1vZHVsZS5leHBvcnRzID0gZXg7IH0pO1xuIiwiLyoqXG4gKiBGb250IEZlYXR1cmUgQWJldHRpbmdzIDAuMS4wXG4gKiBodHRwczovL2dpdGh1Yi5jb20va2VubmV0aG9ybWFuZHkvZm9udC1mZWF0dXJlLWFiZXR0aW5nc1xuICogQGF1dGhvciBLZW5uZXRoIE9ybWFuZHkgaHR0cDovL2tlbm5ldGhvcm1hbmR5LmNvbVxuICogQGxpY2Vuc2UgQ29weXJpZ2h0IMKpIDIwMTTigJMyMDE1IEtlbm5ldGggT3JtYW5keS5cbiAqICAgICAgICAgIEF2YWlsYWJsZSB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZ3N1YiwgZ25hbWVzKSB7XG5cbiAgdmFyIGl0ZW1cbiAgdmFyIGZlYXRcbiAgdmFyIHBhdHRlcm5zID0ge31cbiAgdmFyIHBlcm1pdHRlZCA9IFsnbGlnYScsICdkbGlnJywgJ2xudW0nXSAvLyBPcHRpb25zXG4gIHZhciBmaWd1cmVzID0gWydwbnVtJywgJ29udW0nLCAnbG51bScsICd0bnVtJ11cbiAgdmFyIGl0ZXJhdGVcblxuICAvKipcbiAgICogRmxhdHRlbiBnc3ViLCB3aXphcmRyeSBieSBAc2ludGF4aVxuICAgKi9cbiAgaXRlcmF0ZSA9IGZ1bmN0aW9uIChub2RlLCBwcmVmaXgpIHtcbiAgICB2YXIgYXJyID0gW11cblxuICAgIC8vIE5vdGhpbmcgdG8gZG9cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG5vZGUpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgcmV0dXJuIHByZWZpeCB8fCBbXVxuICAgIH1cblxuICAgIC8vIEluY2VwdGlvblxuICAgIGZvciAodmFyIGtleSBpbiBub2RlKSB7XG4gICAgICBhcnIucHVzaChpdGVyYXRlKGduYW1lc1tub2RlW2tleV1dLCAocHJlZml4IHx8ICcnKSArIGduYW1lc1trZXldKSlcbiAgICB9XG5cbiAgICAvLyBGbGF0dGVuXG4gICAgLy8gcmV0dXJuIFtdLmNvbmNhdC5hcHBseShbXSwgYXJyKVxuICAgIHJldHVybiBhcnJcbiAgfVxuXG4gIC8qKlxuICAgKiBGbGF0dGVuIGdzdWIgdGFibGUgaW50byBmZWF0dXJlIG5hbWVzXG4gICAqXG4gICAqL1xuICBmb3IgKGZlYXQgaW4gZ3N1Yikge1xuICAgIGlmIChnc3ViLmhhc093blByb3BlcnR5KGZlYXQpKSB7XG4gICAgICBpZiAoZmlndXJlcy5pbmRleE9mKGZlYXQpICE9PSAtMSkge1xuICAgICAgICAvLyBIYXJkLWNvZGUgbnVtZXJhbHMgaWYgdGhlcmUgYXJlIG51bWVyYWwgc3R5bGVzXG4gICAgICAgIHBhdHRlcm5zW2ZlYXRdID0gWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldXG4gICAgICB9IGVsc2UgaWYgKHBlcm1pdHRlZC5pbmRleE9mKGZlYXQpICE9PSAtMSkge1xuICAgICAgICBwYXR0ZXJuc1tmZWF0XSA9IFtdXG4gICAgICAgIGZvciAoaXRlbSBpbiBnc3ViW2ZlYXRdKSB7XG4gICAgICAgICAgdmFyIGdzdWJQb3J0aW9uID0gZ3N1YltmZWF0XVtpdGVtXVxuICAgICAgICAgIC8vIEl0IHNlZW1zIGxpa2UgdGhpcyBzaG91bGQgYWxsIGJlIHBhcnQgb2YgQHNpbnRheGnigJlzIHRoaW5nLCB0b29cbiAgICAgICAgICBpZiAoZ3N1YltmZWF0XS5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xuICAgICAgICAgICAgLy8gaWYgKGdzdWJQb3J0aW9uLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgLy8gICBjb25zb2xlLmxvZyhnbmFtZXNbZ3N1YlBvcnRpb25bMF1dKVxuICAgICAgICAgICAgLy8gfSBlbHNlXG4gICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGdzdWJQb3J0aW9uKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgICAgICAgcGF0dGVybnNbZmVhdF0ucHVzaC5hcHBseShwYXR0ZXJuc1tmZWF0XSwgaXRlcmF0ZShnc3ViUG9ydGlvbiwgZ25hbWVzW2l0ZW1dKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGVsc2Uge1xuICAgICAgICAgICAgLy8gICAvLyBJZiBpdOKAmXMgbm90IGFuIG9iamVjdCwgaXTigJlzIGEgc2luZ2xlIGNoYXJhY3RlciBzdWJzdGl0dXRpb25cbiAgICAgICAgICAgIC8vICAgcmV0dXJuIHBhdHRlcm5zICs9ICcsJyArIGl0ZXJhdGUoZ3N1YltmZWF0XSkuam9pbigpKVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gZmxhdHRlbmVkIGZlYXR1cmVzXG4gICAqXG4gICAqL1xuICByZXR1cm4gcGF0dGVybnNcbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgICBcImZvbnQtZmFtaWx5XCI6IFwiS2xpbmljIFNsYWJcIixcbiAgICBcImZvbnQtc3R5bGVcIjogXCJub3JtYWxcIixcbiAgICBcImZvbnQtd2VpZ2h0XCI6IDQwMCxcbiAgICBcImZlYXRcIjogW1xuICAgICAgICBcImFhbHRcIixcbiAgICAgICAgXCJjMnNjXCIsXG4gICAgICAgIFwiY2FzZVwiLFxuICAgICAgICBcImRsaWdcIixcbiAgICAgICAgXCJsaWdhXCIsXG4gICAgICAgIFwibG51bVwiLFxuICAgICAgICBcInNhbHRcIixcbiAgICAgICAgXCJzbWNwXCIsXG4gICAgICAgIFwic3MwMVwiXG4gICAgXSxcbiAgICBcImdzdWJcIjoge1xuICAgICAgICBcImFhbHRcIjoge1xuICAgICAgICAgICAgXCI5XCI6IFtcbiAgICAgICAgICAgICAgICA0NjMsXG4gICAgICAgICAgICAgICAgNTYwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxMVwiOiBbXG4gICAgICAgICAgICAgICAgNDYyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxOVwiOiBbXG4gICAgICAgICAgICAgICAgNTY2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMFwiOiBbXG4gICAgICAgICAgICAgICAgNTY3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMVwiOiBbXG4gICAgICAgICAgICAgICAgNTM1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMlwiOiBbXG4gICAgICAgICAgICAgICAgNTM2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyM1wiOiBbXG4gICAgICAgICAgICAgICAgNTM3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNFwiOiBbXG4gICAgICAgICAgICAgICAgNTM4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNVwiOiBbXG4gICAgICAgICAgICAgICAgNTM5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNlwiOiBbXG4gICAgICAgICAgICAgICAgNTQwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyN1wiOiBbXG4gICAgICAgICAgICAgICAgNTQxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzNFwiOiBbXG4gICAgICAgICAgICAgICAgNTQyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzNVwiOiBbXG4gICAgICAgICAgICAgICAgNTQzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzNlwiOiBbXG4gICAgICAgICAgICAgICAgNTQ0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzN1wiOiBbXG4gICAgICAgICAgICAgICAgNDY0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzOFwiOiBbXG4gICAgICAgICAgICAgICAgNTczXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzOVwiOiBbXG4gICAgICAgICAgICAgICAgNDY2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI0MFwiOiBbXG4gICAgICAgICAgICAgICAgNDY3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI0MVwiOiBbXG4gICAgICAgICAgICAgICAgNDY4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI0MlwiOiBbXG4gICAgICAgICAgICAgICAgNDY5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI0M1wiOiBbXG4gICAgICAgICAgICAgICAgNDcwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI0NFwiOiBbXG4gICAgICAgICAgICAgICAgNDcxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI0NVwiOiBbXG4gICAgICAgICAgICAgICAgNDcyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI0NlwiOiBbXG4gICAgICAgICAgICAgICAgNDczXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI0N1wiOiBbXG4gICAgICAgICAgICAgICAgNDc0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI0OFwiOiBbXG4gICAgICAgICAgICAgICAgNDc1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI0OVwiOiBbXG4gICAgICAgICAgICAgICAgNDc2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI1MFwiOiBbXG4gICAgICAgICAgICAgICAgNDc3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI1MVwiOiBbXG4gICAgICAgICAgICAgICAgNDc4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI1MlwiOiBbXG4gICAgICAgICAgICAgICAgNDc5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI1M1wiOiBbXG4gICAgICAgICAgICAgICAgNDgwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI1NFwiOiBbXG4gICAgICAgICAgICAgICAgNDgxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI1NVwiOiBbXG4gICAgICAgICAgICAgICAgNDgyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI1NlwiOiBbXG4gICAgICAgICAgICAgICAgNDgzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI1N1wiOiBbXG4gICAgICAgICAgICAgICAgNDg0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI1OFwiOiBbXG4gICAgICAgICAgICAgICAgNDg1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI1OVwiOiBbXG4gICAgICAgICAgICAgICAgNDg2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI2MFwiOiBbXG4gICAgICAgICAgICAgICAgNDg3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI2MVwiOiBbXG4gICAgICAgICAgICAgICAgNDg4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI2OFwiOiBbXG4gICAgICAgICAgICAgICAgNDY2LFxuICAgICAgICAgICAgICAgIDU0NVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNjlcIjogW1xuICAgICAgICAgICAgICAgIDQ4OVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNzBcIjogW1xuICAgICAgICAgICAgICAgIDQ5MFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNzFcIjogW1xuICAgICAgICAgICAgICAgIDQ5MVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNzJcIjogW1xuICAgICAgICAgICAgICAgIDU3MFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNzRcIjogW1xuICAgICAgICAgICAgICAgIDQ3MixcbiAgICAgICAgICAgICAgICA1NTVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjc2XCI6IFtcbiAgICAgICAgICAgICAgICA0NzQsXG4gICAgICAgICAgICAgICAgNDI4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI3N1wiOiBbXG4gICAgICAgICAgICAgICAgNTcxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI3OFwiOiBbXG4gICAgICAgICAgICAgICAgNDY1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI3OVwiOiBbXG4gICAgICAgICAgICAgICAgNDY3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4MFwiOiBbXG4gICAgICAgICAgICAgICAgNDY4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4MVwiOiBbXG4gICAgICAgICAgICAgICAgNDY5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4MlwiOiBbXG4gICAgICAgICAgICAgICAgNDcwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4M1wiOiBbXG4gICAgICAgICAgICAgICAgNDcxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4NFwiOiBbXG4gICAgICAgICAgICAgICAgNDczXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4NVwiOiBbXG4gICAgICAgICAgICAgICAgNDc1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4NlwiOiBbXG4gICAgICAgICAgICAgICAgNDc2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4N1wiOiBbXG4gICAgICAgICAgICAgICAgNDc3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4OFwiOiBbXG4gICAgICAgICAgICAgICAgNDc4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4OVwiOiBbXG4gICAgICAgICAgICAgICAgNDc5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI5MFwiOiBbXG4gICAgICAgICAgICAgICAgNDgwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI5MVwiOiBbXG4gICAgICAgICAgICAgICAgNDgxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI5MlwiOiBbXG4gICAgICAgICAgICAgICAgNDgyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI5M1wiOiBbXG4gICAgICAgICAgICAgICAgNDgzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI5NFwiOiBbXG4gICAgICAgICAgICAgICAgNDg0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI5NVwiOiBbXG4gICAgICAgICAgICAgICAgNDg1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxMjhcIjogW1xuICAgICAgICAgICAgICAgIDQ4NlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTI5XCI6IFtcbiAgICAgICAgICAgICAgICA0ODdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjEzMFwiOiBbXG4gICAgICAgICAgICAgICAgNDg4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxMzFcIjogW1xuICAgICAgICAgICAgICAgIDQ4OVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTMyXCI6IFtcbiAgICAgICAgICAgICAgICA0OTBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjEzM1wiOiBbXG4gICAgICAgICAgICAgICAgNDkxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxMzRcIjogW1xuICAgICAgICAgICAgICAgIDU2OFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTM1XCI6IFtcbiAgICAgICAgICAgICAgICA1NzJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjEzNlwiOiBbXG4gICAgICAgICAgICAgICAgNTY5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxMzdcIjogW1xuICAgICAgICAgICAgICAgIDQ5MlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTM4XCI6IFtcbiAgICAgICAgICAgICAgICA0OTNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjEzOVwiOiBbXG4gICAgICAgICAgICAgICAgNDk0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNDBcIjogW1xuICAgICAgICAgICAgICAgIDQ5NVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTQxXCI6IFtcbiAgICAgICAgICAgICAgICA0OTZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE0MlwiOiBbXG4gICAgICAgICAgICAgICAgNDk3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNDNcIjogW1xuICAgICAgICAgICAgICAgIDQ5OFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTQ0XCI6IFtcbiAgICAgICAgICAgICAgICA0OTlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE0NVwiOiBbXG4gICAgICAgICAgICAgICAgNTAwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNDZcIjogW1xuICAgICAgICAgICAgICAgIDUwMVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTQ3XCI6IFtcbiAgICAgICAgICAgICAgICA1MDJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE0OFwiOiBbXG4gICAgICAgICAgICAgICAgNTAzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNDlcIjogW1xuICAgICAgICAgICAgICAgIDUwNFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTUwXCI6IFtcbiAgICAgICAgICAgICAgICA1MDVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE1M1wiOiBbXG4gICAgICAgICAgICAgICAgNTA2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNTRcIjogW1xuICAgICAgICAgICAgICAgIDUwN1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTU1XCI6IFtcbiAgICAgICAgICAgICAgICA1MDhcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE1NlwiOiBbXG4gICAgICAgICAgICAgICAgNTA5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNTdcIjogW1xuICAgICAgICAgICAgICAgIDUxMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTU4XCI6IFtcbiAgICAgICAgICAgICAgICA1MTFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE2MVwiOiBbXG4gICAgICAgICAgICAgICAgNDk4LFxuICAgICAgICAgICAgICAgIDU0NlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTYyXCI6IFtcbiAgICAgICAgICAgICAgICA0OTksXG4gICAgICAgICAgICAgICAgNTQ3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNjNcIjogW1xuICAgICAgICAgICAgICAgIDUwMCxcbiAgICAgICAgICAgICAgICA1NDhcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE2NFwiOiBbXG4gICAgICAgICAgICAgICAgNTAxLFxuICAgICAgICAgICAgICAgIDU0OVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTY1XCI6IFtcbiAgICAgICAgICAgICAgICA1MDIsXG4gICAgICAgICAgICAgICAgNTUwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNjZcIjogW1xuICAgICAgICAgICAgICAgIDUwMyxcbiAgICAgICAgICAgICAgICA1NTFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE2N1wiOiBbXG4gICAgICAgICAgICAgICAgNTEyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNjhcIjogW1xuICAgICAgICAgICAgICAgIDUxM1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTY5XCI6IFtcbiAgICAgICAgICAgICAgICA1MTRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE3MFwiOiBbXG4gICAgICAgICAgICAgICAgNTE1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNzFcIjogW1xuICAgICAgICAgICAgICAgIDUxNlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTcyXCI6IFtcbiAgICAgICAgICAgICAgICA1MTdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE3M1wiOiBbXG4gICAgICAgICAgICAgICAgNTE4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNzRcIjogW1xuICAgICAgICAgICAgICAgIDUxOVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTc1XCI6IFtcbiAgICAgICAgICAgICAgICA1MjBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE3NlwiOiBbXG4gICAgICAgICAgICAgICAgNTIxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNzdcIjogW1xuICAgICAgICAgICAgICAgIDUyMlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTc4XCI6IFtcbiAgICAgICAgICAgICAgICA1MjNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE3OVwiOiBbXG4gICAgICAgICAgICAgICAgNTI0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxODBcIjogW1xuICAgICAgICAgICAgICAgIDUyNVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTgxXCI6IFtcbiAgICAgICAgICAgICAgICA1MjZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE4MlwiOiBbXG4gICAgICAgICAgICAgICAgNTI3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxODVcIjogW1xuICAgICAgICAgICAgICAgIDUwNFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTg2XCI6IFtcbiAgICAgICAgICAgICAgICA1MDVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE4N1wiOiBbXG4gICAgICAgICAgICAgICAgNTA2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxODhcIjogW1xuICAgICAgICAgICAgICAgIDUwN1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTg5XCI6IFtcbiAgICAgICAgICAgICAgICA1MDhcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE5MFwiOiBbXG4gICAgICAgICAgICAgICAgNTA5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxOTFcIjogW1xuICAgICAgICAgICAgICAgIDUxMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTkyXCI6IFtcbiAgICAgICAgICAgICAgICA1MTFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE5NFwiOiBbXG4gICAgICAgICAgICAgICAgMzcwLFxuICAgICAgICAgICAgICAgIDU1MlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTk2XCI6IFtcbiAgICAgICAgICAgICAgICAzNjksXG4gICAgICAgICAgICAgICAgNTUzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxOThcIjogW1xuICAgICAgICAgICAgICAgIDM3MSxcbiAgICAgICAgICAgICAgICA1NTRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE5OVwiOiBbXG4gICAgICAgICAgICAgICAgNTEyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMDBcIjogW1xuICAgICAgICAgICAgICAgIDUxM1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjAxXCI6IFtcbiAgICAgICAgICAgICAgICA1MTRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIwMlwiOiBbXG4gICAgICAgICAgICAgICAgNTE1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMDNcIjogW1xuICAgICAgICAgICAgICAgIDUxNlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjA0XCI6IFtcbiAgICAgICAgICAgICAgICA1MTdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIwNVwiOiBbXG4gICAgICAgICAgICAgICAgNTE4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMDZcIjogW1xuICAgICAgICAgICAgICAgIDUxOVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjA3XCI6IFtcbiAgICAgICAgICAgICAgICA1MjBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIwOFwiOiBbXG4gICAgICAgICAgICAgICAgNTIxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMDlcIjogW1xuICAgICAgICAgICAgICAgIDUyMlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjEwXCI6IFtcbiAgICAgICAgICAgICAgICA1MjNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIxMVwiOiBbXG4gICAgICAgICAgICAgICAgNTI0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMTJcIjogW1xuICAgICAgICAgICAgICAgIDUyNVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjEzXCI6IFtcbiAgICAgICAgICAgICAgICA1MjZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIxNFwiOiBbXG4gICAgICAgICAgICAgICAgNTI3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMTVcIjogW1xuICAgICAgICAgICAgICAgIDUyOFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjE2XCI6IFtcbiAgICAgICAgICAgICAgICAzNzBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIxN1wiOiBbXG4gICAgICAgICAgICAgICAgMzY5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMThcIjogW1xuICAgICAgICAgICAgICAgIDM3MVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjE5XCI6IFtcbiAgICAgICAgICAgICAgICAzNzNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIyMFwiOiBbXG4gICAgICAgICAgICAgICAgMzczXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMjJcIjogW1xuICAgICAgICAgICAgICAgIDM4NixcbiAgICAgICAgICAgICAgICA1NTZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIyNFwiOiBbXG4gICAgICAgICAgICAgICAgMzg1LFxuICAgICAgICAgICAgICAgIDU1N1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjI2XCI6IFtcbiAgICAgICAgICAgICAgICAzODgsXG4gICAgICAgICAgICAgICAgNTU4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMjhcIjogW1xuICAgICAgICAgICAgICAgIDM4NyxcbiAgICAgICAgICAgICAgICA1NTlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIyOVwiOiBbXG4gICAgICAgICAgICAgICAgMzc1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMzBcIjogW1xuICAgICAgICAgICAgICAgIDM3NVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjMxXCI6IFtcbiAgICAgICAgICAgICAgICAzNzZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIzMlwiOiBbXG4gICAgICAgICAgICAgICAgMzc2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMzNcIjogW1xuICAgICAgICAgICAgICAgIDM3NFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjM0XCI6IFtcbiAgICAgICAgICAgICAgICAzNzRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIzNVwiOiBbXG4gICAgICAgICAgICAgICAgMzc3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMzZcIjogW1xuICAgICAgICAgICAgICAgIDM3N1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjM3XCI6IFtcbiAgICAgICAgICAgICAgICAzNzhcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIzOFwiOiBbXG4gICAgICAgICAgICAgICAgMzc4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMzlcIjogW1xuICAgICAgICAgICAgICAgIDM4MlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjQwXCI6IFtcbiAgICAgICAgICAgICAgICAzODJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI0MVwiOiBbXG4gICAgICAgICAgICAgICAgMzc5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNDJcIjogW1xuICAgICAgICAgICAgICAgIDM3OVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjQzXCI6IFtcbiAgICAgICAgICAgICAgICAzODFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI0NFwiOiBbXG4gICAgICAgICAgICAgICAgMzgxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNDVcIjogW1xuICAgICAgICAgICAgICAgIDM4NFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjQ4XCI6IFtcbiAgICAgICAgICAgICAgICAzODRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI0OVwiOiBbXG4gICAgICAgICAgICAgICAgMzgwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNTBcIjogW1xuICAgICAgICAgICAgICAgIDM4MFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjUxXCI6IFtcbiAgICAgICAgICAgICAgICAzODZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI1MlwiOiBbXG4gICAgICAgICAgICAgICAgMzg1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNTNcIjogW1xuICAgICAgICAgICAgICAgIDM4OFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjU0XCI6IFtcbiAgICAgICAgICAgICAgICAzODdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI1NVwiOiBbXG4gICAgICAgICAgICAgICAgMzkwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNTZcIjogW1xuICAgICAgICAgICAgICAgIDM5MFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjU3XCI6IFtcbiAgICAgICAgICAgICAgICAzODlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI1OFwiOiBbXG4gICAgICAgICAgICAgICAgMzg5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNTlcIjogW1xuICAgICAgICAgICAgICAgIDM5NFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjYwXCI6IFtcbiAgICAgICAgICAgICAgICAzOTRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI2MVwiOiBbXG4gICAgICAgICAgICAgICAgMzkyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNjJcIjogW1xuICAgICAgICAgICAgICAgIDM5MlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjY1XCI6IFtcbiAgICAgICAgICAgICAgICAzOTFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI2NlwiOiBbXG4gICAgICAgICAgICAgICAgMzkxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNjdcIjogW1xuICAgICAgICAgICAgICAgIDM5M1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjY4XCI6IFtcbiAgICAgICAgICAgICAgICAzOTNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI2OVwiOiBbXG4gICAgICAgICAgICAgICAgNDI4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNzBcIjogW1xuICAgICAgICAgICAgICAgIDQ3NFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjcxXCI6IFtcbiAgICAgICAgICAgICAgICAzOTVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI3MlwiOiBbXG4gICAgICAgICAgICAgICAgMzk1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNzNcIjogW1xuICAgICAgICAgICAgICAgIDM5NlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjc0XCI6IFtcbiAgICAgICAgICAgICAgICAzOTZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI3NVwiOiBbXG4gICAgICAgICAgICAgICAgMzk3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNzZcIjogW1xuICAgICAgICAgICAgICAgIDM5N1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjc3XCI6IFtcbiAgICAgICAgICAgICAgICAzOTlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI3OFwiOiBbXG4gICAgICAgICAgICAgICAgMzk5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNzlcIjogW1xuICAgICAgICAgICAgICAgIDM5OFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjgwXCI6IFtcbiAgICAgICAgICAgICAgICAzOThcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI4MVwiOiBbXG4gICAgICAgICAgICAgICAgNDAwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyODJcIjogW1xuICAgICAgICAgICAgICAgIDQwMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjgzXCI6IFtcbiAgICAgICAgICAgICAgICA0NTZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI4NFwiOiBbXG4gICAgICAgICAgICAgICAgNDU2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyODVcIjogW1xuICAgICAgICAgICAgICAgIDQwMVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjg2XCI6IFtcbiAgICAgICAgICAgICAgICA0MDFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI4N1wiOiBbXG4gICAgICAgICAgICAgICAgNDAzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyODhcIjogW1xuICAgICAgICAgICAgICAgIDQwM1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjg5XCI6IFtcbiAgICAgICAgICAgICAgICA0MDJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI5MFwiOiBbXG4gICAgICAgICAgICAgICAgNDAyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyOTFcIjogW1xuICAgICAgICAgICAgICAgIDM4M1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjkyXCI6IFtcbiAgICAgICAgICAgICAgICAzODNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI5M1wiOiBbXG4gICAgICAgICAgICAgICAgNDA2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyOTRcIjogW1xuICAgICAgICAgICAgICAgIDQwNlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjk1XCI6IFtcbiAgICAgICAgICAgICAgICA0MDRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI5NlwiOiBbXG4gICAgICAgICAgICAgICAgNDA0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyOTdcIjogW1xuICAgICAgICAgICAgICAgIDQwNVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjk4XCI6IFtcbiAgICAgICAgICAgICAgICA0MDVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI5OVwiOiBbXG4gICAgICAgICAgICAgICAgMzYwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMDBcIjogW1xuICAgICAgICAgICAgICAgIDM2MFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzAxXCI6IFtcbiAgICAgICAgICAgICAgICA0MDhcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMwMlwiOiBbXG4gICAgICAgICAgICAgICAgNDA4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMDNcIjogW1xuICAgICAgICAgICAgICAgIDQxMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzA0XCI6IFtcbiAgICAgICAgICAgICAgICA0MTBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMwNVwiOiBbXG4gICAgICAgICAgICAgICAgNDA5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMDZcIjogW1xuICAgICAgICAgICAgICAgIDQwOVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzA3XCI6IFtcbiAgICAgICAgICAgICAgICA0MTFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMwOFwiOiBbXG4gICAgICAgICAgICAgICAgNDExXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMDlcIjogW1xuICAgICAgICAgICAgICAgIDQxM1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzEwXCI6IFtcbiAgICAgICAgICAgICAgICA0MTNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMxMVwiOiBbXG4gICAgICAgICAgICAgICAgNDEyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMTJcIjogW1xuICAgICAgICAgICAgICAgIDQxMlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzEzXCI6IFtcbiAgICAgICAgICAgICAgICA0NTlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMxNFwiOiBbXG4gICAgICAgICAgICAgICAgNDU5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMTVcIjogW1xuICAgICAgICAgICAgICAgIDQxN1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzE2XCI6IFtcbiAgICAgICAgICAgICAgICA0MTdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMxOVwiOiBbXG4gICAgICAgICAgICAgICAgNDE2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMjBcIjogW1xuICAgICAgICAgICAgICAgIDQxNlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzIxXCI6IFtcbiAgICAgICAgICAgICAgICA0MTVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMyMlwiOiBbXG4gICAgICAgICAgICAgICAgNDE1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMjNcIjogW1xuICAgICAgICAgICAgICAgIDQyM1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzI0XCI6IFtcbiAgICAgICAgICAgICAgICA0MjNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMyNVwiOiBbXG4gICAgICAgICAgICAgICAgNDIwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMjhcIjogW1xuICAgICAgICAgICAgICAgIDQyMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzI5XCI6IFtcbiAgICAgICAgICAgICAgICA0MThcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMzMFwiOiBbXG4gICAgICAgICAgICAgICAgNDE4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMzFcIjogW1xuICAgICAgICAgICAgICAgIDQyMlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzMyXCI6IFtcbiAgICAgICAgICAgICAgICA0MjJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMzM1wiOiBbXG4gICAgICAgICAgICAgICAgNDE5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMzRcIjogW1xuICAgICAgICAgICAgICAgIDQxOVxuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBcImMyc2NcIjoge1xuICAgICAgICAgICAgXCI0XCI6IFtcbiAgICAgICAgICAgICAgICA0NjJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjlcIjogW1xuICAgICAgICAgICAgICAgIDQ2M1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTFcIjogW1xuICAgICAgICAgICAgICAgIDU2NlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTJcIjogW1xuICAgICAgICAgICAgICAgIDU2N1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzRcIjogW1xuICAgICAgICAgICAgICAgIDQ2NFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzVcIjogW1xuICAgICAgICAgICAgICAgIDU3M1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzZcIjogW1xuICAgICAgICAgICAgICAgIDQ2NlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzdcIjogW1xuICAgICAgICAgICAgICAgIDQ2N1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzhcIjogW1xuICAgICAgICAgICAgICAgIDQ2OFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzlcIjogW1xuICAgICAgICAgICAgICAgIDQ2OVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNDBcIjogW1xuICAgICAgICAgICAgICAgIDQ3MFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNDFcIjogW1xuICAgICAgICAgICAgICAgIDQ3MVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNDJcIjogW1xuICAgICAgICAgICAgICAgIDQ3MlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNDNcIjogW1xuICAgICAgICAgICAgICAgIDQ3M1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNDRcIjogW1xuICAgICAgICAgICAgICAgIDQ3NFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNDVcIjogW1xuICAgICAgICAgICAgICAgIDQ3NVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNDZcIjogW1xuICAgICAgICAgICAgICAgIDQ3NlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNDdcIjogW1xuICAgICAgICAgICAgICAgIDQ3N1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNDhcIjogW1xuICAgICAgICAgICAgICAgIDQ3OFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNDlcIjogW1xuICAgICAgICAgICAgICAgIDQ3OVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNTBcIjogW1xuICAgICAgICAgICAgICAgIDQ4MFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNTFcIjogW1xuICAgICAgICAgICAgICAgIDQ4MVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNTJcIjogW1xuICAgICAgICAgICAgICAgIDQ4MlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNTNcIjogW1xuICAgICAgICAgICAgICAgIDQ4M1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNTRcIjogW1xuICAgICAgICAgICAgICAgIDQ4NFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNTVcIjogW1xuICAgICAgICAgICAgICAgIDQ4NVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNTZcIjogW1xuICAgICAgICAgICAgICAgIDQ4NlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNTdcIjogW1xuICAgICAgICAgICAgICAgIDQ4N1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNThcIjogW1xuICAgICAgICAgICAgICAgIDQ4OFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNTlcIjogW1xuICAgICAgICAgICAgICAgIDQ4OVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNjBcIjogW1xuICAgICAgICAgICAgICAgIDQ5MFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNjFcIjogW1xuICAgICAgICAgICAgICAgIDQ5MVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNjJcIjogW1xuICAgICAgICAgICAgICAgIDU3MFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNjRcIjogW1xuICAgICAgICAgICAgICAgIDU3MVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiNjdcIjogW1xuICAgICAgICAgICAgICAgIDQ2NVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiOTRcIjogW1xuICAgICAgICAgICAgICAgIDU2OFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiOTVcIjogW1xuICAgICAgICAgICAgICAgIDU3MlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiOTZcIjogW1xuICAgICAgICAgICAgICAgIDU2OVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiOThcIjogW1xuICAgICAgICAgICAgICAgIDQ5MlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTA1XCI6IFtcbiAgICAgICAgICAgICAgICA0OTNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjExMlwiOiBbXG4gICAgICAgICAgICAgICAgNDk0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxMTdcIjogW1xuICAgICAgICAgICAgICAgIDQ5NVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTIxXCI6IFtcbiAgICAgICAgICAgICAgICA0OTZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjEyOFwiOiBbXG4gICAgICAgICAgICAgICAgNDk3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxMjlcIjogW1xuICAgICAgICAgICAgICAgIDQ5OFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTMwXCI6IFtcbiAgICAgICAgICAgICAgICA0OTlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjEzMVwiOiBbXG4gICAgICAgICAgICAgICAgNTAwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxMzJcIjogW1xuICAgICAgICAgICAgICAgIDUwMVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTMzXCI6IFtcbiAgICAgICAgICAgICAgICA1MDJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjEzNFwiOiBbXG4gICAgICAgICAgICAgICAgNTAzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxMzVcIjogW1xuICAgICAgICAgICAgICAgIDUwNFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTM2XCI6IFtcbiAgICAgICAgICAgICAgICA1MDVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjEzN1wiOiBbXG4gICAgICAgICAgICAgICAgNTA2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxMzhcIjogW1xuICAgICAgICAgICAgICAgIDUwN1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTM5XCI6IFtcbiAgICAgICAgICAgICAgICA1MDhcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE0MFwiOiBbXG4gICAgICAgICAgICAgICAgNTA5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNDFcIjogW1xuICAgICAgICAgICAgICAgIDUxMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTQyXCI6IFtcbiAgICAgICAgICAgICAgICA1MTFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE0M1wiOiBbXG4gICAgICAgICAgICAgICAgNTEyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNDRcIjogW1xuICAgICAgICAgICAgICAgIDUxM1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTQ1XCI6IFtcbiAgICAgICAgICAgICAgICA1MTRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE0NlwiOiBbXG4gICAgICAgICAgICAgICAgNTE1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNDdcIjogW1xuICAgICAgICAgICAgICAgIDUxNlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTQ4XCI6IFtcbiAgICAgICAgICAgICAgICA1MTdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE0OVwiOiBbXG4gICAgICAgICAgICAgICAgNTE4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNTBcIjogW1xuICAgICAgICAgICAgICAgIDUxOVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTUxXCI6IFtcbiAgICAgICAgICAgICAgICA1MjBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE1M1wiOiBbXG4gICAgICAgICAgICAgICAgNTIxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNTRcIjogW1xuICAgICAgICAgICAgICAgIDUyMlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTU1XCI6IFtcbiAgICAgICAgICAgICAgICA1MjNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE1NlwiOiBbXG4gICAgICAgICAgICAgICAgNTI0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNTdcIjogW1xuICAgICAgICAgICAgICAgIDUyNVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTU4XCI6IFtcbiAgICAgICAgICAgICAgICA1MjZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE1OVwiOiBbXG4gICAgICAgICAgICAgICAgNTI3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxOTNcIjogW1xuICAgICAgICAgICAgICAgIDM3MFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTk1XCI6IFtcbiAgICAgICAgICAgICAgICAzNjlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE5N1wiOiBbXG4gICAgICAgICAgICAgICAgMzcxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxOTlcIjogW1xuICAgICAgICAgICAgICAgIDM3M1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjAxXCI6IFtcbiAgICAgICAgICAgICAgICAzNzVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIwM1wiOiBbXG4gICAgICAgICAgICAgICAgMzc2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMDVcIjogW1xuICAgICAgICAgICAgICAgIDM3NFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjA3XCI6IFtcbiAgICAgICAgICAgICAgICAzNzdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIwOVwiOiBbXG4gICAgICAgICAgICAgICAgMzc4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMTFcIjogW1xuICAgICAgICAgICAgICAgIDM4MlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjEzXCI6IFtcbiAgICAgICAgICAgICAgICAzNzlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIxNVwiOiBbXG4gICAgICAgICAgICAgICAgMzgxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMTdcIjogW1xuICAgICAgICAgICAgICAgIDM4NFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjE5XCI6IFtcbiAgICAgICAgICAgICAgICAzODBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIyMVwiOiBbXG4gICAgICAgICAgICAgICAgMzg2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMjNcIjogW1xuICAgICAgICAgICAgICAgIDM4NVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjI1XCI6IFtcbiAgICAgICAgICAgICAgICAzODhcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIyN1wiOiBbXG4gICAgICAgICAgICAgICAgMzg3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMjlcIjogW1xuICAgICAgICAgICAgICAgIDM5MFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjMxXCI6IFtcbiAgICAgICAgICAgICAgICAzODlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIzM1wiOiBbXG4gICAgICAgICAgICAgICAgMzk0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMzVcIjogW1xuICAgICAgICAgICAgICAgIDM5MlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjM3XCI6IFtcbiAgICAgICAgICAgICAgICAzOTFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIzOVwiOiBbXG4gICAgICAgICAgICAgICAgMzkzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNDFcIjogW1xuICAgICAgICAgICAgICAgIDQyOFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjQzXCI6IFtcbiAgICAgICAgICAgICAgICAzOTVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI0NVwiOiBbXG4gICAgICAgICAgICAgICAgMzk2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNDhcIjogW1xuICAgICAgICAgICAgICAgIDM5N1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjUwXCI6IFtcbiAgICAgICAgICAgICAgICAzOTlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI1MlwiOiBbXG4gICAgICAgICAgICAgICAgMzk4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNTRcIjogW1xuICAgICAgICAgICAgICAgIDQwMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjU2XCI6IFtcbiAgICAgICAgICAgICAgICA0NTZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI1OFwiOiBbXG4gICAgICAgICAgICAgICAgNDAxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNjBcIjogW1xuICAgICAgICAgICAgICAgIDQwM1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjYyXCI6IFtcbiAgICAgICAgICAgICAgICA0MDJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI2NVwiOiBbXG4gICAgICAgICAgICAgICAgMzgzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNjdcIjogW1xuICAgICAgICAgICAgICAgIDQwNlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjY5XCI6IFtcbiAgICAgICAgICAgICAgICA0MDRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI3MVwiOiBbXG4gICAgICAgICAgICAgICAgNDA1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNzNcIjogW1xuICAgICAgICAgICAgICAgIDM2MFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjc1XCI6IFtcbiAgICAgICAgICAgICAgICA0MDhcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI3N1wiOiBbXG4gICAgICAgICAgICAgICAgNDEwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNzlcIjogW1xuICAgICAgICAgICAgICAgIDQwOVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjgxXCI6IFtcbiAgICAgICAgICAgICAgICA0MTFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI4M1wiOiBbXG4gICAgICAgICAgICAgICAgNDEzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyODVcIjogW1xuICAgICAgICAgICAgICAgIDQxMlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjg3XCI6IFtcbiAgICAgICAgICAgICAgICA0NTlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI4OVwiOiBbXG4gICAgICAgICAgICAgICAgNDE3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyOTFcIjogW1xuICAgICAgICAgICAgICAgIDQxNlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjkzXCI6IFtcbiAgICAgICAgICAgICAgICA0MTVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI5NVwiOiBbXG4gICAgICAgICAgICAgICAgNDIzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyOTdcIjogW1xuICAgICAgICAgICAgICAgIDQyMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjk5XCI6IFtcbiAgICAgICAgICAgICAgICA0MThcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMwMVwiOiBbXG4gICAgICAgICAgICAgICAgNDIyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMDNcIjogW1xuICAgICAgICAgICAgICAgIDQxOVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzA1XCI6IFtcbiAgICAgICAgICAgICAgICA0MjFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMwN1wiOiBbXG4gICAgICAgICAgICAgICAgNDI0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMDlcIjogW1xuICAgICAgICAgICAgICAgIDQyNVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzExXCI6IFtcbiAgICAgICAgICAgICAgICA1MjhcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMxMlwiOiBbXG4gICAgICAgICAgICAgICAgNDI2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMTRcIjogW1xuICAgICAgICAgICAgICAgIDQyN1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzE2XCI6IFtcbiAgICAgICAgICAgICAgICA0NjFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMxOVwiOiBbXG4gICAgICAgICAgICAgICAgMzcyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMjFcIjogW1xuICAgICAgICAgICAgICAgIDQwN1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzIzXCI6IFtcbiAgICAgICAgICAgICAgICA0MTRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMyNVwiOiBbXG4gICAgICAgICAgICAgICAgNTc1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMjhcIjogW1xuICAgICAgICAgICAgICAgIDQ1M1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzI5XCI6IFtcbiAgICAgICAgICAgICAgICA0NTJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMzMFwiOiBbXG4gICAgICAgICAgICAgICAgNDUxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMzFcIjogW1xuICAgICAgICAgICAgICAgIDQ1NFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzMyXCI6IFtcbiAgICAgICAgICAgICAgICA0NThcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMzM1wiOiBbXG4gICAgICAgICAgICAgICAgNDU3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMzRcIjogW1xuICAgICAgICAgICAgICAgIDQ2MFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzM1XCI6IFtcbiAgICAgICAgICAgICAgICA0NTVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjU2MFwiOiBbXG4gICAgICAgICAgICAgICAgNTc0XG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIFwiY2FzZVwiOiB7XG4gICAgICAgICAgICBcIjExXCI6IFtcbiAgICAgICAgICAgICAgICA0MjlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjEyXCI6IFtcbiAgICAgICAgICAgICAgICA0MzBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE2XCI6IFtcbiAgICAgICAgICAgICAgICA0NDFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE4XCI6IFtcbiAgICAgICAgICAgICAgICA1NjFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjM1XCI6IFtcbiAgICAgICAgICAgICAgICAzNjhcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjYyXCI6IFtcbiAgICAgICAgICAgICAgICA0MzFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjYzXCI6IFtcbiAgICAgICAgICAgICAgICA1NjJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjY0XCI6IFtcbiAgICAgICAgICAgICAgICA0MzJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjk0XCI6IFtcbiAgICAgICAgICAgICAgICA0MzNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjk1XCI6IFtcbiAgICAgICAgICAgICAgICA1NjNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjk2XCI6IFtcbiAgICAgICAgICAgICAgICA0MzRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjk4XCI6IFtcbiAgICAgICAgICAgICAgICA0MzVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjEwM1wiOiBbXG4gICAgICAgICAgICAgICAgNTY0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxMDhcIjogW1xuICAgICAgICAgICAgICAgIDQzN1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTIwXCI6IFtcbiAgICAgICAgICAgICAgICA0NDRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjEyNFwiOiBbXG4gICAgICAgICAgICAgICAgNDM4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxMjhcIjogW1xuICAgICAgICAgICAgICAgIDQzNlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzM2XCI6IFtcbiAgICAgICAgICAgICAgICA0NDJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMzN1wiOiBbXG4gICAgICAgICAgICAgICAgNDQzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzNDZcIjogW1xuICAgICAgICAgICAgICAgIDU2NVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzQ5XCI6IFtcbiAgICAgICAgICAgICAgICA0MzlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjM1MFwiOiBbXG4gICAgICAgICAgICAgICAgNDQwXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIFwiZGxpZ1wiOiB7XG4gICAgICAgICAgICBcIjU1XCI6IHtcbiAgICAgICAgICAgICAgICBcIjc1XCI6IDU3NlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiNzBcIjoge1xuICAgICAgICAgICAgICAgIFwiODdcIjogNTc3XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCI4NlwiOiB7XG4gICAgICAgICAgICAgICAgXCI4N1wiOiA1MzRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJsaWdhXCI6IHtcbiAgICAgICAgICAgIFwiNzNcIjoge1xuICAgICAgICAgICAgICAgIFwiNjlcIjogNTgzLFxuICAgICAgICAgICAgICAgIFwiNzNcIjogNTI5LFxuICAgICAgICAgICAgICAgIFwiNzVcIjogNTg0LFxuICAgICAgICAgICAgICAgIFwiNzZcIjogNTMwLFxuICAgICAgICAgICAgICAgIFwiNzdcIjogNTg1LFxuICAgICAgICAgICAgICAgIFwiNzhcIjogNTg2LFxuICAgICAgICAgICAgICAgIFwiNzlcIjogNTMxLFxuICAgICAgICAgICAgICAgIFwiODdcIjogNTg3XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCI4N1wiOiB7XG4gICAgICAgICAgICAgICAgXCI4N1wiOiA1ODhcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJsbnVtXCI6IHtcbiAgICAgICAgICAgIFwiMTlcIjogW1xuICAgICAgICAgICAgICAgIDUzNVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjBcIjogW1xuICAgICAgICAgICAgICAgIDUzNlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjFcIjogW1xuICAgICAgICAgICAgICAgIDUzN1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjJcIjogW1xuICAgICAgICAgICAgICAgIDUzOFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjNcIjogW1xuICAgICAgICAgICAgICAgIDUzOVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjRcIjogW1xuICAgICAgICAgICAgICAgIDU0MFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjVcIjogW1xuICAgICAgICAgICAgICAgIDU0MVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjZcIjogW1xuICAgICAgICAgICAgICAgIDU0MlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjdcIjogW1xuICAgICAgICAgICAgICAgIDU0M1xuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBcInNhbHRcIjoge1xuICAgICAgICAgICAgXCI2OFwiOiBbXG4gICAgICAgICAgICAgICAgNTQ1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI3NFwiOiBbXG4gICAgICAgICAgICAgICAgNTU1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNjFcIjogW1xuICAgICAgICAgICAgICAgIDU0NlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTYyXCI6IFtcbiAgICAgICAgICAgICAgICA1NDdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE2M1wiOiBbXG4gICAgICAgICAgICAgICAgNTQ4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNjRcIjogW1xuICAgICAgICAgICAgICAgIDU0OVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTY1XCI6IFtcbiAgICAgICAgICAgICAgICA1NTBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE2NlwiOiBbXG4gICAgICAgICAgICAgICAgNTUxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxOTRcIjogW1xuICAgICAgICAgICAgICAgIDU1MlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTk2XCI6IFtcbiAgICAgICAgICAgICAgICA1NTNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE5OFwiOiBbXG4gICAgICAgICAgICAgICAgNTU0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMjJcIjogW1xuICAgICAgICAgICAgICAgIDU1NlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjI0XCI6IFtcbiAgICAgICAgICAgICAgICA1NTdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIyNlwiOiBbXG4gICAgICAgICAgICAgICAgNTU4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMjhcIjogW1xuICAgICAgICAgICAgICAgIDU1OVxuICAgICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBcInNtY3BcIjoge1xuICAgICAgICAgICAgXCI2OFwiOiBbXG4gICAgICAgICAgICAgICAgNDY2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI2OVwiOiBbXG4gICAgICAgICAgICAgICAgNDY3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI3MFwiOiBbXG4gICAgICAgICAgICAgICAgNDY4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI3MVwiOiBbXG4gICAgICAgICAgICAgICAgNDY5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI3MlwiOiBbXG4gICAgICAgICAgICAgICAgNDcwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI3M1wiOiBbXG4gICAgICAgICAgICAgICAgNDcxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI3NFwiOiBbXG4gICAgICAgICAgICAgICAgNDcyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI3NVwiOiBbXG4gICAgICAgICAgICAgICAgNDczXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI3NlwiOiBbXG4gICAgICAgICAgICAgICAgNDc0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI3N1wiOiBbXG4gICAgICAgICAgICAgICAgNDc1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI3OFwiOiBbXG4gICAgICAgICAgICAgICAgNDc2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI3OVwiOiBbXG4gICAgICAgICAgICAgICAgNDc3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4MFwiOiBbXG4gICAgICAgICAgICAgICAgNDc4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4MVwiOiBbXG4gICAgICAgICAgICAgICAgNDc5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4MlwiOiBbXG4gICAgICAgICAgICAgICAgNDgwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4M1wiOiBbXG4gICAgICAgICAgICAgICAgNDgxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4NFwiOiBbXG4gICAgICAgICAgICAgICAgNDgyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4NVwiOiBbXG4gICAgICAgICAgICAgICAgNDgzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4NlwiOiBbXG4gICAgICAgICAgICAgICAgNDg0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4N1wiOiBbXG4gICAgICAgICAgICAgICAgNDg1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4OFwiOiBbXG4gICAgICAgICAgICAgICAgNDg2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI4OVwiOiBbXG4gICAgICAgICAgICAgICAgNDg3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI5MFwiOiBbXG4gICAgICAgICAgICAgICAgNDg4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI5MVwiOiBbXG4gICAgICAgICAgICAgICAgNDg5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI5MlwiOiBbXG4gICAgICAgICAgICAgICAgNDkwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCI5M1wiOiBbXG4gICAgICAgICAgICAgICAgNDkxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNjFcIjogW1xuICAgICAgICAgICAgICAgIDQ5OFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTYyXCI6IFtcbiAgICAgICAgICAgICAgICA0OTlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE2M1wiOiBbXG4gICAgICAgICAgICAgICAgNTAwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNjRcIjogW1xuICAgICAgICAgICAgICAgIDUwMVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTY1XCI6IFtcbiAgICAgICAgICAgICAgICA1MDJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE2NlwiOiBbXG4gICAgICAgICAgICAgICAgNTAzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNjdcIjogW1xuICAgICAgICAgICAgICAgIDUwNFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTY4XCI6IFtcbiAgICAgICAgICAgICAgICA1MDVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE2OVwiOiBbXG4gICAgICAgICAgICAgICAgNTA2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNzBcIjogW1xuICAgICAgICAgICAgICAgIDUwN1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTcxXCI6IFtcbiAgICAgICAgICAgICAgICA1MDhcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE3MlwiOiBbXG4gICAgICAgICAgICAgICAgNTA5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNzNcIjogW1xuICAgICAgICAgICAgICAgIDUxMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTc0XCI6IFtcbiAgICAgICAgICAgICAgICA1MTFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE3NVwiOiBbXG4gICAgICAgICAgICAgICAgNTEyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNzZcIjogW1xuICAgICAgICAgICAgICAgIDUxM1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTc3XCI6IFtcbiAgICAgICAgICAgICAgICA1MTRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE3OFwiOiBbXG4gICAgICAgICAgICAgICAgNTE1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxNzlcIjogW1xuICAgICAgICAgICAgICAgIDUxNlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTgwXCI6IFtcbiAgICAgICAgICAgICAgICA1MTdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE4MVwiOiBbXG4gICAgICAgICAgICAgICAgNTE4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxODJcIjogW1xuICAgICAgICAgICAgICAgIDUxOVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTgzXCI6IFtcbiAgICAgICAgICAgICAgICA1MjBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE4NVwiOiBbXG4gICAgICAgICAgICAgICAgNTIxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxODZcIjogW1xuICAgICAgICAgICAgICAgIDUyMlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTg3XCI6IFtcbiAgICAgICAgICAgICAgICA1MjNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE4OFwiOiBbXG4gICAgICAgICAgICAgICAgNTI0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxODlcIjogW1xuICAgICAgICAgICAgICAgIDUyNVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTkwXCI6IFtcbiAgICAgICAgICAgICAgICA1MjZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE5MVwiOiBbXG4gICAgICAgICAgICAgICAgNTI3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxOTJcIjogW1xuICAgICAgICAgICAgICAgIDUyOFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMTk0XCI6IFtcbiAgICAgICAgICAgICAgICAzNzBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjE5NlwiOiBbXG4gICAgICAgICAgICAgICAgMzY5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIxOThcIjogW1xuICAgICAgICAgICAgICAgIDM3MVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjAwXCI6IFtcbiAgICAgICAgICAgICAgICAzNzNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIwMlwiOiBbXG4gICAgICAgICAgICAgICAgMzc1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMDRcIjogW1xuICAgICAgICAgICAgICAgIDM3NlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjA2XCI6IFtcbiAgICAgICAgICAgICAgICAzNzRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIwOFwiOiBbXG4gICAgICAgICAgICAgICAgMzc3XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMTBcIjogW1xuICAgICAgICAgICAgICAgIDM3OFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjEyXCI6IFtcbiAgICAgICAgICAgICAgICAzODJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIxNFwiOiBbXG4gICAgICAgICAgICAgICAgMzc5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMTZcIjogW1xuICAgICAgICAgICAgICAgIDM4MVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjE4XCI6IFtcbiAgICAgICAgICAgICAgICAzODRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIyMFwiOiBbXG4gICAgICAgICAgICAgICAgMzgwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMjJcIjogW1xuICAgICAgICAgICAgICAgIDM4NlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjI0XCI6IFtcbiAgICAgICAgICAgICAgICAzODVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIyNlwiOiBbXG4gICAgICAgICAgICAgICAgMzg4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMjhcIjogW1xuICAgICAgICAgICAgICAgIDM4N1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjMwXCI6IFtcbiAgICAgICAgICAgICAgICAzOTBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIzMlwiOiBbXG4gICAgICAgICAgICAgICAgMzg5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyMzRcIjogW1xuICAgICAgICAgICAgICAgIDM5NFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjM2XCI6IFtcbiAgICAgICAgICAgICAgICAzOTJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjIzOFwiOiBbXG4gICAgICAgICAgICAgICAgMzkxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNDBcIjogW1xuICAgICAgICAgICAgICAgIDM5M1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjQyXCI6IFtcbiAgICAgICAgICAgICAgICA0NzRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI0NFwiOiBbXG4gICAgICAgICAgICAgICAgMzk1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNDZcIjogW1xuICAgICAgICAgICAgICAgIDM5NlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjQ5XCI6IFtcbiAgICAgICAgICAgICAgICAzOTdcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI1MVwiOiBbXG4gICAgICAgICAgICAgICAgMzk5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNTNcIjogW1xuICAgICAgICAgICAgICAgIDM5OFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjU1XCI6IFtcbiAgICAgICAgICAgICAgICA0MDBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI1N1wiOiBbXG4gICAgICAgICAgICAgICAgNDU2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNTlcIjogW1xuICAgICAgICAgICAgICAgIDQwMVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjYxXCI6IFtcbiAgICAgICAgICAgICAgICA0MDNcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI2M1wiOiBbXG4gICAgICAgICAgICAgICAgNDAyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNjZcIjogW1xuICAgICAgICAgICAgICAgIDM4M1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjY4XCI6IFtcbiAgICAgICAgICAgICAgICA0MDZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI3MFwiOiBbXG4gICAgICAgICAgICAgICAgNDA0XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNzJcIjogW1xuICAgICAgICAgICAgICAgIDQwNVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjc0XCI6IFtcbiAgICAgICAgICAgICAgICAzNjBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI3NlwiOiBbXG4gICAgICAgICAgICAgICAgNDA4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyNzhcIjogW1xuICAgICAgICAgICAgICAgIDQxMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjgwXCI6IFtcbiAgICAgICAgICAgICAgICA0MDlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI4MlwiOiBbXG4gICAgICAgICAgICAgICAgNDExXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyODRcIjogW1xuICAgICAgICAgICAgICAgIDQxM1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjg2XCI6IFtcbiAgICAgICAgICAgICAgICA0MTJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI4OFwiOiBbXG4gICAgICAgICAgICAgICAgNDU5XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyOTBcIjogW1xuICAgICAgICAgICAgICAgIDQxN1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjkyXCI6IFtcbiAgICAgICAgICAgICAgICA0MTZcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjI5NFwiOiBbXG4gICAgICAgICAgICAgICAgNDE1XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIyOTZcIjogW1xuICAgICAgICAgICAgICAgIDQyM1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMjk4XCI6IFtcbiAgICAgICAgICAgICAgICA0MjBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMwMFwiOiBbXG4gICAgICAgICAgICAgICAgNDE4XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMDJcIjogW1xuICAgICAgICAgICAgICAgIDQyMlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzA0XCI6IFtcbiAgICAgICAgICAgICAgICA0MTlcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMwNlwiOiBbXG4gICAgICAgICAgICAgICAgNDIxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMDhcIjogW1xuICAgICAgICAgICAgICAgIDQyNFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzEwXCI6IFtcbiAgICAgICAgICAgICAgICA0MjVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMxM1wiOiBbXG4gICAgICAgICAgICAgICAgNDI2XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMTVcIjogW1xuICAgICAgICAgICAgICAgIDQyN1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzE3XCI6IFtcbiAgICAgICAgICAgICAgICA0NjFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMyMFwiOiBbXG4gICAgICAgICAgICAgICAgMzcyXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCIzMjJcIjogW1xuICAgICAgICAgICAgICAgIDQwN1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiMzI0XCI6IFtcbiAgICAgICAgICAgICAgICA0MTRcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIjMyNlwiOiBbXG4gICAgICAgICAgICAgICAgNTc1XG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIFwic3MwMVwiOiB7XG4gICAgICAgICAgICBcIjlcIjogW1xuICAgICAgICAgICAgICAgIDU2MFxuICAgICAgICAgICAgXVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcImduYW1lc1wiOiB7XG4gICAgICAgIFwiMFwiOiBcIi5ub3RkZWZcIixcbiAgICAgICAgXCIxXCI6IFwiLm51bGxcIixcbiAgICAgICAgXCIyXCI6IFwibm9ubWFya2luZ3JldHVyblwiLFxuICAgICAgICBcIjNcIjogXCJzcGFjZVwiLFxuICAgICAgICBcIjRcIjogXCJleGNsYW1cIixcbiAgICAgICAgXCI1XCI6IFwicXVvdGVkYmxcIixcbiAgICAgICAgXCI2XCI6IFwibnVtYmVyc2lnblwiLFxuICAgICAgICBcIjdcIjogXCJkb2xsYXJcIixcbiAgICAgICAgXCI4XCI6IFwicGVyY2VudFwiLFxuICAgICAgICBcIjlcIjogXCJhbXBlcnNhbmRcIixcbiAgICAgICAgXCIxMFwiOiBcInF1b3Rlc2luZ2xlXCIsXG4gICAgICAgIFwiMTFcIjogXCJwYXJlbmxlZnRcIixcbiAgICAgICAgXCIxMlwiOiBcInBhcmVucmlnaHRcIixcbiAgICAgICAgXCIxM1wiOiBcImFzdGVyaXNrXCIsXG4gICAgICAgIFwiMTRcIjogXCJwbHVzXCIsXG4gICAgICAgIFwiMTVcIjogXCJjb21tYVwiLFxuICAgICAgICBcIjE2XCI6IFwiaHlwaGVuXCIsXG4gICAgICAgIFwiMTdcIjogXCJwZXJpb2RcIixcbiAgICAgICAgXCIxOFwiOiBcInNsYXNoXCIsXG4gICAgICAgIFwiMTlcIjogXCJ6ZXJvXCIsXG4gICAgICAgIFwiMjBcIjogXCJvbmVcIixcbiAgICAgICAgXCIyMVwiOiBcInR3b1wiLFxuICAgICAgICBcIjIyXCI6IFwidGhyZWVcIixcbiAgICAgICAgXCIyM1wiOiBcImZvdXJcIixcbiAgICAgICAgXCIyNFwiOiBcImZpdmVcIixcbiAgICAgICAgXCIyNVwiOiBcInNpeFwiLFxuICAgICAgICBcIjI2XCI6IFwic2V2ZW5cIixcbiAgICAgICAgXCIyN1wiOiBcImVpZ2h0XCIsXG4gICAgICAgIFwiMjhcIjogXCJuaW5lXCIsXG4gICAgICAgIFwiMjlcIjogXCJjb2xvblwiLFxuICAgICAgICBcIjMwXCI6IFwic2VtaWNvbG9uXCIsXG4gICAgICAgIFwiMzFcIjogXCJsZXNzXCIsXG4gICAgICAgIFwiMzJcIjogXCJlcXVhbFwiLFxuICAgICAgICBcIjMzXCI6IFwiZ3JlYXRlclwiLFxuICAgICAgICBcIjM0XCI6IFwicXVlc3Rpb25cIixcbiAgICAgICAgXCIzNVwiOiBcImF0XCIsXG4gICAgICAgIFwiMzZcIjogXCJBXCIsXG4gICAgICAgIFwiMzdcIjogXCJCXCIsXG4gICAgICAgIFwiMzhcIjogXCJDXCIsXG4gICAgICAgIFwiMzlcIjogXCJEXCIsXG4gICAgICAgIFwiNDBcIjogXCJFXCIsXG4gICAgICAgIFwiNDFcIjogXCJGXCIsXG4gICAgICAgIFwiNDJcIjogXCJHXCIsXG4gICAgICAgIFwiNDNcIjogXCJIXCIsXG4gICAgICAgIFwiNDRcIjogXCJJXCIsXG4gICAgICAgIFwiNDVcIjogXCJKXCIsXG4gICAgICAgIFwiNDZcIjogXCJLXCIsXG4gICAgICAgIFwiNDdcIjogXCJMXCIsXG4gICAgICAgIFwiNDhcIjogXCJNXCIsXG4gICAgICAgIFwiNDlcIjogXCJOXCIsXG4gICAgICAgIFwiNTBcIjogXCJPXCIsXG4gICAgICAgIFwiNTFcIjogXCJQXCIsXG4gICAgICAgIFwiNTJcIjogXCJRXCIsXG4gICAgICAgIFwiNTNcIjogXCJSXCIsXG4gICAgICAgIFwiNTRcIjogXCJTXCIsXG4gICAgICAgIFwiNTVcIjogXCJUXCIsXG4gICAgICAgIFwiNTZcIjogXCJVXCIsXG4gICAgICAgIFwiNTdcIjogXCJWXCIsXG4gICAgICAgIFwiNThcIjogXCJXXCIsXG4gICAgICAgIFwiNTlcIjogXCJYXCIsXG4gICAgICAgIFwiNjBcIjogXCJZXCIsXG4gICAgICAgIFwiNjFcIjogXCJaXCIsXG4gICAgICAgIFwiNjJcIjogXCJicmFja2V0bGVmdFwiLFxuICAgICAgICBcIjYzXCI6IFwiYmFja3NsYXNoXCIsXG4gICAgICAgIFwiNjRcIjogXCJicmFja2V0cmlnaHRcIixcbiAgICAgICAgXCI2NVwiOiBcImFzY2lpY2lyY3VtXCIsXG4gICAgICAgIFwiNjZcIjogXCJ1bmRlcnNjb3JlXCIsXG4gICAgICAgIFwiNjdcIjogXCJncmF2ZVwiLFxuICAgICAgICBcIjY4XCI6IFwiYVwiLFxuICAgICAgICBcIjY5XCI6IFwiYlwiLFxuICAgICAgICBcIjcwXCI6IFwiY1wiLFxuICAgICAgICBcIjcxXCI6IFwiZFwiLFxuICAgICAgICBcIjcyXCI6IFwiZVwiLFxuICAgICAgICBcIjczXCI6IFwiZlwiLFxuICAgICAgICBcIjc0XCI6IFwiZ1wiLFxuICAgICAgICBcIjc1XCI6IFwiaFwiLFxuICAgICAgICBcIjc2XCI6IFwiaVwiLFxuICAgICAgICBcIjc3XCI6IFwialwiLFxuICAgICAgICBcIjc4XCI6IFwia1wiLFxuICAgICAgICBcIjc5XCI6IFwibFwiLFxuICAgICAgICBcIjgwXCI6IFwibVwiLFxuICAgICAgICBcIjgxXCI6IFwiblwiLFxuICAgICAgICBcIjgyXCI6IFwib1wiLFxuICAgICAgICBcIjgzXCI6IFwicFwiLFxuICAgICAgICBcIjg0XCI6IFwicVwiLFxuICAgICAgICBcIjg1XCI6IFwiclwiLFxuICAgICAgICBcIjg2XCI6IFwic1wiLFxuICAgICAgICBcIjg3XCI6IFwidFwiLFxuICAgICAgICBcIjg4XCI6IFwidVwiLFxuICAgICAgICBcIjg5XCI6IFwidlwiLFxuICAgICAgICBcIjkwXCI6IFwid1wiLFxuICAgICAgICBcIjkxXCI6IFwieFwiLFxuICAgICAgICBcIjkyXCI6IFwieVwiLFxuICAgICAgICBcIjkzXCI6IFwielwiLFxuICAgICAgICBcIjk0XCI6IFwiYnJhY2VsZWZ0XCIsXG4gICAgICAgIFwiOTVcIjogXCJiYXJcIixcbiAgICAgICAgXCI5NlwiOiBcImJyYWNlcmlnaHRcIixcbiAgICAgICAgXCI5N1wiOiBcImFzY2lpdGlsZGVcIixcbiAgICAgICAgXCI5OFwiOiBcImV4Y2xhbWRvd25cIixcbiAgICAgICAgXCI5OVwiOiBcImNlbnRcIixcbiAgICAgICAgXCIxMDBcIjogXCJzdGVybGluZ1wiLFxuICAgICAgICBcIjEwMVwiOiBcImN1cnJlbmN5XCIsXG4gICAgICAgIFwiMTAyXCI6IFwieWVuXCIsXG4gICAgICAgIFwiMTAzXCI6IFwiYnJva2VuYmFyXCIsXG4gICAgICAgIFwiMTA0XCI6IFwic2VjdGlvblwiLFxuICAgICAgICBcIjEwNVwiOiBcImRpZXJlc2lzXCIsXG4gICAgICAgIFwiMTA2XCI6IFwiY29weXJpZ2h0XCIsXG4gICAgICAgIFwiMTA3XCI6IFwib3JkZmVtaW5pbmVcIixcbiAgICAgICAgXCIxMDhcIjogXCJndWlsbGVtb3RsZWZ0XCIsXG4gICAgICAgIFwiMTA5XCI6IFwibG9naWNhbG5vdFwiLFxuICAgICAgICBcIjExMFwiOiBcInVuaTAwQURcIixcbiAgICAgICAgXCIxMTFcIjogXCJyZWdpc3RlcmVkXCIsXG4gICAgICAgIFwiMTEyXCI6IFwibWFjcm9uXCIsXG4gICAgICAgIFwiMTEzXCI6IFwiZGVncmVlXCIsXG4gICAgICAgIFwiMTE0XCI6IFwicGx1c21pbnVzXCIsXG4gICAgICAgIFwiMTE1XCI6IFwidHdvc3VwZXJpb3JcIixcbiAgICAgICAgXCIxMTZcIjogXCJ0aHJlZXN1cGVyaW9yXCIsXG4gICAgICAgIFwiMTE3XCI6IFwiYWN1dGVcIixcbiAgICAgICAgXCIxMThcIjogXCJtdVwiLFxuICAgICAgICBcIjExOVwiOiBcInBhcmFncmFwaFwiLFxuICAgICAgICBcIjEyMFwiOiBcInBlcmlvZGNlbnRlcmVkXCIsXG4gICAgICAgIFwiMTIxXCI6IFwiY2VkaWxsYVwiLFxuICAgICAgICBcIjEyMlwiOiBcIm9uZXN1cGVyaW9yXCIsXG4gICAgICAgIFwiMTIzXCI6IFwib3JkbWFzY3VsaW5lXCIsXG4gICAgICAgIFwiMTI0XCI6IFwiZ3VpbGxlbW90cmlnaHRcIixcbiAgICAgICAgXCIxMjVcIjogXCJvbmVxdWFydGVyXCIsXG4gICAgICAgIFwiMTI2XCI6IFwib25laGFsZlwiLFxuICAgICAgICBcIjEyN1wiOiBcInRocmVlcXVhcnRlcnNcIixcbiAgICAgICAgXCIxMjhcIjogXCJxdWVzdGlvbmRvd25cIixcbiAgICAgICAgXCIxMjlcIjogXCJBZ3JhdmVcIixcbiAgICAgICAgXCIxMzBcIjogXCJBYWN1dGVcIixcbiAgICAgICAgXCIxMzFcIjogXCJBY2lyY3VtZmxleFwiLFxuICAgICAgICBcIjEzMlwiOiBcIkF0aWxkZVwiLFxuICAgICAgICBcIjEzM1wiOiBcIkFkaWVyZXNpc1wiLFxuICAgICAgICBcIjEzNFwiOiBcIkFyaW5nXCIsXG4gICAgICAgIFwiMTM1XCI6IFwiQUVcIixcbiAgICAgICAgXCIxMzZcIjogXCJDY2VkaWxsYVwiLFxuICAgICAgICBcIjEzN1wiOiBcIkVncmF2ZVwiLFxuICAgICAgICBcIjEzOFwiOiBcIkVhY3V0ZVwiLFxuICAgICAgICBcIjEzOVwiOiBcIkVjaXJjdW1mbGV4XCIsXG4gICAgICAgIFwiMTQwXCI6IFwiRWRpZXJlc2lzXCIsXG4gICAgICAgIFwiMTQxXCI6IFwiSWdyYXZlXCIsXG4gICAgICAgIFwiMTQyXCI6IFwiSWFjdXRlXCIsXG4gICAgICAgIFwiMTQzXCI6IFwiSWNpcmN1bWZsZXhcIixcbiAgICAgICAgXCIxNDRcIjogXCJJZGllcmVzaXNcIixcbiAgICAgICAgXCIxNDVcIjogXCJFdGhcIixcbiAgICAgICAgXCIxNDZcIjogXCJOdGlsZGVcIixcbiAgICAgICAgXCIxNDdcIjogXCJPZ3JhdmVcIixcbiAgICAgICAgXCIxNDhcIjogXCJPYWN1dGVcIixcbiAgICAgICAgXCIxNDlcIjogXCJPY2lyY3VtZmxleFwiLFxuICAgICAgICBcIjE1MFwiOiBcIk90aWxkZVwiLFxuICAgICAgICBcIjE1MVwiOiBcIk9kaWVyZXNpc1wiLFxuICAgICAgICBcIjE1MlwiOiBcIm11bHRpcGx5XCIsXG4gICAgICAgIFwiMTUzXCI6IFwiT3NsYXNoXCIsXG4gICAgICAgIFwiMTU0XCI6IFwiVWdyYXZlXCIsXG4gICAgICAgIFwiMTU1XCI6IFwiVWFjdXRlXCIsXG4gICAgICAgIFwiMTU2XCI6IFwiVWNpcmN1bWZsZXhcIixcbiAgICAgICAgXCIxNTdcIjogXCJVZGllcmVzaXNcIixcbiAgICAgICAgXCIxNThcIjogXCJZYWN1dGVcIixcbiAgICAgICAgXCIxNTlcIjogXCJUaG9yblwiLFxuICAgICAgICBcIjE2MFwiOiBcImdlcm1hbmRibHNcIixcbiAgICAgICAgXCIxNjFcIjogXCJhZ3JhdmVcIixcbiAgICAgICAgXCIxNjJcIjogXCJhYWN1dGVcIixcbiAgICAgICAgXCIxNjNcIjogXCJhY2lyY3VtZmxleFwiLFxuICAgICAgICBcIjE2NFwiOiBcImF0aWxkZVwiLFxuICAgICAgICBcIjE2NVwiOiBcImFkaWVyZXNpc1wiLFxuICAgICAgICBcIjE2NlwiOiBcImFyaW5nXCIsXG4gICAgICAgIFwiMTY3XCI6IFwiYWVcIixcbiAgICAgICAgXCIxNjhcIjogXCJjY2VkaWxsYVwiLFxuICAgICAgICBcIjE2OVwiOiBcImVncmF2ZVwiLFxuICAgICAgICBcIjE3MFwiOiBcImVhY3V0ZVwiLFxuICAgICAgICBcIjE3MVwiOiBcImVjaXJjdW1mbGV4XCIsXG4gICAgICAgIFwiMTcyXCI6IFwiZWRpZXJlc2lzXCIsXG4gICAgICAgIFwiMTczXCI6IFwiaWdyYXZlXCIsXG4gICAgICAgIFwiMTc0XCI6IFwiaWFjdXRlXCIsXG4gICAgICAgIFwiMTc1XCI6IFwiaWNpcmN1bWZsZXhcIixcbiAgICAgICAgXCIxNzZcIjogXCJpZGllcmVzaXNcIixcbiAgICAgICAgXCIxNzdcIjogXCJldGhcIixcbiAgICAgICAgXCIxNzhcIjogXCJudGlsZGVcIixcbiAgICAgICAgXCIxNzlcIjogXCJvZ3JhdmVcIixcbiAgICAgICAgXCIxODBcIjogXCJvYWN1dGVcIixcbiAgICAgICAgXCIxODFcIjogXCJvY2lyY3VtZmxleFwiLFxuICAgICAgICBcIjE4MlwiOiBcIm90aWxkZVwiLFxuICAgICAgICBcIjE4M1wiOiBcIm9kaWVyZXNpc1wiLFxuICAgICAgICBcIjE4NFwiOiBcImRpdmlkZVwiLFxuICAgICAgICBcIjE4NVwiOiBcIm9zbGFzaFwiLFxuICAgICAgICBcIjE4NlwiOiBcInVncmF2ZVwiLFxuICAgICAgICBcIjE4N1wiOiBcInVhY3V0ZVwiLFxuICAgICAgICBcIjE4OFwiOiBcInVjaXJjdW1mbGV4XCIsXG4gICAgICAgIFwiMTg5XCI6IFwidWRpZXJlc2lzXCIsXG4gICAgICAgIFwiMTkwXCI6IFwieWFjdXRlXCIsXG4gICAgICAgIFwiMTkxXCI6IFwidGhvcm5cIixcbiAgICAgICAgXCIxOTJcIjogXCJ5ZGllcmVzaXNcIixcbiAgICAgICAgXCIxOTNcIjogXCJBbWFjcm9uXCIsXG4gICAgICAgIFwiMTk0XCI6IFwiYW1hY3JvblwiLFxuICAgICAgICBcIjE5NVwiOiBcIkFicmV2ZVwiLFxuICAgICAgICBcIjE5NlwiOiBcImFicmV2ZVwiLFxuICAgICAgICBcIjE5N1wiOiBcIkFvZ29uZWtcIixcbiAgICAgICAgXCIxOThcIjogXCJhb2dvbmVrXCIsXG4gICAgICAgIFwiMTk5XCI6IFwiQ2FjdXRlXCIsXG4gICAgICAgIFwiMjAwXCI6IFwiY2FjdXRlXCIsXG4gICAgICAgIFwiMjAxXCI6IFwiQ2NpcmN1bWZsZXhcIixcbiAgICAgICAgXCIyMDJcIjogXCJjY2lyY3VtZmxleFwiLFxuICAgICAgICBcIjIwM1wiOiBcIkNkb3RhY2NlbnRcIixcbiAgICAgICAgXCIyMDRcIjogXCJjZG90YWNjZW50XCIsXG4gICAgICAgIFwiMjA1XCI6IFwiQ2Nhcm9uXCIsXG4gICAgICAgIFwiMjA2XCI6IFwiY2Nhcm9uXCIsXG4gICAgICAgIFwiMjA3XCI6IFwiRGNhcm9uXCIsXG4gICAgICAgIFwiMjA4XCI6IFwiZGNhcm9uXCIsXG4gICAgICAgIFwiMjA5XCI6IFwiRGNyb2F0XCIsXG4gICAgICAgIFwiMjEwXCI6IFwiZGNyb2F0XCIsXG4gICAgICAgIFwiMjExXCI6IFwiRW1hY3JvblwiLFxuICAgICAgICBcIjIxMlwiOiBcImVtYWNyb25cIixcbiAgICAgICAgXCIyMTNcIjogXCJFYnJldmVcIixcbiAgICAgICAgXCIyMTRcIjogXCJlYnJldmVcIixcbiAgICAgICAgXCIyMTVcIjogXCJFZG90YWNjZW50XCIsXG4gICAgICAgIFwiMjE2XCI6IFwiZWRvdGFjY2VudFwiLFxuICAgICAgICBcIjIxN1wiOiBcIkVvZ29uZWtcIixcbiAgICAgICAgXCIyMThcIjogXCJlb2dvbmVrXCIsXG4gICAgICAgIFwiMjE5XCI6IFwiRWNhcm9uXCIsXG4gICAgICAgIFwiMjIwXCI6IFwiZWNhcm9uXCIsXG4gICAgICAgIFwiMjIxXCI6IFwiR2NpcmN1bWZsZXhcIixcbiAgICAgICAgXCIyMjJcIjogXCJnY2lyY3VtZmxleFwiLFxuICAgICAgICBcIjIyM1wiOiBcIkdicmV2ZVwiLFxuICAgICAgICBcIjIyNFwiOiBcImdicmV2ZVwiLFxuICAgICAgICBcIjIyNVwiOiBcIkdkb3RhY2NlbnRcIixcbiAgICAgICAgXCIyMjZcIjogXCJnZG90YWNjZW50XCIsXG4gICAgICAgIFwiMjI3XCI6IFwiR2NvbW1hYWNjZW50XCIsXG4gICAgICAgIFwiMjI4XCI6IFwiZ2NvbW1hYWNjZW50XCIsXG4gICAgICAgIFwiMjI5XCI6IFwiSGNpcmN1bWZsZXhcIixcbiAgICAgICAgXCIyMzBcIjogXCJoY2lyY3VtZmxleFwiLFxuICAgICAgICBcIjIzMVwiOiBcIkhiYXJcIixcbiAgICAgICAgXCIyMzJcIjogXCJoYmFyXCIsXG4gICAgICAgIFwiMjMzXCI6IFwiSXRpbGRlXCIsXG4gICAgICAgIFwiMjM0XCI6IFwiaXRpbGRlXCIsXG4gICAgICAgIFwiMjM1XCI6IFwiSW1hY3JvblwiLFxuICAgICAgICBcIjIzNlwiOiBcImltYWNyb25cIixcbiAgICAgICAgXCIyMzdcIjogXCJJYnJldmVcIixcbiAgICAgICAgXCIyMzhcIjogXCJpYnJldmVcIixcbiAgICAgICAgXCIyMzlcIjogXCJJb2dvbmVrXCIsXG4gICAgICAgIFwiMjQwXCI6IFwiaW9nb25la1wiLFxuICAgICAgICBcIjI0MVwiOiBcIklkb3RhY2NlbnRcIixcbiAgICAgICAgXCIyNDJcIjogXCJkb3RsZXNzaVwiLFxuICAgICAgICBcIjI0M1wiOiBcIkpjaXJjdW1mbGV4XCIsXG4gICAgICAgIFwiMjQ0XCI6IFwiamNpcmN1bWZsZXhcIixcbiAgICAgICAgXCIyNDVcIjogXCJLY29tbWFhY2NlbnRcIixcbiAgICAgICAgXCIyNDZcIjogXCJrY29tbWFhY2NlbnRcIixcbiAgICAgICAgXCIyNDdcIjogXCJrZ3JlZW5sYW5kaWNcIixcbiAgICAgICAgXCIyNDhcIjogXCJMYWN1dGVcIixcbiAgICAgICAgXCIyNDlcIjogXCJsYWN1dGVcIixcbiAgICAgICAgXCIyNTBcIjogXCJMY29tbWFhY2NlbnRcIixcbiAgICAgICAgXCIyNTFcIjogXCJsY29tbWFhY2NlbnRcIixcbiAgICAgICAgXCIyNTJcIjogXCJMY2Fyb25cIixcbiAgICAgICAgXCIyNTNcIjogXCJsY2Fyb25cIixcbiAgICAgICAgXCIyNTRcIjogXCJMZG90XCIsXG4gICAgICAgIFwiMjU1XCI6IFwibGRvdFwiLFxuICAgICAgICBcIjI1NlwiOiBcIkxzbGFzaFwiLFxuICAgICAgICBcIjI1N1wiOiBcImxzbGFzaFwiLFxuICAgICAgICBcIjI1OFwiOiBcIk5hY3V0ZVwiLFxuICAgICAgICBcIjI1OVwiOiBcIm5hY3V0ZVwiLFxuICAgICAgICBcIjI2MFwiOiBcIk5jb21tYWFjY2VudFwiLFxuICAgICAgICBcIjI2MVwiOiBcIm5jb21tYWFjY2VudFwiLFxuICAgICAgICBcIjI2MlwiOiBcIk5jYXJvblwiLFxuICAgICAgICBcIjI2M1wiOiBcIm5jYXJvblwiLFxuICAgICAgICBcIjI2NFwiOiBcIm5hcG9zdHJvcGhlXCIsXG4gICAgICAgIFwiMjY1XCI6IFwiRW5nXCIsXG4gICAgICAgIFwiMjY2XCI6IFwiZW5nXCIsXG4gICAgICAgIFwiMjY3XCI6IFwiT21hY3JvblwiLFxuICAgICAgICBcIjI2OFwiOiBcIm9tYWNyb25cIixcbiAgICAgICAgXCIyNjlcIjogXCJPYnJldmVcIixcbiAgICAgICAgXCIyNzBcIjogXCJvYnJldmVcIixcbiAgICAgICAgXCIyNzFcIjogXCJPaHVuZ2FydW1sYXV0XCIsXG4gICAgICAgIFwiMjcyXCI6IFwib2h1bmdhcnVtbGF1dFwiLFxuICAgICAgICBcIjI3M1wiOiBcIk9FXCIsXG4gICAgICAgIFwiMjc0XCI6IFwib2VcIixcbiAgICAgICAgXCIyNzVcIjogXCJSYWN1dGVcIixcbiAgICAgICAgXCIyNzZcIjogXCJyYWN1dGVcIixcbiAgICAgICAgXCIyNzdcIjogXCJSY29tbWFhY2NlbnRcIixcbiAgICAgICAgXCIyNzhcIjogXCJyY29tbWFhY2NlbnRcIixcbiAgICAgICAgXCIyNzlcIjogXCJSY2Fyb25cIixcbiAgICAgICAgXCIyODBcIjogXCJyY2Fyb25cIixcbiAgICAgICAgXCIyODFcIjogXCJTYWN1dGVcIixcbiAgICAgICAgXCIyODJcIjogXCJzYWN1dGVcIixcbiAgICAgICAgXCIyODNcIjogXCJTY2lyY3VtZmxleFwiLFxuICAgICAgICBcIjI4NFwiOiBcInNjaXJjdW1mbGV4XCIsXG4gICAgICAgIFwiMjg1XCI6IFwiU2NlZGlsbGFcIixcbiAgICAgICAgXCIyODZcIjogXCJzY2VkaWxsYVwiLFxuICAgICAgICBcIjI4N1wiOiBcIlNjYXJvblwiLFxuICAgICAgICBcIjI4OFwiOiBcInNjYXJvblwiLFxuICAgICAgICBcIjI4OVwiOiBcIlRjb21tYWFjY2VudFwiLFxuICAgICAgICBcIjI5MFwiOiBcInRjb21tYWFjY2VudFwiLFxuICAgICAgICBcIjI5MVwiOiBcIlRjYXJvblwiLFxuICAgICAgICBcIjI5MlwiOiBcInRjYXJvblwiLFxuICAgICAgICBcIjI5M1wiOiBcIlRiYXJcIixcbiAgICAgICAgXCIyOTRcIjogXCJ0YmFyXCIsXG4gICAgICAgIFwiMjk1XCI6IFwiVXRpbGRlXCIsXG4gICAgICAgIFwiMjk2XCI6IFwidXRpbGRlXCIsXG4gICAgICAgIFwiMjk3XCI6IFwiVW1hY3JvblwiLFxuICAgICAgICBcIjI5OFwiOiBcInVtYWNyb25cIixcbiAgICAgICAgXCIyOTlcIjogXCJVYnJldmVcIixcbiAgICAgICAgXCIzMDBcIjogXCJ1YnJldmVcIixcbiAgICAgICAgXCIzMDFcIjogXCJVcmluZ1wiLFxuICAgICAgICBcIjMwMlwiOiBcInVyaW5nXCIsXG4gICAgICAgIFwiMzAzXCI6IFwiVWh1bmdhcnVtbGF1dFwiLFxuICAgICAgICBcIjMwNFwiOiBcInVodW5nYXJ1bWxhdXRcIixcbiAgICAgICAgXCIzMDVcIjogXCJVb2dvbmVrXCIsXG4gICAgICAgIFwiMzA2XCI6IFwidW9nb25la1wiLFxuICAgICAgICBcIjMwN1wiOiBcIldjaXJjdW1mbGV4XCIsXG4gICAgICAgIFwiMzA4XCI6IFwid2NpcmN1bWZsZXhcIixcbiAgICAgICAgXCIzMDlcIjogXCJZY2lyY3VtZmxleFwiLFxuICAgICAgICBcIjMxMFwiOiBcInljaXJjdW1mbGV4XCIsXG4gICAgICAgIFwiMzExXCI6IFwiWWRpZXJlc2lzXCIsXG4gICAgICAgIFwiMzEyXCI6IFwiWmFjdXRlXCIsXG4gICAgICAgIFwiMzEzXCI6IFwiemFjdXRlXCIsXG4gICAgICAgIFwiMzE0XCI6IFwiWmRvdGFjY2VudFwiLFxuICAgICAgICBcIjMxNVwiOiBcInpkb3RhY2NlbnRcIixcbiAgICAgICAgXCIzMTZcIjogXCJaY2Fyb25cIixcbiAgICAgICAgXCIzMTdcIjogXCJ6Y2Fyb25cIixcbiAgICAgICAgXCIzMThcIjogXCJsb25nc1wiLFxuICAgICAgICBcIjMxOVwiOiBcIkFFYWN1dGVcIixcbiAgICAgICAgXCIzMjBcIjogXCJhZWFjdXRlXCIsXG4gICAgICAgIFwiMzIxXCI6IFwiT3NsYXNoYWN1dGVcIixcbiAgICAgICAgXCIzMjJcIjogXCJvc2xhc2hhY3V0ZVwiLFxuICAgICAgICBcIjMyM1wiOiBcIlNjb21tYWFjY2VudFwiLFxuICAgICAgICBcIjMyNFwiOiBcInNjb21tYWFjY2VudFwiLFxuICAgICAgICBcIjMyNVwiOiBcInVuaTAyMUFcIixcbiAgICAgICAgXCIzMjZcIjogXCJ1bmkwMjFCXCIsXG4gICAgICAgIFwiMzI3XCI6IFwiZG90bGVzc2pcIixcbiAgICAgICAgXCIzMjhcIjogXCJjaXJjdW1mbGV4XCIsXG4gICAgICAgIFwiMzI5XCI6IFwiY2Fyb25cIixcbiAgICAgICAgXCIzMzBcIjogXCJicmV2ZVwiLFxuICAgICAgICBcIjMzMVwiOiBcImRvdGFjY2VudFwiLFxuICAgICAgICBcIjMzMlwiOiBcInJpbmdcIixcbiAgICAgICAgXCIzMzNcIjogXCJvZ29uZWtcIixcbiAgICAgICAgXCIzMzRcIjogXCJ0aWxkZVwiLFxuICAgICAgICBcIjMzNVwiOiBcImh1bmdhcnVtbGF1dFwiLFxuICAgICAgICBcIjMzNlwiOiBcImVuZGFzaFwiLFxuICAgICAgICBcIjMzN1wiOiBcImVtZGFzaFwiLFxuICAgICAgICBcIjMzOFwiOiBcInF1b3RlbGVmdFwiLFxuICAgICAgICBcIjMzOVwiOiBcInF1b3RlcmlnaHRcIixcbiAgICAgICAgXCIzNDBcIjogXCJxdW90ZXNpbmdsYmFzZVwiLFxuICAgICAgICBcIjM0MVwiOiBcInF1b3RlZGJsbGVmdFwiLFxuICAgICAgICBcIjM0MlwiOiBcInF1b3RlZGJscmlnaHRcIixcbiAgICAgICAgXCIzNDNcIjogXCJxdW90ZWRibGJhc2VcIixcbiAgICAgICAgXCIzNDRcIjogXCJkYWdnZXJcIixcbiAgICAgICAgXCIzNDVcIjogXCJkYWdnZXJkYmxcIixcbiAgICAgICAgXCIzNDZcIjogXCJidWxsZXRcIixcbiAgICAgICAgXCIzNDdcIjogXCJlbGxpcHNpc1wiLFxuICAgICAgICBcIjM0OFwiOiBcInBlcnRob3VzYW5kXCIsXG4gICAgICAgIFwiMzQ5XCI6IFwiZ3VpbHNpbmdsbGVmdFwiLFxuICAgICAgICBcIjM1MFwiOiBcImd1aWxzaW5nbHJpZ2h0XCIsXG4gICAgICAgIFwiMzUxXCI6IFwiZnJhY3Rpb25cIixcbiAgICAgICAgXCIzNTJcIjogXCJFdXJvXCIsXG4gICAgICAgIFwiMzUzXCI6IFwibnVtZXJvXCIsXG4gICAgICAgIFwiMzU0XCI6IFwidHJhZGVtYXJrXCIsXG4gICAgICAgIFwiMzU1XCI6IFwibWludXNcIixcbiAgICAgICAgXCIzNTZcIjogXCJhcHByb3hlcXVhbFwiLFxuICAgICAgICBcIjM1N1wiOiBcIm5vdGVxdWFsXCIsXG4gICAgICAgIFwiMzU4XCI6IFwibGVzc2VxdWFsXCIsXG4gICAgICAgIFwiMzU5XCI6IFwiZ3JlYXRlcmVxdWFsXCIsXG4gICAgICAgIFwiMzYwXCI6IFwiT0Uuc21jcFwiLFxuICAgICAgICBcIjM2MVwiOiBcImRvdGFjY2VudC5jYXBcIixcbiAgICAgICAgXCIzNjJcIjogXCJicmV2ZS5jYXBcIixcbiAgICAgICAgXCIzNjNcIjogXCJvZ29uZWsuY2FwXCIsXG4gICAgICAgIFwiMzY0XCI6IFwiY2VkaWxsYS5jYXBcIixcbiAgICAgICAgXCIzNjVcIjogXCJyaW5nLmNhcFwiLFxuICAgICAgICBcIjM2NlwiOiBcInRpbGRlLmNhcFwiLFxuICAgICAgICBcIjM2N1wiOiBcImNpcmN1bWZsZXguY2FwXCIsXG4gICAgICAgIFwiMzY4XCI6IFwiYXQuY2FwXCIsXG4gICAgICAgIFwiMzY5XCI6IFwiQWJyZXZlLnNtY3BcIixcbiAgICAgICAgXCIzNzBcIjogXCJBbWFjcm9uLnNtY3BcIixcbiAgICAgICAgXCIzNzFcIjogXCJBb2dvbmVrLnNtY3BcIixcbiAgICAgICAgXCIzNzJcIjogXCJBRWFjdXRlLnNtY3BcIixcbiAgICAgICAgXCIzNzNcIjogXCJDYWN1dGUuc21jcFwiLFxuICAgICAgICBcIjM3NFwiOiBcIkNjYXJvbi5zbWNwXCIsXG4gICAgICAgIFwiMzc1XCI6IFwiQ2NpcmN1bWZsZXguc21jcFwiLFxuICAgICAgICBcIjM3NlwiOiBcIkNkb3RhY2NlbnQuc21jcFwiLFxuICAgICAgICBcIjM3N1wiOiBcIkRjYXJvbi5zbWNwXCIsXG4gICAgICAgIFwiMzc4XCI6IFwiRGNyb2F0LnNtY3BcIixcbiAgICAgICAgXCIzNzlcIjogXCJFYnJldmUuc21jcFwiLFxuICAgICAgICBcIjM4MFwiOiBcIkVjYXJvbi5zbWNwXCIsXG4gICAgICAgIFwiMzgxXCI6IFwiRWRvdGFjY2VudC5zbWNwXCIsXG4gICAgICAgIFwiMzgyXCI6IFwiRW1hY3Jvbi5zbWNwXCIsXG4gICAgICAgIFwiMzgzXCI6IFwiRW5nLnNtY3BcIixcbiAgICAgICAgXCIzODRcIjogXCJFb2dvbmVrLnNtY3BcIixcbiAgICAgICAgXCIzODVcIjogXCJHYnJldmUuc21jcFwiLFxuICAgICAgICBcIjM4NlwiOiBcIkdjaXJjdW1mbGV4LnNtY3BcIixcbiAgICAgICAgXCIzODdcIjogXCJHY29tbWFhY2NlbnQuc21jcFwiLFxuICAgICAgICBcIjM4OFwiOiBcIkdkb3RhY2NlbnQuc21jcFwiLFxuICAgICAgICBcIjM4OVwiOiBcIkhiYXIuc21jcFwiLFxuICAgICAgICBcIjM5MFwiOiBcIkhjaXJjdW1mbGV4LnNtY3BcIixcbiAgICAgICAgXCIzOTFcIjogXCJJYnJldmUuc21jcFwiLFxuICAgICAgICBcIjM5MlwiOiBcIkltYWNyb24uc21jcFwiLFxuICAgICAgICBcIjM5M1wiOiBcIklvZ29uZWsuc21jcFwiLFxuICAgICAgICBcIjM5NFwiOiBcIkl0aWxkZS5zbWNwXCIsXG4gICAgICAgIFwiMzk1XCI6IFwiSmNpcmN1bWZsZXguc21jcFwiLFxuICAgICAgICBcIjM5NlwiOiBcIktjb21tYWFjY2VudC5zbWNwXCIsXG4gICAgICAgIFwiMzk3XCI6IFwiTGFjdXRlLnNtY3BcIixcbiAgICAgICAgXCIzOThcIjogXCJMY2Fyb24uc21jcFwiLFxuICAgICAgICBcIjM5OVwiOiBcIkxjb21tYWFjY2VudC5zbWNwXCIsXG4gICAgICAgIFwiNDAwXCI6IFwiTGRvdC5zbWNwXCIsXG4gICAgICAgIFwiNDAxXCI6IFwiTmFjdXRlLnNtY3BcIixcbiAgICAgICAgXCI0MDJcIjogXCJOY2Fyb24uc21jcFwiLFxuICAgICAgICBcIjQwM1wiOiBcIk5jb21tYWFjY2VudC5zbWNwXCIsXG4gICAgICAgIFwiNDA0XCI6IFwiT2JyZXZlLnNtY3BcIixcbiAgICAgICAgXCI0MDVcIjogXCJPaHVuZ2FydW1sYXV0LnNtY3BcIixcbiAgICAgICAgXCI0MDZcIjogXCJPbWFjcm9uLnNtY3BcIixcbiAgICAgICAgXCI0MDdcIjogXCJPc2xhc2hhY3V0ZS5zbWNwXCIsXG4gICAgICAgIFwiNDA4XCI6IFwiUmFjdXRlLnNtY3BcIixcbiAgICAgICAgXCI0MDlcIjogXCJSY2Fyb24uc21jcFwiLFxuICAgICAgICBcIjQxMFwiOiBcIlJjb21tYWFjY2VudC5zbWNwXCIsXG4gICAgICAgIFwiNDExXCI6IFwiU2FjdXRlLnNtY3BcIixcbiAgICAgICAgXCI0MTJcIjogXCJTY2VkaWxsYS5zbWNwXCIsXG4gICAgICAgIFwiNDEzXCI6IFwiU2NpcmN1bWZsZXguc21jcFwiLFxuICAgICAgICBcIjQxNFwiOiBcIlNjb21tYWFjY2VudC5zbWNwXCIsXG4gICAgICAgIFwiNDE1XCI6IFwiVGJhci5zbWNwXCIsXG4gICAgICAgIFwiNDE2XCI6IFwiVGNhcm9uLnNtY3BcIixcbiAgICAgICAgXCI0MTdcIjogXCJUY29tbWFhY2NlbnQuc21jcFwiLFxuICAgICAgICBcIjQxOFwiOiBcIlVicmV2ZS5zbWNwXCIsXG4gICAgICAgIFwiNDE5XCI6IFwiVWh1bmdhcnVtbGF1dC5zbWNwXCIsXG4gICAgICAgIFwiNDIwXCI6IFwiVW1hY3Jvbi5zbWNwXCIsXG4gICAgICAgIFwiNDIxXCI6IFwiVW9nb25lay5zbWNwXCIsXG4gICAgICAgIFwiNDIyXCI6IFwiVXJpbmcuc21jcFwiLFxuICAgICAgICBcIjQyM1wiOiBcIlV0aWxkZS5zbWNwXCIsXG4gICAgICAgIFwiNDI0XCI6IFwiV2NpcmN1bWZsZXguc21jcFwiLFxuICAgICAgICBcIjQyNVwiOiBcIlljaXJjdW1mbGV4LnNtY3BcIixcbiAgICAgICAgXCI0MjZcIjogXCJaYWN1dGUuc21jcFwiLFxuICAgICAgICBcIjQyN1wiOiBcIlpkb3RhY2NlbnQuc21jcFwiLFxuICAgICAgICBcIjQyOFwiOiBcIklkb3RhY2NlbnQuc21jcFwiLFxuICAgICAgICBcIjQyOVwiOiBcInBhcmVubGVmdC5jYXBcIixcbiAgICAgICAgXCI0MzBcIjogXCJwYXJlbnJpZ2h0LmNhcFwiLFxuICAgICAgICBcIjQzMVwiOiBcImJyYWNrZXRsZWZ0LmNhcFwiLFxuICAgICAgICBcIjQzMlwiOiBcImJyYWNrZXRyaWdodC5jYXBcIixcbiAgICAgICAgXCI0MzNcIjogXCJicmFjZWxlZnQuY2FwXCIsXG4gICAgICAgIFwiNDM0XCI6IFwiYnJhY2VyaWdodC5jYXBcIixcbiAgICAgICAgXCI0MzVcIjogXCJleGNsYW1kb3duLmNhcFwiLFxuICAgICAgICBcIjQzNlwiOiBcInF1ZXN0aW9uZG93bi5jYXBcIixcbiAgICAgICAgXCI0MzdcIjogXCJndWlsbGVtb3RsZWZ0LmNhcFwiLFxuICAgICAgICBcIjQzOFwiOiBcImd1aWxsZW1vdHJpZ2h0LmNhcFwiLFxuICAgICAgICBcIjQzOVwiOiBcImd1aWxzaW5nbGxlZnQuY2FwXCIsXG4gICAgICAgIFwiNDQwXCI6IFwiZ3VpbHNpbmdscmlnaHQuY2FwXCIsXG4gICAgICAgIFwiNDQxXCI6IFwiaHlwaGVuLmNhcFwiLFxuICAgICAgICBcIjQ0MlwiOiBcImVuZGFzaC5jYXBcIixcbiAgICAgICAgXCI0NDNcIjogXCJlbWRhc2guY2FwXCIsXG4gICAgICAgIFwiNDQ0XCI6IFwicGVyaW9kY2VudGVyZWQuY2FwXCIsXG4gICAgICAgIFwiNDQ1XCI6IFwiYWN1dGUuY2FwXCIsXG4gICAgICAgIFwiNDQ2XCI6IFwiY2Fyb24uY2FwXCIsXG4gICAgICAgIFwiNDQ3XCI6IFwiZGllcmVzaXMuY2FwXCIsXG4gICAgICAgIFwiNDQ4XCI6IFwiZ3JhdmUuY2FwXCIsXG4gICAgICAgIFwiNDQ5XCI6IFwiaHVuZ2FydW1sYXV0LmNhcFwiLFxuICAgICAgICBcIjQ1MFwiOiBcIm1hY3Jvbi5jYXBcIixcbiAgICAgICAgXCI0NTFcIjogXCJicmV2ZS5zbWNwXCIsXG4gICAgICAgIFwiNDUyXCI6IFwiY2Fyb24uc21jcFwiLFxuICAgICAgICBcIjQ1M1wiOiBcImNpcmN1bWZsZXguc21jcFwiLFxuICAgICAgICBcIjQ1NFwiOiBcImRvdGFjY2VudC5zbWNwXCIsXG4gICAgICAgIFwiNDU1XCI6IFwiaHVuZ2FydW1sYXV0LnNtY3BcIixcbiAgICAgICAgXCI0NTZcIjogXCJMc2xhc2guc21jcFwiLFxuICAgICAgICBcIjQ1N1wiOiBcIm9nb25lay5zbWNwXCIsXG4gICAgICAgIFwiNDU4XCI6IFwicmluZy5zbWNwXCIsXG4gICAgICAgIFwiNDU5XCI6IFwiU2Nhcm9uLnNtY3BcIixcbiAgICAgICAgXCI0NjBcIjogXCJ0aWxkZS5zbWNwXCIsXG4gICAgICAgIFwiNDYxXCI6IFwiWmNhcm9uLnNtY3BcIixcbiAgICAgICAgXCI0NjJcIjogXCJleGNsYW0uc21jcFwiLFxuICAgICAgICBcIjQ2M1wiOiBcImFtcGVyc2FuZC5zbWNwXCIsXG4gICAgICAgIFwiNDY0XCI6IFwicXVlc3Rpb24uc21jcFwiLFxuICAgICAgICBcIjQ2NVwiOiBcImdyYXZlLnNtY3BcIixcbiAgICAgICAgXCI0NjZcIjogXCJBLnNtY3BcIixcbiAgICAgICAgXCI0NjdcIjogXCJCLnNtY3BcIixcbiAgICAgICAgXCI0NjhcIjogXCJDLnNtY3BcIixcbiAgICAgICAgXCI0NjlcIjogXCJELnNtY3BcIixcbiAgICAgICAgXCI0NzBcIjogXCJFLnNtY3BcIixcbiAgICAgICAgXCI0NzFcIjogXCJGLnNtY3BcIixcbiAgICAgICAgXCI0NzJcIjogXCJHLnNtY3BcIixcbiAgICAgICAgXCI0NzNcIjogXCJILnNtY3BcIixcbiAgICAgICAgXCI0NzRcIjogXCJJLnNtY3BcIixcbiAgICAgICAgXCI0NzVcIjogXCJKLnNtY3BcIixcbiAgICAgICAgXCI0NzZcIjogXCJLLnNtY3BcIixcbiAgICAgICAgXCI0NzdcIjogXCJMLnNtY3BcIixcbiAgICAgICAgXCI0NzhcIjogXCJNLnNtY3BcIixcbiAgICAgICAgXCI0NzlcIjogXCJOLnNtY3BcIixcbiAgICAgICAgXCI0ODBcIjogXCJPLnNtY3BcIixcbiAgICAgICAgXCI0ODFcIjogXCJQLnNtY3BcIixcbiAgICAgICAgXCI0ODJcIjogXCJRLnNtY3BcIixcbiAgICAgICAgXCI0ODNcIjogXCJSLnNtY3BcIixcbiAgICAgICAgXCI0ODRcIjogXCJTLnNtY3BcIixcbiAgICAgICAgXCI0ODVcIjogXCJULnNtY3BcIixcbiAgICAgICAgXCI0ODZcIjogXCJVLnNtY3BcIixcbiAgICAgICAgXCI0ODdcIjogXCJWLnNtY3BcIixcbiAgICAgICAgXCI0ODhcIjogXCJXLnNtY3BcIixcbiAgICAgICAgXCI0ODlcIjogXCJYLnNtY3BcIixcbiAgICAgICAgXCI0OTBcIjogXCJZLnNtY3BcIixcbiAgICAgICAgXCI0OTFcIjogXCJaLnNtY3BcIixcbiAgICAgICAgXCI0OTJcIjogXCJleGNsYW1kb3duLnNtY3BcIixcbiAgICAgICAgXCI0OTNcIjogXCJkaWVyZXNpcy5zbWNwXCIsXG4gICAgICAgIFwiNDk0XCI6IFwibWFjcm9uLnNtY3BcIixcbiAgICAgICAgXCI0OTVcIjogXCJhY3V0ZS5zbWNwXCIsXG4gICAgICAgIFwiNDk2XCI6IFwiY2VkaWxsYS5zbWNwXCIsXG4gICAgICAgIFwiNDk3XCI6IFwicXVlc3Rpb25kb3duLnNtY3BcIixcbiAgICAgICAgXCI0OThcIjogXCJBZ3JhdmUuc21jcFwiLFxuICAgICAgICBcIjQ5OVwiOiBcIkFhY3V0ZS5zbWNwXCIsXG4gICAgICAgIFwiNTAwXCI6IFwiQWNpcmN1bWZsZXguc21jcFwiLFxuICAgICAgICBcIjUwMVwiOiBcIkF0aWxkZS5zbWNwXCIsXG4gICAgICAgIFwiNTAyXCI6IFwiQWRpZXJlc2lzLnNtY3BcIixcbiAgICAgICAgXCI1MDNcIjogXCJBcmluZy5zbWNwXCIsXG4gICAgICAgIFwiNTA0XCI6IFwiQUUuc21jcFwiLFxuICAgICAgICBcIjUwNVwiOiBcIkNjZWRpbGxhLnNtY3BcIixcbiAgICAgICAgXCI1MDZcIjogXCJFZ3JhdmUuc21jcFwiLFxuICAgICAgICBcIjUwN1wiOiBcIkVhY3V0ZS5zbWNwXCIsXG4gICAgICAgIFwiNTA4XCI6IFwiRWNpcmN1bWZsZXguc21jcFwiLFxuICAgICAgICBcIjUwOVwiOiBcIkVkaWVyZXNpcy5zbWNwXCIsXG4gICAgICAgIFwiNTEwXCI6IFwiSWdyYXZlLnNtY3BcIixcbiAgICAgICAgXCI1MTFcIjogXCJJYWN1dGUuc21jcFwiLFxuICAgICAgICBcIjUxMlwiOiBcIkljaXJjdW1mbGV4LnNtY3BcIixcbiAgICAgICAgXCI1MTNcIjogXCJJZGllcmVzaXMuc21jcFwiLFxuICAgICAgICBcIjUxNFwiOiBcIkV0aC5zbWNwXCIsXG4gICAgICAgIFwiNTE1XCI6IFwiTnRpbGRlLnNtY3BcIixcbiAgICAgICAgXCI1MTZcIjogXCJPZ3JhdmUuc21jcFwiLFxuICAgICAgICBcIjUxN1wiOiBcIk9hY3V0ZS5zbWNwXCIsXG4gICAgICAgIFwiNTE4XCI6IFwiT2NpcmN1bWZsZXguc21jcFwiLFxuICAgICAgICBcIjUxOVwiOiBcIk90aWxkZS5zbWNwXCIsXG4gICAgICAgIFwiNTIwXCI6IFwiT2RpZXJlc2lzLnNtY3BcIixcbiAgICAgICAgXCI1MjFcIjogXCJPc2xhc2guc21jcFwiLFxuICAgICAgICBcIjUyMlwiOiBcIlVncmF2ZS5zbWNwXCIsXG4gICAgICAgIFwiNTIzXCI6IFwiVWFjdXRlLnNtY3BcIixcbiAgICAgICAgXCI1MjRcIjogXCJVY2lyY3VtZmxleC5zbWNwXCIsXG4gICAgICAgIFwiNTI1XCI6IFwiVWRpZXJlc2lzLnNtY3BcIixcbiAgICAgICAgXCI1MjZcIjogXCJZYWN1dGUuc21jcFwiLFxuICAgICAgICBcIjUyN1wiOiBcIlRob3JuLnNtY3BcIixcbiAgICAgICAgXCI1MjhcIjogXCJZZGllcmVzaXMuc21jcFwiLFxuICAgICAgICBcIjUyOVwiOiBcImZfZlwiLFxuICAgICAgICBcIjUzMFwiOiBcImZpXCIsXG4gICAgICAgIFwiNTMxXCI6IFwiZmxcIixcbiAgICAgICAgXCI1MzJcIjogXCJmX2ZfaVwiLFxuICAgICAgICBcIjUzM1wiOiBcImZfZl9sXCIsXG4gICAgICAgIFwiNTM0XCI6IFwic190XCIsXG4gICAgICAgIFwiNTM1XCI6IFwiemVyby5sZlwiLFxuICAgICAgICBcIjUzNlwiOiBcIm9uZS5sZlwiLFxuICAgICAgICBcIjUzN1wiOiBcInR3by5sZlwiLFxuICAgICAgICBcIjUzOFwiOiBcInRocmVlLmxmXCIsXG4gICAgICAgIFwiNTM5XCI6IFwiZm91ci5sZlwiLFxuICAgICAgICBcIjU0MFwiOiBcImZpdmUubGZcIixcbiAgICAgICAgXCI1NDFcIjogXCJzaXgubGZcIixcbiAgICAgICAgXCI1NDJcIjogXCJzZXZlbi5sZlwiLFxuICAgICAgICBcIjU0M1wiOiBcImVpZ2h0LmxmXCIsXG4gICAgICAgIFwiNTQ0XCI6IFwibmluZS5sZlwiLFxuICAgICAgICBcIjU0NVwiOiBcImEuYWx0XCIsXG4gICAgICAgIFwiNTQ2XCI6IFwiYWdyYXZlLmFsdFwiLFxuICAgICAgICBcIjU0N1wiOiBcImFhY3V0ZS5hbHRcIixcbiAgICAgICAgXCI1NDhcIjogXCJhY2lyY3VtZmxleC5hbHRcIixcbiAgICAgICAgXCI1NDlcIjogXCJhdGlsZGUuYWx0XCIsXG4gICAgICAgIFwiNTUwXCI6IFwiYWRpZXJlc2lzLmFsdFwiLFxuICAgICAgICBcIjU1MVwiOiBcImFyaW5nLmFsdFwiLFxuICAgICAgICBcIjU1MlwiOiBcImFtYWNyb24uYWx0XCIsXG4gICAgICAgIFwiNTUzXCI6IFwiYWJyZXZlLmFsdFwiLFxuICAgICAgICBcIjU1NFwiOiBcImFvZ29uZWsuYWx0XCIsXG4gICAgICAgIFwiNTU1XCI6IFwiZy5hbHRcIixcbiAgICAgICAgXCI1NTZcIjogXCJnY2lyY3VtZmxleC5hbHRcIixcbiAgICAgICAgXCI1NTdcIjogXCJnYnJldmUuYWx0XCIsXG4gICAgICAgIFwiNTU4XCI6IFwiZ2RvdGFjY2VudC5hbHRcIixcbiAgICAgICAgXCI1NTlcIjogXCJ1bmkwMTIzLmFsdFwiLFxuICAgICAgICBcIjU2MFwiOiBcImFtcGVyc2FuZC5hbHRcIixcbiAgICAgICAgXCI1NjFcIjogXCJzbGFzaC5jYXBcIixcbiAgICAgICAgXCI1NjJcIjogXCJiYWNrc2xhc2guY2FwXCIsXG4gICAgICAgIFwiNTYzXCI6IFwiYmFyLmNhcFwiLFxuICAgICAgICBcIjU2NFwiOiBcImJyb2tlbmJhci5jYXBcIixcbiAgICAgICAgXCI1NjVcIjogXCJidWxsZXQuY2FwXCIsXG4gICAgICAgIFwiNTY2XCI6IFwicGFyZW5sZWZ0LnNtY3BcIixcbiAgICAgICAgXCI1NjdcIjogXCJwYXJlbnJpZ2h0LnNtY3BcIixcbiAgICAgICAgXCI1NjhcIjogXCJicmFjZWxlZnQuc21jcFwiLFxuICAgICAgICBcIjU2OVwiOiBcImJyYWNlcmlnaHQuc21jcFwiLFxuICAgICAgICBcIjU3MFwiOiBcImJyYWNrZXRsZWZ0LnNtY3BcIixcbiAgICAgICAgXCI1NzFcIjogXCJicmFja2V0cmlnaHQuc21jcFwiLFxuICAgICAgICBcIjU3MlwiOiBcImJhci5zbWNwXCIsXG4gICAgICAgIFwiNTczXCI6IFwiYXQuc21jcFwiLFxuICAgICAgICBcIjU3NFwiOiBcImFtcGVyc2FuZC5hbHQuc21jcFwiLFxuICAgICAgICBcIjU3NVwiOiBcInVuaTAyMUEuc21jcFwiLFxuICAgICAgICBcIjU3NlwiOiBcIlRfaFwiLFxuICAgICAgICBcIjU3N1wiOiBcImNfdFwiLFxuICAgICAgICBcIjU3OFwiOiBcImZfZl9iXCIsXG4gICAgICAgIFwiNTc5XCI6IFwiZl9mX2hcIixcbiAgICAgICAgXCI1ODBcIjogXCJmX2ZfalwiLFxuICAgICAgICBcIjU4MVwiOiBcImZfZl9rXCIsXG4gICAgICAgIFwiNTgyXCI6IFwiZl9mX3RcIixcbiAgICAgICAgXCI1ODNcIjogXCJmX2JcIixcbiAgICAgICAgXCI1ODRcIjogXCJmX2hcIixcbiAgICAgICAgXCI1ODVcIjogXCJmX2pcIixcbiAgICAgICAgXCI1ODZcIjogXCJmX2tcIixcbiAgICAgICAgXCI1ODdcIjogXCJmX3RcIixcbiAgICAgICAgXCI1ODhcIjogXCJ0X3RcIlxuICAgIH1cbn1cbiIsInZhciBjb21wb25lbnQgPSByZXF1aXJlKCcuL3ZlbmRvci9lZGl0YWJsZS5qcycpXG52YXIgRWRpdGFibGUgPSBjb21wb25lbnQoJ3lpZWxkcy1lZGl0YWJsZScpXG52YXIgZGF0YSA9IHJlcXVpcmUoJy4uL3Rlc3QvZml4dHVyZXMva2xpbmljLXNsYWIuanNvbicpXG52YXIgZm9udEZlYXR1cmVBYmV0dGluZ3MgPSByZXF1aXJlKCcuLi8nKVxudmFyIGZpbmRBbmRSZXBsYWNlRE9NVGV4dCA9IHJlcXVpcmUoJy4vdmVuZG9yL2ZpbmRBbmRSZXBsYWNlRE9NVGV4dCcpXG5cbnZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1lZGl0YWJsZScpXG52YXIgY3RybCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jb250cm9sJylcbnZhciBlZGl0ID0gbmV3IEVkaXRhYmxlKGVsKVxudmFyIHBhdHRlbnJzID0gZm9udEZlYXR1cmVBYmV0dGluZ3MoZGF0YS5nc3ViLCBkYXRhLmduYW1lcylcblxuZWRpdC5lbmFibGUoKVxuZWRpdC5vbignc3RhdGUnLCBmdW5jdGlvbiAoZSkge1xuICB2YXIgZnRcbiAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gIC8vIGNvbnNvbGUubG9nKGUpXG4gIGN0cmwuaW5uZXJIVE1MID0gZWwuaW5uZXJIVE1MXG5cbiAgZm9yIChmdCBpbiBwYXR0ZW5ycykge1xuICAgIGlmIChwYXR0ZW5ycy5oYXNPd25Qcm9wZXJ0eShmdCkpIHtcbiAgICAgIHZhciBwID0gcGF0dGVucnNbZnRdXG4gICAgICAvLyBwID0gcC5zcGxpdCgnLCcpXG4gICAgICAvLyBwLnNoaWZ0KClcblxuICAgICAgLy8gZmZrLCBmZmksIGFuZCBmZmwgYXJlIGhhcmQtY29kZWQgYXMgYW4gZXhhbXBsZSBvZiB3aGVyZVxuICAgICAgLy8gdGhlIFJlZ0V4cCBzaG91bGQgd29yayBiZXR0ZXIsIGZyb20gbG9uZ2VzdCBwaHJhc2VcbiAgICAgIC8vIHRvIHNob3J0ZXN0LiBBcnJheSBmbGF0dGVuaW5nIHdvdWxkIG5lZWQgdG9cbiAgICAgIC8vIHRha2UgdGhpcyBpbnRvIGFjY291bnQsIHRvby5cbiAgICAgIC8vIHZhciByZWdBcnIgPSAnKGZmaSl8KGZmbCl8KGZmayl8KCcgKyBwLmpvaW4oJyl8KCcpICsgJyknXG4gICAgICB2YXIgcmVnQXJyID0gJygnICsgcC5qb2luKCcpfCgnKSArICcpJ1xuXG4gICAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cChyZWdBcnIsICdnJylcblxuICAgICAgZmluZEFuZFJlcGxhY2VET01UZXh0KGN0cmwsIHtcbiAgICAgICAgZmluZDogcmVnLFxuICAgICAgICB3cmFwOiAnbWFyaycsXG4gICAgICAgIHJlcGxhY2U6IGZ1bmN0aW9uIChwb3J0aW9uLCBtYXRjaCkge1xuICAgICAgICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbWFyaycpXG4gICAgICAgICAgZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtY29udGVudCcsIHBvcnRpb24udGV4dClcbiAgICAgICAgICBlLnNldEF0dHJpYnV0ZSgnZGF0YS1mZWF0JywgZnQpXG4gICAgICAgICAgZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaGlnaGxpZ2h0ZWQnLCB0cnVlKVxuICAgICAgICAgIGUuY2xhc3NMaXN0LmFkZCgnaXMtZmVhdCcsICdpcy0nICsgZnQpXG4gICAgICAgICAgZS5pbm5lckhUTUwgPSBwb3J0aW9uLnRleHRcbiAgICAgICAgICByZXR1cm4gZVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgfVxuICB9XG5cbn0pXG4iXX0=
