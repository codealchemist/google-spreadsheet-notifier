'use strict'

const expect = require('chai').expect
const googleSpreadsheetNotifier = require('../src/index')

// do not output debug logging from the app
const winston = require('winston')
winston.level = 'debug'

describe('Google Spreadsheet Notifier', () => {
  it('should be a function', () => {
    expect(typeof googleSpreadsheetNotifier).to.equal('function')
  })
})
