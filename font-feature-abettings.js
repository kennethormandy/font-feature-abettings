/*!
 * Font Feature Abettings v0.0.4
 * Highlight OpenType features based on a font’s provided data.
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
    , ft
    , patterns = {}
    , permitted = ['liga', 'dlig', 'lnum'] // Options
    , figures = ['pnum', 'onum', 'lnum', 'tnum']
    ;

  /**
   * Flatten gsub table into feature names
   *
   */
  for(feat in data.gsub) {
    if(data.gsub.hasOwnProperty(feat)) {
      if(figures.indexOf(feat) !== -1) {
        // Regex and FAR need to happen separately
        // so this can be a Regex instead of…this thing:
        patterns[feat] = ',0,1,2,3,4,5,6,7,8,9';
      } else if(permitted.indexOf(feat) !== -1) {
        patterns[feat] = '';
        for(item in data.gsub[feat]) {
          var gsubPortion = data.gsub[feat][item];
          // It seems like this should all be part of @sintaxi’s thing, too
          if(data.gsub[feat].hasOwnProperty(item)) {
            // if(gsubPortion.length === 1) {
            //   console.log(data.gnames[gsubPortion[0]]);
            // } else
            if(Object.prototype.toString.call(gsubPortion) === '[object Object]') {
              patterns[feat] += ',' + (iterate(gsubPortion, '' + data.gnames[item]));
            }
            // else {
            //   // If it’s not an object, it’s a single character substitution
            //   return patterns += ',' + iterate(data.gsub[feat]).join());
            // }
          }
        }
      }
    }
  }

  /**
   * Highlight flattened features
   *
   */
    for(ft in patterns) {
      if(patterns.hasOwnProperty(ft)) {
        var ptrns = patterns[ft];
        ptrns = ptrns.split(',');
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
            e.setAttribute('data-feat', ft);
            e.setAttribute('data-highlighted', true);
            addClass(e, 'mark');
            addClass(e, 'mark--' + ft);
            e.innerHTML = portion.text;
            return e;
          }
        });

      }
    }

});
