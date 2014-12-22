var component             = require('../vendor/editable.js');
var Editable              = component('yields-editable');
var data                  = require('./data.json');
var fontFeatureAbettings  = require('../index.js');

var el    = document.querySelector('.js-editable');
var ctrl  = document.querySelector('.js-control');
var edit  = new Editable(el);
var pattenrs = fontFeatureAbettings(data.gsub, data.gnames);
var p;

edit.enable();
edit.on('state', function(e){
  e.preventDefault();
  // console.log(e);
  ctrl.innerHTML = el.innerHTML;

  for(ft in pattenrs) {
    if(pattenrs.hasOwnProperty(ft)) {
      p = pattenrs[ft];
      p = p.split(',');
      p.shift();

      // ffk, ffi, and ffl are hard-coded as an example of where
      // the RegExp should work better, from longest phrase
      // to shortest. Array flattening would need to
      // take this into account, too.
      // var regArr = '(ffi)|(ffl)|(ffk)|(' + p.join(')|(') + ')';
      var regArr = '(' + p.join(')|(') + ')';

      var reg = new RegExp(regArr, 'g');

      findAndReplaceDOMText(ctrl, {
        find: reg,
        wrap: 'mark',
        replace: function(portion, match) {
          var e = document.createElement('mark');
          e.setAttribute('data-content', portion.text);
          e.setAttribute('data-feat', ft);
          e.setAttribute('data-highlighted', true);
          e.classList.add('is-feat', 'is-' + ft);
          e.innerHTML = portion.text;
          return e;
        }
      });

    }
  }

});
