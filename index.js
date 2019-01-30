
const config = {database: {url:"postgres://toptal:toptal@localhost:5432/tl_settings"},
                appId: "test_app"}


const settings = require("./lib/settings")

async function main() {
  const s = await settings.buildSettings(config)

  s.set("setting", {value:"setting_value_2",
    description:"description"})

  s.unset("setting")

  console.log("Setting: ", s.get("setting"))
  console.log("ALL: ", s.all())
}


main()


