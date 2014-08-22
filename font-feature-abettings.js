/*!
 * Font Feature Abettings v0.0.1
 * Reluctantly polyfills OpenType font-feature-settings in Safari, et al.
 * http://kennethormandy.com
 * Copyright © 2014 Kenneth Ormandy. Available under the MIT License.
 */

var far      = require('./vendor/findAndReplaceDOMText')
  , data     = require('./test/data')
  ;

window.fontFeatureAbettings = (function(el) {

  var iterate
    , addClass
    ;

  /**
   * Flatten gsub, wizardry by @sintaxi
   */
  iterate = function(node, prefix) {
    var arr = [];

    // Nothing to do
    if (Object.prototype.toString.call(node) !== '[object Object]') {
      return prefix || [];
    }

    // Inception
    for (var key in node) {
      arr.push(iterate(data.gnames[node[key]], (prefix || '') + data.gnames[key]));
    }

    // Flatten
    return [].concat.apply([], arr);
  };

  /**
   * Adds a class to any element
   *
   * @param  {element} el
   * @param  {string}  className
   */
  addClass = function(e, className) {
    if (e.classList) {
      return e.classList.add(className);
    } else {
      return e.className += ' ' + className;
    }
  };

  var item
    , feat
    , ptrns
    , patterns = ''
    , permitted = ['liga', 'dlig']
    ;

  for(feat in data.gsub) {
    if(permitted.indexOf(feat) !== -1) {
      for(item in data.gsub[feat]) {
        // It seems like this should all be part of @sintaxi’s thing, too
        if(data.gsub[feat].hasOwnProperty(item)) {
          if(Object.prototype.toString.call(data.gsub[feat][item]) === '[object Object]') {
            patterns += ',' + (iterate(data.gsub[feat][item], '' + data.gnames[item]));
          }
          // else {
          //   // If it’s not an object, it’s a single character substitution
          //   return patterns += ',' + iterate(data.gsub[feat]).join());
          // }
        }
      }
    }
  }

  ptrns = patterns.split(',');
  ptrns.shift();

  // ffk is hard-coded as an example of where
  // the RegExp could work better Longest phrase
  // to shortest, array flattening would need to
  // take this into account, too
  var regArr = '(ffk)|(' + ptrns.join(')|(') + ')';
  var reg = new RegExp(regArr, 'g');

  findAndReplaceDOMText(el, {
    find: reg,
    wrap: 'mark',
    replace: function(portion, match) {
      var e = document.createElement('mark');
      e.setAttribute('data-content', portion.text);
      e.setAttribute('data-feat', feat);
      e.setAttribute('data-highlighted', true);
      addClass(e, 'mark');
      addClass(e, 'mark--' + feat);
      e.innerHTML = portion.text;
      return e;
    }
  });

});
