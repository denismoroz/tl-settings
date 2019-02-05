const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const staticify = require('staticify')(path.join(__dirname, 'public'))

import {registerSettings, getSettings } from "./settings";

const app = express()

app.set('view engine', 'ejs')
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))
app.use(staticify.middleware)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(function (error, req, res, next) {
  console.error(error.stack)
  res.status(500).send({ error: error.message || error })
})

registerSettings().then(() => {
  const settingsRoutes = require('./ui/index');
  app.use('/', settingsRoutes)


  console.log(getSettings().db_connect_url)

  const port = getSettings().port;



  app.listen(port, () => console.log(`Listening on port: ${port}`))
})



