const DBStorage = require("./model")
const redis = require('redis');

class Settings {

  constructor(config) {
    this._config = config;
    this._appId = this._config.appId;
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
    const settings = await this._db.getSettingsRecord(this._appId) || {};
    console.log("Refresh _data: ", settings);
    this._data = settings
  }

  get() {
    return this._data
  }

  async set(settings) {
    this._data = settings
    await this._uploadToDb();
  }

  async _uploadToDb() {
    console.log("Upload data to db", this._data)
    await this._db.updateSettingsRecord(this._appId, JSON.stringify(this._data));
    this._pub.publish(this._appId, "update_settings")
  }
}

module.exports.buildSettings = async function (config) {
  const s = new Settings(config);
  await s.init();
  return s;
}

