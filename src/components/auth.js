'use strict'
const fs = require('fs')
const {resolve} = require('path')
const readline = require('readline')
const GoogleAuth = require('google-auth-library')
const open = require('open')
const winston = require('winston')
winston.level = 'info'

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.credentials.json
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
const TOKEN_DIR = (
  process.env.HOME ||
  process.env.HOMEPATH ||
  process.env.USERPROFILE
) + '/.credentials/'
const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.credentials.json'

module.exports = {grant}

// ----------------------------------------------------------------------

/**
 * Completes the authentication process and calls passed callback
 * with the obtained auth credentials.
 * This credentials object is used to access documents using the
 * Google API.
 *
 * @param  {Function} callback
 */
function grant (callback) {
  // Load client secrets from a local file.
  const creds = resolve(__dirname, '../../client_id.json')
  fs.readFile(creds, function processClientSecrets (err, content) {
    if (err) {
      winston.log('debug', 'Error loading client secret file: ' + err)
      return
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Sheets API.
    authorize(JSON.parse(content), callback)
  })
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize (credentials, callback) {
  const clientSecret = credentials.installed.client_secret
  const clientId = credentials.installed.client_id
  const redirectUrl = credentials.installed.redirect_uris[0]
  const auth = new GoogleAuth()
  const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback)
    } else {
      oauth2Client.credentials = JSON.parse(token)
      callback(oauth2Client)
    }
  })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken (oauth2Client, callback) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  // Display and open URL to authenticate with Google.
  console.log('-'.repeat(80))
  open(authUrl, (error) => {
    if (error) {
      console.log('Authorize this app by visiting this url: ', authUrl)
      console.log()
    }
  })

  rl.question('Enter the code obtained on the authorization page: ', function (code) {
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err)
        console.log('-'.repeat(80))
        console.log()
        return
      }

      console.log('-'.repeat(80))
      console.log()
      oauth2Client.credentials = token
      storeToken(token)
      callback(oauth2Client)
    })
  })
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken (token) {
  try {
    fs.mkdirSync(TOKEN_DIR)
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token))
  winston.log('debug', 'Token stored to ' + TOKEN_PATH)
}
