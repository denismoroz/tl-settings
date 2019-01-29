const DBStorage = require("./model")
const bluebird = require("bluebird")

var redis = require('redis');
// bluebird.promisifyAll(redis.RedisClient.prototype);
// bluebird.promisifyAll(redis.Multi.prototype);


class Settings {

  constructor(config) {
    this._config = config
    this._appId = this._config.appId
    this.settings = {}
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
    console.log("Refresh settings");
    const settings = await this._db.getSettingsRecord(this._appId) || '{}';
    this.settings = JSON.parse(settings)
  }


  get(key) {
    return this.settings[key]
  }

  all() {
    return this.settings
  }

  async set(key, value) {
    this.settings[key] = value;
    await this._db.updateSettingsRecord(this._appId, JSON.stringify(this.settings));
    this._pub.publish(this._appId, "update_settings")
  }

  async unset(key) {
    delete this.settings[key];

    await this._db.updateSettingsRecord(this._appId, JSON.stringify(this.settings))
  }
}

module.exports.buildSettings = async function (config) {
  const s = new Settings(config);
  await s.init();
  return s;
}

