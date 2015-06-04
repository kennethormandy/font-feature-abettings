var should = require('should')
var fontFeatureAbettings = require('../')
var lavanderia = require('./fixtures/lavanderia.json')

describe('Lavanderia', function () {
  var patterns = fontFeatureAbettings(lavanderia.GSUB.latn.DFLT, lavanderia.post.glyphNames)
  it('should parse features from Lavanderia’s metadata', function (done) {
    should.exist(patterns)
    done()
  })
  it('should contain ligatures', function (done) {
    should(patterns.liga)
      .containEql('br')
      .containEql('bs')
      .containEql('fr')
      .containEql('Fr')
      .containEql('xt')
      .containEql('oe')
      .containEql('ox')
      .containEql('we')
    done()
  })
  it('should contain descretionary ligatures', function (done) {
    should(patterns.dlig).containEql('th') // t.swsh + th
    done()
  })

  // it should allow you to specify options about
  // what opentype features you actually want to
  // search for (with the defaults being set as they are)

  // then, it should allow you to search for (probably)
  // single character alternates like `salt` and `titl`

  // salt
  // f, h, l, b, k

  // titl
  // CRSTYMEABDFGWVUQPONLKJIHXZ

})
