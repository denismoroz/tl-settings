
function type(_type) {
  return function decorator(target, name, descriptor) {
    target._addToMeta(name, {"type": _type})
    return descriptor;
  }
}

function description(_description) {
  return function decorator(target, name, descriptor) {
    target._addToMeta(name, {"description": _description});
    return descriptor;
  }
}


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

const SETTINGS_KEY = Symbol.for("tl-settings-settings");

class SettingsBase {

  constructor() {
    this._db_value = {}
  }


  get fields() {
    return Object.keys(this._meta)
  }

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

  get(name) {
    console.log("Get DBL value", name, this._db_value, this);
    return this._db_value ? this._db_value[name] : null;
  }

  async save(name, value) {
    console.log("Base: save: ", name, value)
    await this._db.update(name, value);
    this._pubsub.notify(name)
  }

  async delete(name) {
    console.log("Base: delete: ", name)
    await this._db.delete(name);
    this._pubsub.notify(name)
  }

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


function getSettingsInstance() {
  return global[SETTINGS_KEY];
}

module.exports = {type, description, default_value, SettingsBase, getSettingsInstance}