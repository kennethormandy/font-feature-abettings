var should = require('should')
var fontFeatureAbettings = require('../')
var klinicSlab = require('./fixtures/klinic-slab.json')

describe('Klinic Slab', function () {
  var patterns = fontFeatureAbettings(klinicSlab.gsub, klinicSlab.gnames)
  it('should parse features from Klinic Slab’s metadata', function (done) {
    should.exist(patterns)
    done()
  })
  it('should parse standard ligatures from Klinic Slab’s metadata', function (done) {
    should.exist(patterns.liga)
    patterns.should.have.property('liga')
    done()
  })
  it('should contain f ligatures', function (done) {
    should(patterns.liga)
      .containEql('ff')
      .containEql('fh')
      .containEql('fi')
      .containEql('fj')
      .containEql('fk')
      .containEql('fl')
      .containEql('ft')
    done()
  })
  it('should contain t ligatures', function (done) {
    patterns.liga.should.containEql('tt')
    done()
  })
  it('should parse discretionary ligatures from Klinic Slab’s metadata', function (done) {
    should.exist(patterns.dlig)
    patterns.should.have.property('dlig')
    done()
  })
  it('should contain Th ligatures', function (done) {
    patterns.dlig.should.containEql('Th')
    done()
  })
  it('should contain ct ligatures', function (done) {
    patterns.dlig.should.containEql('ct')
    done()
  })
  it('should contain st ligatures', function (done) {
    patterns.dlig.should.containEql('st')
    done()
  })
  it('should parse lnum from Klinic Slab’s metadata', function (done) {
    should.exist(patterns.lnum)
    patterns.should.have.property('lnum').with.lengthOf(10)
    patterns.lnum[0].should.be.type('number')
    should(patterns.lnum)
      .containEql(3)
      .containEql(9)
      .not.containEql(10)
    done()
  })
})
