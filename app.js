const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
// const Raven = require('raven')
//const staticify = require('staticify')(path.join(__dirname, 'public'))

const config = require('./config')
const settingsRoutes = require('./ui/index')

process.env.TZ = 'UTC'
// Raven.config(config.sentry.dsn).install()

const app = express()

// app.use(Raven.requestHandler())

app.set('view engine', 'ejs')
app.use(cookieParser())

// app.use(express.static(path.join(__dirname, 'public')))
//app.use(staticify.middleware)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.locals.config = config

app.use('/', settingsRoutes)

// app.use(Raven.errorHandler())

app.use(function (error, req, res, next) {
  console.error(error.stack)
  res.status(500).send({ error: error.message || error })
})

app.listen(config.port)
