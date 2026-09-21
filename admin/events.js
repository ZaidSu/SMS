SMS_ADMIN_LAYOUT.init("events");
(function() {
  var branchId = SMS_AUTH.getBranchId();
  var allEvents = [];
  var typeVariant = { PTC: "primary", Holiday: "warning", Academic: "info", Fundraiser: "success", "Field Trip": "warning" };

  function load() { return SMS_API.getEvents(branchId).then(function(e) { allEvents = e.sort(function(a,b){return new Date(a.startDate)-new Date(b.startDate);}); }); }

  load().then(function() {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({ title: "Events", subtitle: "Create and manage school events and activities", breadcrumb: ["Administration", "Events"],
        actions: [{ label: "Create Event", icon: "fa-plus", id: "add-event-btn", primary: true }] }) +
      '<div id="events-list" style="display:flex;flex-direction:column;gap:12px"></div>';
    document.getElementById("add-event-btn").addEventListener("click", openCreateDialog);
    renderList();
  });

  function renderList() {
    var list = document.getElementById("events-list");
    if (!allEvents.length) { list.innerHTML = '<div class="card"><div class="card-body">'+SMS_UI.emptyState({ icon: "fa-calendar-days", title: "No events yet", message: "Create your first event." })+'</div></div>'; return; }
    list.innerHTML = allEvents.map(function(ev, i) {
      var d = new Date(ev.startDate);
      return '<div class="card"><div class="card-body" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">'+
        '<div style="display:flex;align-items:center;gap:16px">'+
        '<div style="width:52px;height:52px;background:var(--color-primary-light);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0">'+
        '<span style="font-size:.55rem;font-weight:700;text-transform:uppercase;color:var(--color-primary)">'+d.toLocaleString("default",{month:"short"})+'</span>'+
        '<span style="font-size:1.25rem;font-weight:800;color:var(--color-primary);line-height:1">'+d.getDate()+'</span></div>'+
        '<div><div class="fw-700">'+SMS_UI.esc(ev.title)+'</div>'+
        '<div class="text-secondary fs-sm" style="margin-top:2px">'+SMS_UI.esc(ev.description||"")+'</div>'+
        '<div style="display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap">'+
        SMS_UI.badge(ev.type, typeVariant[ev.type]||"gray")+
        (ev.location ? '<span class="fs-xs text-secondary"><i class="fa-solid fa-location-dot" style="margin-right:3px"></i>'+SMS_UI.esc(ev.location)+'</span>' : '')+
        (ev.requiresRegistration ? SMS_UI.badge("Registration required","info") : '')+
        '</div></div></div>'+
        '<button class="btn btn-sm btn-ghost btn-icon" style="color:var(--color-danger)" data-del-ev="'+i+'" title="Delete"><i class="fa-solid fa-trash"></i></button>'+
        '</div></div>';
    }).join("");
    document.querySelectorAll("[data-del-ev]").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var ev = allEvents[parseInt(btn.getAttribute("data-del-ev"))];
        SMS_UI.confirm("Delete '"+ev.title+"'?", "This removes the event from the calendar for everyone.", "Delete Event", function() {
          SMS_API.deleteEvent(ev.id).then(function() { SMS_UI.toast("Event deleted","","success"); load().then(renderList); });
        });
      });
    });
  }

  function openCreateDialog() {
    SMS_UI.openDialog([
      '<div class="dialog-header"><div><div class="dialog-title">Create Event</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="dialog-body">',
      '<div class="form-group"><label class="form-label">Title *</label><input class="input" id="ev-title"></div>',
      '<div class="form-group"><label class="form-label">Description</label><textarea class="input" id="ev-desc" rows="2"></textarea></div>',
      '<div class="form-grid"><div class="form-group"><label class="form-label">Start Date *</label><input class="input" type="date" id="ev-start"></div><div class="form-group"><label class="form-label">End Date</label><input class="input" type="date" id="ev-end"></div></div>',
      '<div class="form-grid"><div class="form-group"><label class="form-label">Type</label><select class="input" id="ev-type"><option>Academic</option><option>PTC</option><option>Holiday</option><option>Fundraiser</option><option>Field Trip</option></select></div><div class="form-group"><label class="form-label">Location</label><input class="input" id="ev-location"></div></div>',
      '<label class="checkbox-label" style="margin-bottom:8px"><input type="checkbox" id="ev-reg">Requires registration</label>',
      '</div>',
      '<div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Cancel</button><button class="btn btn-primary" id="save-ev-btn"><i class="fa-solid fa-plus"></i>Create Event</button></div>'
    ].join(""));
    document.getElementById("save-ev-btn").addEventListener("click", function() {
      var title = document.getElementById("ev-title").value.trim();
      var start = document.getElementById("ev-start").value;
      if (!title||!start) { SMS_UI.toast("Missing fields","Title and start date are required.","error"); return; }
      SMS_API.createEvent({ title:title, description:document.getElementById("ev-desc").value.trim(), startDate:start, endDate:document.getElementById("ev-end").value||start, type:document.getElementById("ev-type").value, location:document.getElementById("ev-location").value.trim(), requiresRegistration:document.getElementById("ev-reg").checked, branchId:branchId, schoolId:SMS_AUTH.getSchoolId() }).then(function(r) {
        if (r.success) { SMS_UI.closeDialog(); SMS_UI.toast("Event created","","success"); load().then(renderList); }
      });
    });
  }
})();
