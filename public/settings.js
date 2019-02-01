(function () {

  state = "DISPLAY"
  settings = []

  function isDisplay() {
    return state == "DISPLAY"
  }

  function readSettings() {
    new_settings = {};

    $("tr.setting").each(function() {
      const $this = $(this);
      const name = $this.find(".input-setting-name").text();
      const value = $this.find(".input-setting-value").val();
      let s = settings[name];
      s.value = value;
      new_settings[name] = s;
    });
    settings = new_settings;
  }

  function renderSettings() {
    let settingsTable = "<table class='settings-table'>";
    settingsTable += '<tr><th>Name</th> <th>Value</th> <th>Description</th> <th>In DB</th> <th>Default Value</th></tr>'

    for(let field_name in settings) {
      const setting = settings[field_name];

      settingsTable += "<tr class='setting'>"
      settingsTable +=  "<td class='input-setting-name' value='${setting.name}'>" + setting.name  + "</td>";


      if (isDisplay()) {
        settingsTable +=  "<td>" + setting.value + "</td>"
      }
      else {
        settingsTable +=  `<td><input class='input-setting-value' size="80" type='${setting.type}'  data='${setting.name}' value='${setting.value}'>`;

        if (setting.db_value) {
          settingsTable +=  `<button class="btn-delete" value='${setting.name}'>Delete</button>`;
        }
        settingsTable += `</td>`

      }
      settingsTable +=  "<td>" + setting.description + "</td>";
      settingsTable +=  "<td>" + !!setting.db_value + "</td>";
      settingsTable +=  "<td>" + setting.default_value + "</td>";

      settingsTable += "</tr>"
    }
    settingsTable += "</table>";

    let content = settingsTable


    if (state == "DISPLAY") {
      content += "<br/>"
      content +=  '<button class="btn-edit">Edit</button>'
    }

    if (state == "EDIT") {
      content += "<br/>"
      content +=  '<button class="btn-save">Save</button>'
    }

    $("#settings").html(content)

    $(".btn-delete").click((e)=>{
      const setting_name = e.target.value;
      delete settings[setting_name];


      renderSettings();
    })

    $(".btn-edit").click((e)=>{
      state = "EDIT"
      renderSettings()
    })

    $(".btn-save").click((e)=>{
      state = "DISPLAY"
      readSettings()
      saveSettings()
    })

  }

  function getSettings() {
    fetch("/settings").then((response)=> {
      response.json().then((data) => {
        settings = data
        renderSettings()
      })
    })
  }

  function saveSettings() {
    fetch("/settings",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json",},
        body: JSON.stringify(settings)
      },).then((response)=> {
      response.json().then((data)=> {
        settings = data
        renderSettings()
      })
    })
  }


  getSettings()
})()