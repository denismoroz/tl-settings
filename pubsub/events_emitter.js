const EventsEmitter = require('events');

class PubSubEventsEmitter  {
  async init(settings, on_message, on_error) {
    this._settings = settings;
    this._eventsEmitter = new EventsEmitter()
    this._eventsEmitter.on(this._settings.settingsFieldsUpdateChannel, function(fieldName) {
      on_message(settings.redisChannel, fieldName)
    })

  }

  notify(fieldName) {
    this._eventsEmitter.emit(this._settings.settingsFieldsUpdateChannel, fieldName)
  }
}

module.exports = { PubSubEventsEmitter }
