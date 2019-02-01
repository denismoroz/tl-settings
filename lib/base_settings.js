import { DBStorage } from "./model";
const redis = require('redis');

function type(_type) {
  return function decorator(target, name, descriptor) {
    target.addToMeta(name, {"type": _type})
    return descriptor;
  }
}

function description(_description) {
  return function decorator(target, name, descriptor) {
    target.addToMeta(name, {"description": _description});
    return descriptor;
  }
}


function default_value(_default_value) {
  return function decorator(target, name, descriptor) {
    target.addToMeta(name, {"default_value": _default_value});

    return {
      enumerable: true,
      configurable: true,
      get: function () {
        const db_record = this.db_value[name]
        const meta = this.getMeta(name)
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

  async init() {
    this._db = new DBStorage(this.db_connect_url);
    await this._db.checkTable();
    this._db_value = (await this._db.getAllRecords()).reduce((acc, e) => {acc[e.name] = e.value; return acc;}, {});
    this._setupRedis();
  }

  _setupRedis() {
    this._sub = redis.createClient();
    this._sub.subscribe(this.redis_channel);

    this._sub.on('error', function(err){
      console.log('Error in redis sub ', err)
    });

    this._pub = redis.createClient();

    this._pub.on('error', function(err){
      console.log('Error in redis pub ', err)
    });

    this._sub.on("message", async (channel, message) => {
      console.log("sub channel " + channel + ": " + message);
      await this._refreshValue(message);
    });
  }

  async _refreshValue(name) {
    const value = await this._db.getRecord(name)

    if (value == null) {
      delete this._db_value[name];
    }
    else {
      this._db_value[name] = value;
    }
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

  addToMeta(name, data) {
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
  getMeta(name) {
    return this._meta[name]
  }

  get(name) {
    console.log("Get DBL value", name, this._db_value, this);
    return this._db_value ? this._db_value[name] : null;
  }

  async save(name, value) {
    console.log("Base: save: ", name, value)
    await this._db.updateRecord(name, value);
    this._pub.publish(this.redis_channel, name)
  }

  async delete(name) {
    console.log("Base: delete: ", name)
    await this._db.deleteRecord(name);
    this._pub.publish(this.redis_channel, name)
  }

  static async build(child) {
    console.log("Building settings");
    let obj = new child();
    await obj.init()
    return obj
  }

  static async registerSettings(s) {
    let globalSymbols = Object.getOwnPropertySymbols(global);
    let hasSettings = (globalSymbols.indexOf(SETTINGS_KEY) > -1);

    if (!hasSettings){
      global[SETTINGS_KEY] = await SettingsBase.build(s)
    }
  }
  static getInstance() {
    return global[SETTINGS_KEY];
  }

}


export {type, description, default_value, SettingsBase}