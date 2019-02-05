
import {type, default_value, description, SettingsBase} from "./lib/base_settings";


class Settings extends SettingsBase {

  @default_value("postgres://toptal:toptal@localhost:5432/tl_settings")
  @description("db connect url")
  db_connect_url;

  @default_value("localhost:6379")
  @description("Redis connection parameters")
  @type(String)
  redis_url;

  @default_value("settings_updates")
  @description("Redis cannel for field updates")
  redis_channel;

  @default_value(process.env.PORT || 3000)
  @description("Port where express server will run")
  @type(Number)
  port;


  @default_value("Hello World!")
  @description("Hello message for starting application.")
  hello_message;

}

export async function registerSettings() {
  await Settings.registerSettings(Settings)
}

export function getSettings() {
  return Settings.getInstance();
}
