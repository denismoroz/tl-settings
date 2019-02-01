const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const staticify = require('staticify')(path.join(__dirname, 'public'))

const settings = require("./settings").getSettings()

const settingsRoutes = require('./ui/index');
const app = express()

app.set('view engine', 'ejs')
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))
app.use(staticify.middleware)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', settingsRoutes)

app.use(function (error, req, res, next) {
  console.error(error.stack)
  res.status(500).send({ error: error.message || error })
})

const port = settings.port;

app.listen(port, () => console.log(`Listening on port: ${port}`))



