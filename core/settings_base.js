
// Decorator to provide a type for setting.
function type(_type) {
  return function decorator(target, name, descriptor) {
    target._addToMeta(name, {"type": _type})
    return descriptor;
  }
}
// Decorator to provide a description for setting.
function description(_description) {
  return function decorator(target, name, descriptor) {
    target._addToMeta(name, {"description": _description});
    return descriptor;
  }
}

// Decorator to provide a default_value for setting.
// It saves default value to meta object and updates a setting description.
// Settings value is searched first in DB and if it is missing default value is used.

function default_value(_default_value) {
  return function decorator(target, name, descriptor) {
    target._addToMeta(name, {"default_value": _default_value});

    return {
      enumerable: true,
      configurable: true,
      get: function () {
        const db_record = this.db_value[name]
        const meta = this._getMeta(name)
        let value = db_record ? db_record : meta.default_value
        if (!meta.type) {
          meta.type = String
        }
        let obj = meta.type(value);
        return obj
      },
    };

  }
}

// Symbol to store settings object singleton.
const SETTINGS_KEY = Symbol.for("tl-settings-settings");

class SettingsBase {

  constructor() {
    this._db_value = {}
  }

  // Returns all settings field names defined in child object.
  get fields() {
    return Object.keys(this._meta)
  }

  // Returns all db values for all fields defined in child object
  get db_value() {
    return this._db_value
  }

  get description () {
    return this._description;
  }

  get default_value () {
    return this._default_value;
  }

  get type() {
    return this._type;
  }

  // Consult memory cache and return settings from the db.
  get(name) {
    console.log("Get DBL value", name, this._db_value, this);
    return this._db_value ? this._db_value[name] : null;
  }

  // Save a new value for a setting.
  async save(name, value) {
    console.log("Base: save: ", name, value)
    await this._db.update(name, value);
    this._pubsub.notify(name)
  }

  // Delete a setting from database.
  async delete(name) {
    console.log("Base: delete: ", name)
    await this._db.delete(name);
    this._pubsub.notify(name)
  }

  // Initialization. Use dbClass to build DB backend. Use pubSubClass to build pubsub backend.
  // Class tries to load all settings after db is build.
  async init(dbClass, pubSubClass) {
    await this._setupDb(dbClass);
    this._setupPubSub(pubSubClass);
  }

  async _setupDb(dbClass) {
    this._db = new dbClass;
    await this._db.init(this);
    this._db_value = (await this._db.getAll()).reduce((acc, e) => {acc[e.name] = e.value; return acc;}, {});
  }

  _setupPubSub(pubSubClass) {
    this._pubsub = new pubSubClass();
    this._pubsub.init(this,
      async (channel, message) => {
        console.log("new message at: " + channel + ": " + message);
        await this._refreshValue(message);
      },
      function(err){
        console.log('Error in pubsub:', err)
      });
   }

  async _refreshValue(name) {
    const value = await this._db.get(name)

    console.log("Refresh settings: ", name, value)

    if (value == null) {
      delete this._db_value[name];
    }
    else {
      this._db_value[name] = value;
    }
  }

  _addToMeta(name, data) {
    let v = {};

    if (!this._meta) {
      this._meta = {}
      this._description = {}
      this._default_value = {}
      this._type = {}
    }

    if ("description" in data) {
      this._description[name] = data["description"]
    }
    if ("default_value" in data) {
      this._default_value[name] = data["default_value"]
    }
    if ("type" in data) {
      this._type[name] = data["type"]
    }

    if (name in this._meta) {
      v = this._meta[name];
    }
    this._meta[name] = {...v, ...data};
  }

  _getMeta(name) {
    return this._meta[name]
  }

  // Settings child class registration.
  // It builds a child class and register it as a singleton.
  // After that it calls init on it with DB and PubSub backend classes.
  static async registerSettings(settingsClass, dbClass, pubSubClass) {
    let globalSymbols = Object.getOwnPropertySymbols(global);
    let hasSettings = (globalSymbols.indexOf(SETTINGS_KEY) > -1);

    if (!hasSettings){
      let settings = new settingsClass();

      await settings.init(dbClass, pubSubClass);
      global[SETTINGS_KEY] = settings
    }
  }
}

// Retrivers settings object singleton.
function getSettingsInstance() {
  return global[SETTINGS_KEY];
}

module.exports = {type, description, default_value, SettingsBase, getSettingsInstance}