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

  constructor(db_url) {
    console.log("Connect to :", db_url)
    this.pool = new Pool({connectionString: db_url})
  }

  async checkTable() {
    const createTable = `CREATE TABLE IF NOT EXISTS tl_settings(
    name TEXT PRIMARY KEY,
    value TEXT
);`

    return await this._query(createTable)
  }

  async getRecord(name) {
    const query = `SELECT tl_settings.value FROM tl_settings  WHERE tl_settings.name=$1;`;
    const r = await this._query(query, [name])
    const record = r.rows[0] ? r.rows[0].value : null
    console.log("DBStorage: Read from db:  ", name, record)
    return record;
  }

  async getAllRecords() {
    const query = `SELECT tl_settings.name, tl_settings.value FROM tl_settings;`;
    const r = await this._query(query)
    const result = r.rows
    console.log("DBStorage: Read all record from db:  ", result)
    return result
  }

  async updateRecord(name, value) {
    console.log("DBStorage: update: ", name, value)
    const query = `INSERT INTO tl_settings (name, value) VALUES ($1, $2)
    ON CONFLICT (name) DO UPDATE SET value = EXCLUDED.value;`
    await this._query(query, [name, value])
  }

  async deleteRecord(name) {
    console.log("DBStorage: delete", name);
    const query = `DELETE FROM tl_settings WHERE tl_settings.name=$1;`
    await this._query(query, [name])
  }
}

export {DBStorage}
