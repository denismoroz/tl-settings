const express = require('express')
const router = express.Router()

import { getSettings } from "../settings";

const settings = getSettings();

router.get('/', (req, res) => {
  res.render('settings')
});


function _pack_type(t) {

  if (!t || t == String) return "text";

  if (t == Number) {
    return "number"
  }

  if (t == Boolean) {
    return "checkbox"
  }

  return "text"
}

function settings_to_json() {
  let settings_json = {};

  for (const field in settings.default_value) {
    settings_json[field] = {
      name: field,
      default_value: settings.default_value[field],
      description: settings.description[field],
      value: settings[field],
      type: _pack_type(settings.type[field]),
      db_value: settings.db_value[field],
    }
  }
  return settings_json
}

router.get('/settings', async (req, res) => {
  const settings_json = settings_to_json()
  console.log("UI: Send setting: ", settings_json);
  res.json(settings_json);
});

router.put('/settings', async (req, res) => {
  const settings_data = req.body
  console.log("UI: Received:", settings_data)

  let fields_to_clean_up = new Set(Object.keys(settings.db_value)) ;

  console.log("field to clean up init:", fields_to_clean_up);
  for (const field in settings_data) {
    const s = settings_data[field];
    await settings.save(s.name, s.value)
    fields_to_clean_up.delete(s.name);
  }

  console.log("field to clean up remaining:", fields_to_clean_up);

  for (const field of fields_to_clean_up) {
    await settings.delete(field);
  }
  res.json(settings_to_json())
});

module.exports = router;

