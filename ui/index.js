const express = require('express')
const router = express.Router()
const config = require('../config')

const settings = require("../lib/settings").buildSettings(config)

router.get('/', (req, res) => {
  res.render('settings')
});

router.get('/settings', async (req, res) => {
  let s = await settings
  let settings_data =  await s.get()
  console.log("UI: Send setting: ", settings_data)
  res.json(settings_data);
});

router.put('/settings', async (req, res) => {
  const settings_data = req.body
  console.log("UI: Received:", settings_data)

  let s = await settings
  await s.set(settings_data)
  res.json(settings_data)
});

module.exports = router;

