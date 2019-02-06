const express = require('express')
const path = require('path')
const core = require('@denis.moroz/tl-settings-core')
const settings = core.getSettingsInstance()

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


const router = express.Router()

router.get('/', (req, res) => {
  const tpl = path.join(__dirname, '../views/settings')
  res.render(tpl)
});


function settings_to_json() {


  let settings_json = {};
  for (let field of settings.fields) {
    settings_json[field] = {
      name: field,
      value: settings[field],
      db_value: settings.db_value[field],

      default_value: settings.default_value[field],
      description: settings.description[field],
      type: _pack_type(settings.type[field]),
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

  let fields_to_clean_up = new Set(Object.keys(settings._db_value)) ;
  for (const field in settings_data) {
    const s = settings_data[field];
    await settings.save(s.name, s.value)
    fields_to_clean_up.delete(s.name);
  }

  for (const field of fields_to_clean_up) {
    await settings.delete(field);
  }
  res.json(settings_to_json())
});



module.exports = router;

