
import { type, default_value, description, readonly, SettingsBase, getSettingsInstance} from "@denis.moroz/tl-settings-core";
import { Storage } from "@denis.moroz/tl-settings-db";
import { PubSub } from "@denis.moroz/tl-settings-pubsub";

class Settings extends SettingsBase {

  @default_value("postgres://toptal:toptal@localhost:5432/tl_settings")
  @description("db connect url")
  db_connect_url;

  @default_value("settings_updates")
  @description("Redis channel for field updates")
  redis_channel;

  @default_value(process.env.PORT || 3000)
  @description("Port where express server will run")
  @type(Number)
  @readonly
  port;

  @default_value("Hello World!")
  @description("Hello message for starting application.")
  hello_message;

}

async function registerSettings() {
  await SettingsBase.registerSettings(Settings, Storage, PubSub)
}

module.exports = {registerSettings , getSettingsInstance}