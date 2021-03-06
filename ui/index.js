const express = require('express')
const ui = require('./ui');
const path = require('path')

function register(app, settings_route) {
  app.use(express.static(path.join(__dirname, 'public')))
  app.use(settings_route, ui)
}

module.exports = { register }