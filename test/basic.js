var should = require('should')
var fontFeatureAbettings = require('../')
var basic = require('./fixtures/basic.json')

describe('Klinic Slab', function () {
  it('should exist', function (done) {
    var patterns = fontFeatureAbettings(basic.gsub, basic.gnames)
    should.exist(patterns)
    done()
  })
  it('should accept single permitted option', function (done) {
    var patterns = fontFeatureAbettings(basic.gsub, basic.gnames, { permitted: 'liga' })
    should.exist(patterns)
    done()
  })
  it('should accept multiple permitted options', function (done) {
    var patterns = fontFeatureAbettings(basic.gsub, basic.gnames, { permitted: ['liga', 'ss01'] })
    should.exist(patterns)
    done()
  })

})
