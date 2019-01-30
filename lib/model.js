const Pool = require ('pg').Pool


class DBStorage {
  async _query() {
    const client = await this.pool.connect()
    try {
      return await client.query(...arguments)
    } finally {
      client.release()
    }
  }

  constructor(config) {
    console.log("Connect to :", config.database.url)
    this.pool = new Pool({connectionString: config.database.url})
  }

  async checkTable() {
    const createTable = `CREATE TABLE IF NOT EXISTS tl_settings(
    appid TEXT PRIMARY KEY,
    settings JSONB
);`

    return await this._query(createTable)
  }

  async getSettingsRecord(appId) {
    const query = `SELECT tl_settings.settings FROM tl_settings  WHERE tl_settings.appid=$1;`;
    const r = await this._query(query, [appId])
    const setting_record = r.rows[0] ? r.rows[0].settings : null
    console.log("Read from db:  ", appId, setting_record)
    return setting_record;
  }

  async updateSettingsRecord(appId, settings) {
    const query = `INSERT INTO tl_settings (appid, settings) VALUES ($1, $2)
    ON CONFLICT (appid) DO UPDATE SET settings = EXCLUDED.settings;`
    await this._query(query, [appId, settings])
  }
}

module.exports = DBStorage
