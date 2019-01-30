const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const staticify = require('staticify')(path.join(__dirname, 'public'))

const config = require('./config')
const settingsRoutes = require('./ui/index')

const app = express()

app.set('view engine', 'ejs')
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))
app.use(staticify.middleware)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.locals.config = config

app.use('/', settingsRoutes)

app.use(function (error, req, res, next) {
  console.error(error.stack)
  res.status(500).send({ error: error.message || error })
})

app.listen(config.port, () => console.log(`Listening on port: ${config.port}`))
