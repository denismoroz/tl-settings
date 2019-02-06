const express = require('express')
const bodyParser = require('body-parser')

const settings = require("./settings")

const app = express()

app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(function (error, req, res, next) {
  console.error(error.stack)
  res.status(500).send({ error: error.message || error })
})

settings.registerSettings().then(() => {
  const settings_ui = require("@denis.moroz/tl-settings-ui")
  settings_ui.register(app, "/")

  const app_settings = settings.getSettingsInstance()
  const port = app_settings.port;
  app.listen(port, () => console.log(`Listening on port: ${port}`))
})



