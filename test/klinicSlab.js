var should = require('should')
var fontFeatureAbettings = require('../')
var klinicSlab = require('./fixtures/klinic-slab.json')

describe("parse", function () {
  describe("Klinic Slab", function () {
    var patterns = fontFeatureAbettings(klinicSlab.gsub, klinicSlab.gnames)
    it("should parse features from Klinic Slab’s metadata", function (done) {
      should.exist(patterns)
      done()
    })
    it("should parse standard ligatures from Klinic Slab’s metadata", function (done) {
      should.exist(patterns.liga)
      patterns.should.have.property('liga')
      it("should contain f ligatures", function (done) {
        patterns.liga
          .should.contain('ff')
          .should.contain('fh')
          .should.contain('fi')
          .should.contain('fj')
          .should.contain('fk')
          .should.contain('fl')
          .should.contain('ft')
        done()
      })
      it("should contain t ligatures", function (done) {
        patterns.liga.should.contain('tt')
        done()
      })
      done()
    })
    it("should parse discretionary ligatures from Klinic Slab’s metadata", function (done) {
      should.exist(patterns.dlig)
      patterns.should.have.property('dlig')
      it("should contain Th ligatures", function (done) {
        patterns.dlig.should.contain('Th')
        done()
      })
      it("should contain ct ligatures", function (done) {
        patterns.dlig.should.contain('ct')
        done()
      })
      it("should contain st ligatures", function (done) {
        patterns.dlig.should.contain('st')
        done()
      })
      done()
    })
    it("should parse lnum from Klinic Slab’s metadata", function (done) {
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
})
