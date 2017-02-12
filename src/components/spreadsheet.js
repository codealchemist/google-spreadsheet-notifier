'use strict'
const google = require('googleapis')
const winston = require('winston')
winston.level = 'info'

function getRows ({auth, spreadsheetId, spreadsheetRange}) {
  // winston.log('- Got user auth: ', auth)
  winston.log('debug', '--> Opening spreadsheet...')
  winston.log('debug', '')

  return new Promise((resolve, reject) => {
    const sheets = google.sheets('v4')
    sheets.spreadsheets.values.get({
      auth: auth,
      spreadsheetId: spreadsheetId,
      range: spreadsheetRange
    }, function (err, response) {
      if (err) {
        winston.log('debug', '- The API returned an error: ' + err)
        process.exit()
        return
      }

      const rows = response.values
      resolve(rows)
    })
  })
}

module.exports = {
  getRows
}
