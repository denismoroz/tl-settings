const redis = require('redis');


class PubSubRedis {

  async init(settings, on_message, on_error) {
    this._settings = settings;

    this._sub = redis.createClient();
    this._sub.subscribe(this._settings.settingsFieldsUpdateChannel);
    this._sub.on('error', on_error);
    this._sub.on("message", on_message);

    this._pub = redis.createClient();
    this._pub.on('error', on_error);
  }

  notify(field_name) {
    this._pub.publish(this._settings.settingsFieldsUpdateChannel, field_name)
  }
}

module.exports = { PubSubRedis }
