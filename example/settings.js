
import { type, default_value, description, readonly, SettingsBase, getSettingsInstance} from "@denis.moroz/tl-settings-core";
import { Storage } from "@denis.moroz/tl-settings-db";
import { PubSubRedis, PubSubEventsEmitter } from "@denis.moroz/tl-settings-pubsub";

class Settings extends SettingsBase {

  @default_value("postgres://toptal:toptal@localhost:5432/tl_settings")
  @description("db connect url")
  @readonly
  db_connect_url;

  @default_value("settings_updates")
  @description("Redis channel for field updates")
  settings_fields_update_channel;

  @default_value(process.env.PORT || 3000)
  @description("Port where express server will run")
  @type(Number)
  @readonly
  port;

  @default_value("Hello World!")
  @description("Hello message for starting application.")
  hello_message;

  @default_value("/settings")
  @description("Setings UI url")
  ui_settings_url;
}

async function registerSettings() {
  await SettingsBase.registerSettings(Settings, Storage, PubSubEventsEmitter)
}

module.exports = {registerSettings , getSettingsInstance}