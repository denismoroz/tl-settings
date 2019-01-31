

function type(_type) {
  return function decorator(target, name, descriptor) {
    target.addToMeta(name, {"type": _type})
    return descriptor;
  }
}

function description(_description) {
  return function decorator(target, name, descriptor) {
    target.addToMeta(name, {"description": _description});
    return descriptor;
  }
}


function default_value(_default_value) {
  return function (target, name, descriptor) {
    target.addToMeta(name, {"default_value": _default_value});

    return  {
      enumerable: true,

      get: () => {
        const db_record = target.get(name)
        const meta = target.getMeta(name)
        let obj = db_record ? db_record.value : meta.default_value

        if (!meta.type) {
          meta.type = String
        }

        obj = new meta.type(obj);

        obj["default_value"] = meta.default_value;
        obj["description"] = meta.description;
        return obj
      },
    };
  }
}

class SettingsBase {

  addToMeta(name, data) {
    let v = {};

    if (!this._meta) {
      this._meta = {}
    }

    if (name in this._meta) {
      v = this._meta[name];
    }
    this._meta[name] = {...v, ...data};
  }
  getMeta(name) {
    return this._meta[name]
  }

  getAll() {
    console.log("Base: get all")
    return [{name: "a", value: "b"}, ]
  }

  get(name) {
    // console.log("Base: get ", name)
    const params = {"app_token": {value: "TOKEN FROM DB"}}

    return params[name];
  }

  save(name, value) {
    console.log("Base: save: ", name, value)
  }
}


class Settings extends SettingsBase {

  @default_value("DEFAULT_TOKEN")
  @description("Super description")
  @type(String)
  app_token;

  @default_value("db://")
  @description("db connect url")
  db_connect_url;

  @default_value("localhost:6379")
  @description("Redis connection parameters")
  @type(String)
  redis_url;

  @default_value(false)
  @description("Debug mode")
  @type(Boolean)
  debug;

}


let s = new Settings();

console.log(`app_token: ${s.app_token}, ${s.app_token.description}, ${s.app_token.default_value}`);
console.log(`db_connect_url: ${s.db_connect_url}, ${s.db_connect_url.description}, ${s.db_connect_url.default_value}`);
console.log(`redis_url: ${s.redis_url}, ${s.redis_url.description}, ${s.redis_url.default_value}`);
console.log(`debug: ${s.debug}`);


