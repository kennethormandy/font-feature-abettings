/**
 * Font Feature Abettings __VERSION__
 * https://github.com/kennethormandy/font-feature-abettings
 * @author Kenneth Ormandy http://kennethormandy.com
 * @license Copyright © 2014–2015 Kenneth Ormandy.
 *          Available under the MIT license.
 */

module.exports = function (gsub, gnames, options) {

  var item
  var feat
  var patterns = {}
  var iterate
  var figures = ['pnum', 'onum', 'lnum', 'tnum']
  var opts = {
    permitted: [
      'liga',
      'dlig',
      'pnum',
      'onum',
      'lnum',
      'tnum'
    ]
  }

  // User defined options
  for (var o in options) {
    opts[o] = options[o]
  }

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
    if (gsub.hasOwnProperty(feat) && opts.permitted.indexOf(feat) !== -1) {
      if (figures.indexOf(feat) !== -1) {
        // Hard-code numerals if there are numeral styles
        patterns[feat] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      } else {
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
