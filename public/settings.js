(function () {

  state = "DISPLAY"
  settings = {}

  function isDisplay() {
    return state == "DISPLAY"
  }

  function readSettings() {
    settings = {};
    $("tr.setting").each(function() {
      const $this = $(this);
      const name = $this.find(".input-setting-name").val();
      const value = $this.find(".input-setting-value").val();
      settings[name] = {value}
    });
  }

  function renderSettings() {
    let settingsTable = "<table class='settings-table'>";
    settingsTable += '<tr><th>Name</th> <th>Value</th></tr>'

    for(let setting_name in settings) {
      settingsTable += "<tr class='setting'>"
      if (isDisplay()) {
        settingsTable +=  "<td>" + setting_name  + "</td>"
        settingsTable +=  "<td>" + settings[setting_name].value + "</td>"
      }
      else {
        settingsTable +=  `<td><input class='input-setting-name' type='text'  value='${setting_name}'></td>`
        settingsTable +=  `<td><input class='input-setting-value' type='text'  value='${settings[setting_name].value}'></td>`
        settingsTable +=  `<td><button class="btn-delete" value='${setting_name}'>Delete</button></td>`
      }

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
      content +=  '<button class="btn-new">New</button>'
    }

    $("#settings").html(content)

    $(".btn-delete").click((e)=>{
      delete settings[e.target.value];
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


    function getUniqueName() {
      let i = 0
      const name_tpl = "new_name"
      let name = name_tpl

      while (name in settings) {
        name = `${name_tpl}_${i}`
        i += 1
      }
      return name
    }

    $(".btn-new").click((e)=>{
      console.log(settings)

      const name = getUniqueName()
      settings[name] = {value: "new_value"}
      renderSettings()
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