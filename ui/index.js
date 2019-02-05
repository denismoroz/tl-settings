const express = require('express')
const ui = require('./ui');
const path = require('path')

function register(app, settings_route, settings) {
  app.use(express.static(path.join(__dirname, 'public')))
  app.use(settings_route, ui.buildSettingsUI(settings))
}

module.exports = { register }