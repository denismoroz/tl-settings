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

function settings_list() {
  let result = []
  for (let field of settings.fields) {
    const s = {
      name: field,
      value: settings[field],
      dbValue: settings.dbValue[field],
      defaultValue: settings.defaultValue[field],
      description: settings.description[field],
      type: _pack_type(settings.type[field]),
      readonly: !!settings.readonly[field]
    }
    result.push(s)
  }
  return result
}

router.get('/', (req, res) => {
  const tpl = path.join(__dirname, '../views/settings')
  res.render(tpl, {settings: settings_list()})
});


router.put('/', async (req, res) => {
  const settings_data = req.body
  //console.log("tl-settings: ui: save ", settings_data)
  await settings.save(settings_data.name, settings_data.value)
  res.sendStatus(200)
})

router.delete('/', async (req, res) => {
  const settings_data = req.body
  //console.log("tl-settings: ui: delete ", settings_data)
  await settings.delete(settings_data.name)
  res.sendStatus(200)
})


module.exports = router;

