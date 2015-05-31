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
    should(patterns.dlig).containEql('th')
    done()
  })

  // dlig
  // th (different, swsh t + th)

  // salt
  // f, h, l, b, k

  // titl
  // CRSTYMEABDFGWVUQPONLKJIHXZ

})
