'use strict'
const googleSpreadsheetNotifier = require('./index')
const winston = require('winston')
winston.level = 'info' // Set to 'debug' for more output.

// Set rows filter.
function filter (rows) {
  // Filter rows.
  let filteredRows = []

  // Iterate rows.
  rows.some((row) => {
    // Iterate row values.
    return row.some((value) => {
      if (value === 'Thursday') {
        filteredRows.push(row[7])
        return true
      }
    })
  })

  return filteredRows
}

// Set params and start Google Spreadsheet Notifier.
const params = {
  id: '1cqhJqJISbAXf98avPK9N1B8W7XNkixUKy6NUggqlWwc',
  range: 'A1:I9',
  filter
}
googleSpreadsheetNotifier(params)
