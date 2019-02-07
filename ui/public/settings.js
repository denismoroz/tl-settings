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
    let settingsTable = '<table class="table table-striped settings-table">';
    settingsTable += '<thead class="thead-dark">'
    settingsTable += '<tr><th>Name</th> <th>Value</th> <th>Description</th> <th>In DB</th></tr>'
    settingsTable +=  '</thead>'

    for(let field_name in settings) {
      const setting = settings[field_name];

      settingsTable += "<tr class='setting'>"
      settingsTable +=  "<td class='input-setting-name' value='${setting.name}'>" + setting.name  + "</td>";

      settingsTable += "<td>"

      if (isDisplay() || setting.readonly) {
        settingsTable +=  setting.value
      }
      else {
        settingsTable +=  `<input class='input-setting-value'  type='${setting.type}'  data='${setting.name}' value='${setting.value}'>`;

        if (setting.db_value) {
          settingsTable +=  `<button class="btn-primary btn-delete" value='${setting.name}'>Delete</button>`;
        }

      }
      settingsTable += "<br/>"  + '<span class="default_value">' + "Default: " + setting.default_value + '</span>'

      settingsTable += "</td>"

      settingsTable +=  "<td>" + setting.description + "</td>";
      settingsTable +=  "<td>" + !!setting.db_value + "</td>";

      settingsTable += "</tr>"
    }
    settingsTable += "</table>";

    let content = settingsTable


    if (state == "DISPLAY") {
      content += "<br/>"
      content +=  '<button class="btn-primary btn-edit">Edit</button>'
    }

    if (state == "EDIT") {
      content += "<br/>"
      content +=  '<button class="btn-primary btn-save">Save</button>'
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
        getSettings()
      })
    })
  }


  getSettings()
})()