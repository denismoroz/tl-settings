module.exports = {
  port: process.env.PORT || 3000,
  database: {
    url: "postgres://toptal:toptal@localhost:5432/tl_settings"
  },
  appId: "test_app"
}
