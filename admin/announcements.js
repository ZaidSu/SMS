SMS_ADMIN_LAYOUT.init("announcements");
(function() {
  var branchId = SMS_AUTH.getBranchId();
  var allAnnouncements = [];

  function load() { return SMS_API.getAnnouncements(branchId).then(function(a) { allAnnouncements = a; }); }

  load().then(function() {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({ title: "Announcements", subtitle: "Post announcements to students, parents, and staff", breadcrumb: ["Administration", "Announcements"],
        actions: [{ label: "Post Announcement", icon: "fa-plus", id: "add-ann-btn", primary: true }] }) +
      '<div id="announcements-list" style="display:flex;flex-direction:column;gap:12px"></div>';
    document.getElementById("add-ann-btn").addEventListener("click", openCreateDialog);
    renderList();
  });

  function renderList() {
    var list = document.getElementById("announcements-list");
    if (!allAnnouncements.length) { list.innerHTML = '<div class="card"><div class="card-body">'+SMS_UI.emptyState({ icon:"fa-bullhorn", title:"No announcements yet"})+'</div></div>'; return; }
    list.innerHTML = allAnnouncements.map(function(a, i) {
      return '<div class="card"><div class="card-body"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px"><div style="flex:1"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'+SMS_UI.badge(a.audience||"All","primary")+(a.priority==="high"?SMS_UI.badge("High Priority","danger"):'')+'</div><div class="fw-700" style="font-size:1rem;margin-bottom:4px">'+SMS_UI.esc(a.title)+'</div><div class="text-secondary fs-sm">'+SMS_UI.esc(a.body)+'</div><div class="fs-xs text-muted" style="margin-top:8px">'+SMS_UI.esc(a.authorName)+' · '+SMS_UI.fmtDate(a.date)+'</div></div>'+
        '<button class="btn btn-sm btn-ghost btn-icon" style="color:var(--color-danger);flex-shrink:0" data-del-ann="'+i+'"><i class="fa-solid fa-trash"></i></button></div></div></div>';
    }).join("");
    document.querySelectorAll("[data-del-ann]").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var ann = allAnnouncements[parseInt(btn.getAttribute("data-del-ann"))];
        SMS_UI.confirm("Delete announcement?","This cannot be undone.","Delete",function() {
          SMS_API.deleteAnnouncement(ann.id).then(function(){SMS_UI.toast("Announcement deleted","","success");load().then(renderList);});
        });
      });
    });
  }

  function openCreateDialog() {
    SMS_UI.openDialog([
      '<div class="dialog-header"><div><div class="dialog-title">Post Announcement</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="dialog-body">',
      '<div class="form-group"><label class="form-label">Title *</label><input class="input" id="ann-title"></div>',
      '<div class="form-group"><label class="form-label">Body *</label><textarea class="input" id="ann-body" rows="4"></textarea></div>',
      '<div class="form-grid"><div class="form-group"><label class="form-label">Audience</label><select class="input" id="ann-aud"><option value="All">All (students, parents, staff)</option><option value="Parents">Parents only</option><option value="Staff">Staff only</option><option value="Students">Students only</option></select></div><div class="form-group"><label class="form-label">Priority</label><select class="input" id="ann-priority"><option value="normal">Normal</option><option value="high">High</option></select></div></div>',
      '</div>',
      '<div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Cancel</button><button class="btn btn-primary" id="save-ann-btn"><i class="fa-solid fa-bullhorn"></i>Post</button></div>'
    ].join(""));
    document.getElementById("save-ann-btn").addEventListener("click", function() {
      var title = document.getElementById("ann-title").value.trim();
      var body  = document.getElementById("ann-body").value.trim();
      if (!title||!body) { SMS_UI.toast("Missing fields","Title and body are required.","error"); return; }
      var user = SMS_AUTH.getCurrentUser();
      SMS_API.createAnnouncement({ title:title, body:body, audience:document.getElementById("ann-aud").value, priority:document.getElementById("ann-priority").value, branchId:branchId, schoolId:SMS_AUTH.getSchoolId(), authorId:user.id, authorName:user.displayName }).then(function(r){
        if (r.success) { SMS_UI.closeDialog(); SMS_UI.toast("Announcement posted","","success"); load().then(renderList); }
      });
    });
  }
})();
