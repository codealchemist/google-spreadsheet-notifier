#!/usr/bin/env node
'use strict'
const googleSpreadsheetNotifier = require('../src/index.js')
const winston = require('winston')
winston.level = 'debug' // Enable console output.

console.log(`
GOOGLE SPREADSHEET NOTIFIER
---------------------------
`)

googleSpreadsheetNotifier()
