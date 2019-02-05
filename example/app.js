const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

import {registerSettings, getSettings } from "./settings";
const settings_ui = require("@denis.moroz/tl-settings-ui")
const app = express()

app.set('view engine', 'ejs')

app.use(cookieParser())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(function (error, req, res, next) {
  console.error(error.stack)
  res.status(500).send({ error: error.message || error })
})

registerSettings().then(() => {
  settings_ui.register(app, "/", getSettings())

  const port = getSettings().port;
  app.listen(port, () => console.log(`Listening on port: ${port}`))
})



