SMS_ADMIN_LAYOUT.init("lunch");
(function() {
  var menu = null;
  SMS_API.getLunchMenu().then(function(m) { menu = m; render(); });

  function render() {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({ title: "Lunch Menu", subtitle: "Manage the weekly cafeteria menu", breadcrumb: ["Administration", "Lunch Menu"] }) +
      '<div class="grid-3" id="lunch-grid" style="gap:16px"></div>';
    renderGrid();
  }

  function renderGrid() {
    var grid = document.getElementById("lunch-grid");
    grid.innerHTML = menu.menu.map(function(day, i) {
      return '<div class="card"><div class="card-header"><div><div class="card-title">'+SMS_UI.esc(day.day)+'</div><div class="card-subtitle">'+SMS_UI.esc(day.date)+'</div></div><button class="btn btn-sm btn-secondary" data-edit-day="'+i+'"><i class="fa-solid fa-pen"></i>Edit</button></div>'+
        '<div class="card-body" style="display:flex;flex-direction:column;gap:8px;font-size:.875rem">'+
        '<div><span class="text-secondary">Main: </span><span class="fw-600">'+SMS_UI.esc(day.mainDish)+'</span></div>'+
        '<div><span class="text-secondary">Sides: </span>'+SMS_UI.esc((day.sides||[]).join(", "))+'</div>'+
        '<div><span class="text-secondary">Dessert: </span>'+SMS_UI.esc(day.dessert)+'</div>'+
        '<div style="display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px solid var(--border-color)"><span class="fw-700">'+SMS_UI.esc(day.price)+'</span>'+(day.isHalal?SMS_UI.badge("Halal","success"):'')+'</div>'+
        '</div></div>';
    }).join("");
    grid.querySelectorAll("[data-edit-day]").forEach(function(btn) {
      btn.addEventListener("click", function() { openEditDay(menu.menu[parseInt(btn.getAttribute("data-edit-day"))]); });
    });
  }

  function openEditDay(day) {
    SMS_UI.openDialog([
      '<div class="dialog-header"><div><div class="dialog-title">Edit Menu — '+SMS_UI.esc(day.day)+'</div><div class="dialog-subtitle">'+SMS_UI.esc(day.date)+'</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="dialog-body">',
      '<div class="form-group"><label class="form-label">Main Dish</label><input class="input" id="menu-main" value="'+SMS_UI.esc(day.mainDish)+'"></div>',
      '<div class="form-group"><label class="form-label">Sides (comma-separated)</label><input class="input" id="menu-sides" value="'+SMS_UI.esc((day.sides||[]).join(", "))+'"></div>',
      '<div class="form-grid"><div class="form-group"><label class="form-label">Dessert</label><input class="input" id="menu-dessert" value="'+SMS_UI.esc(day.dessert)+'"></div><div class="form-group"><label class="form-label">Price</label><input class="input" id="menu-price" value="'+SMS_UI.esc(day.price)+'"></div></div>',
      '<label class="checkbox-label" style="margin-bottom:8px"><input type="checkbox" id="menu-halal"'+(day.isHalal?' checked':'')+'>Halal certified</label>',
      '</div>',
      '<div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Cancel</button><button class="btn btn-primary" id="save-menu-btn"><i class="fa-solid fa-check"></i>Save</button></div>'
    ].join(""));
    document.getElementById("save-menu-btn").addEventListener("click", function() {
      var updates = { mainDish: document.getElementById("menu-main").value.trim(), sides: document.getElementById("menu-sides").value.split(",").map(function(s){return s.trim();}).filter(Boolean), dessert: document.getElementById("menu-dessert").value.trim(), price: document.getElementById("menu-price").value.trim(), isHalal: document.getElementById("menu-halal").checked };
      SMS_API.updateLunchDay(day.date, updates).then(function(r) {
        if (r.success) { SMS_UI.closeDialog(); SMS_UI.toast("Menu updated","","success"); SMS_API.getLunchMenu().then(function(m){menu=m;renderGrid();}); }
      });
    });
  }
})();
