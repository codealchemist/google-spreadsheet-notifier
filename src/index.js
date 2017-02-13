'use strict'
let args = require('minimist')(process.argv.slice(2))
const auth = require('./components/auth')
const series = require('p-series')
const spreadsheet = require('./components/spreadsheet')
const askument = require('askument')
const notifier = require('node-notifier')
const scheduler = require('node-schedule')
const chrono = require('chrono-node')
const extend = require('util')._extend
const winston = require('winston')
winston.level = 'info'

/**
 * Gets or asks for required arguments, schedules notification
 * if time is specified, and fires notification.
 * If `filter` function is provided uses it to filter data before
 * setting notification.
 *
 * @param  {function} filter
 */
function start (params) {
  // Extend arguments with passed params.
  // Passed params override arguments.
  args = extend(args, params)

  // Set filter.
  let filter
  if (params && params.filter) filter = params.filter

  // Ask for required params if not provided.
  const promises = [
    () => askument('id', 'Spreadsheet ID:', args),
    () => askument('range', 'Spreadsheet Range:', args),
    () => askument('title', 'Notification Title:', args)
  ]

  // Get all required parameters.
  series(promises).then((results) => {
    const spreadsheetId = results[0]
    const spreadsheetRange = results[1]
    const notificationTitle = results[2] || 'Google Spreadsheet Notifier'
    winston.log('debug', '- Spreadsheet ID:', spreadsheetId)
    winston.log('debug', '- Spreadsheet Range:', spreadsheetRange)
    winston.log('debug', '- Notification Title:', notificationTitle)

    if (!spreadsheetId) throw new Error('Spreadsheet ID is required!')
    if (!spreadsheetRange) throw new Error('Spreadsheet Range is required!')

    // Schedule notification.
    const notificationTime = args.time
    if (notificationTime) {
      schedule({notificationTime, spreadsheetId, spreadsheetRange, notificationTitle, filter})
      return
    }

    // Notify immediately.
    notify({spreadsheetId, spreadsheetRange, notificationTitle, filter})
  })
  .catch((error) => {
    console.error(error)
    process.exit()
  })
}

function getRows ({spreadsheetId, spreadsheetRange}) {
  return new Promise((resolve, reject) => {
    // Ensure the user gives us access to its Google Drive documents.
    auth.grant((auth) => {
      spreadsheet
        .getRows({auth, spreadsheetId, spreadsheetRange})
        .then((rows) => resolve(rows))
    })
  })
}

function schedule ({notificationTime, spreadsheetId, spreadsheetRange, notificationTitle, filter}) {
  if (!isValidTime(notificationTime)) {
    winston.log('debug', '- Unable to schedule notification, invalid time.')
    return
  }

  const date = chrono.parseDate(`today at ${notificationTime}`)
  scheduler.scheduleJob(date, () => {
    notify({spreadsheetId, spreadsheetRange, notificationTitle, filter})
  })
  winston.log('debug', `- Notification scheduled for ${notificationTime}`)
}

function isValidTime (time) {
  return time.match(/[0-9]{1,2}:[0-9]{2,}/)
}

function notify ({spreadsheetId, spreadsheetRange, notificationTitle, filter}) {
  getRows({spreadsheetId, spreadsheetRange}).then((rows) => {
    // winston.log('debug', '-- ROWS:', rows)
    if (typeof filter === 'function') {
      rows = filter(rows)
      winston.log('debug', '-- FILTERED ROWS:', rows)
    }

    // Set notification message.
    let message = rows[0]
    if (rows.length > 1) message = JSON.stringify(rows)

    // Display notification.
    notifier.notify({
      title: notificationTitle,
      message: message || '(EMPTY)',
      sound: 'Funk'
    }, (error, response, metadata) => {
      if (error) {
        winston.log('debug', '-- Unable to display notification. Error: ', error)
        winston.log('debug', '')
        process.exit()
      }

      winston.log('debug', '-- Notification displayed. Bye! --')
      winston.log('debug', '')
      process.exit()
    })
  })
}

module.exports = start
