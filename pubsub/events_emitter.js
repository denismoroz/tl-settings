const EventsEmitter = require('events');

class PubSubEventsEmitter  {
  async init(settings, on_message, on_error) {
    this._settings = settings;
    this._events_emitter = new EventsEmitter()
    this._events_emitter.on(this._settings.settings_fields_update_channel, function(field_name) {
      on_message(settings.redis_channel, field_name)
    })

  }

  notify(field_name) {
    this._events_emitter.emit(this._settings.settings_fields_update_channel, field_name)
  }
}

module.exports = { PubSubEventsEmitter }