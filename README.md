# google-spreadsheet-notifier
Displays OS notifications with content from Google Spreadsheets.

## Install

For programatic access in your project:

`npm install --save google-spreadsheet-notifier`

For global shell access:

`npm install -g google-spreadsheet-notifier`

## Shell usage

Let **GSN** ask for required params:

`gsn`

Example, passing all arguments:

`gsn -- --id=1cqhJqJISbAXf98avPK9N1B8W7XNkixUKy6NUggqlWwc --range=A1 --title=Hello --time=18:30`

Example, letting **GSN** ask for missing arguments:

`gsn -- --id=1cqhJqJISbAXf98avPK9N1B8W7XNkixUKy6NUggqlWwc --range=A1`

## Command line arguments

- `id`: Google spreadsheet id.
- `range`: Google spreadsheet range. Examples: `A1`, `A1:H1`, `A1`, `H10`.
- `title`: Notification title.
- `time`: Time during the current day when notification will be displayed. Examples: `1:45`, `14:30`, `20:15`.

## Programatic usage

Yeah, you can also install and require **GSN** in your own projects.
One cool thing about using it programatically is that you can define your own filters.

A **filter** is a function that receives obtained rows from the Google API and returns an array,
which will be used to display the notification.

So, you can use filters to precisely set the value or values you want to appear in the notification,
or even notify something else based on the data you received.

```
'use strict'
const googleSpreadsheetNotifier = require('google-spreadsheet-notifier')
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
```

## Why?

I wanted a simple way to login to Google, access a spreadsheet and get a notification, 
at a defined time, with a value I'm interested in.
**GSN** does that.

## Reference

**GSN** uses the official [NodeJS Client Library from Google](https://github.com/google/google-api-nodejs-client) 
to access the Google API and work its magic.

## Using with your own Google App

If you want to use **GSN** with your own Google App you should clone this repo and update the file 
`client_id.json` with the credentials obtained from Google Console for your app.
