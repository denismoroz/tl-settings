const Pool = require ('pg').Pool

class Storage {
  async _query() {
    const client = await this.pool.connect()
    try {
      return await client.query(...arguments)
    } finally {
      client.release()
    }
  }

  async init(settings) {
    const db_url = settings.db_connect_url;
    console.log("Storage: Connect to :", db_url);
    this.pool = new Pool({connectionString: db_url});
    const createTable = `CREATE TABLE IF NOT EXISTS tl_settings( name TEXT PRIMARY KEY, value TEXT);`;
    return await this._query(createTable)
  }

  async get(name) {
    const query = `SELECT tl_settings.value FROM tl_settings  WHERE tl_settings.name=$1;`;
    const r = await this._query(query, [name]);
    const record = r.rows[0] ? r.rows[0].value : null;
    console.log("Storage: Read from db:  ", name, record);
    return record;
  }

  async getAll() {
    const query = `SELECT tl_settings.name, tl_settings.value FROM tl_settings;`;
    const r = await this._query(query)
    const result = r.rows
    console.log("Storage: Read all record from db:  ", result);
    return result
  }

  async update(name, value) {
    console.log("Storage: update: ", name, value)
    const query = `INSERT INTO tl_settings (name, value) VALUES ($1, $2)
    ON CONFLICT (name) DO UPDATE SET value = EXCLUDED.value;`
    await this._query(query, [name, value])
  }

  async delete(name) {
    console.log("Storage: delete", name);
    const query = `DELETE FROM tl_settings WHERE tl_settings.name=$1;`
    await this._query(query, [name])
  }
}

module.exports = { Storage }
