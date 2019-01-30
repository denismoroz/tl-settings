const DBStorage = require("./model")

var redis = require('redis');


class Settings {

  constructor(config) {
    this._config = config
    this._appId = this._config.appId
    this._data = {}
  }

  async init() {
    this._db = new DBStorage(this._config);
    await this._db.checkTable();

    await this._refreshSettings();

    this._sub = redis.createClient();
    this._sub.subscribe(this._appId);

    this._sub.on('error', function(err){
      console.log('Error in redis sub ', err)
    });

    this._pub = redis.createClient();

    this._pub.on('error', function(err){
      console.log('Error in redis pub ', err)
    });

    this._sub.on("message", async (channel, message) => {
      console.log("sub channel " + channel + ": " + message);
      await this._refreshSettings();
    });
  }

  async _refreshSettings() {
    console.log("Refresh _data");
    const settings = await this._db.getSettingsRecord(this._appId) || '{}';
    this._data = JSON.parse(settings)
  }


  get(key) {
    return this._data[key]
  }

  all() {
    return this._data
  }

  async setAll(settings) {
    this._data = settings
    await this._uploadToDb();
  }

  async _uploadToDb() {
    await this._db.updateSettingsRecord(this._appId, JSON.stringify(this._data));
    this._pub.publish(this._appId, "update_settings")
  }

  async set(key, value) {
    this._data[key] = value;
    await this._uploadToDb()
  }

  async unset(key) {
    delete this._data[key];

    await this._db.updateSettingsRecord(this._appId, JSON.stringify(this._data))
  }
}

module.exports.buildSettings = async function (config) {
  const s = new Settings(config);
  await s.init();
  return s;
}

