SMS_ADMIN_LAYOUT.init("classes");
(function() {
  var branchId = SMS_AUTH.getBranchId();
  var allClasses = [], allTeachers = [], allStudents = [], gradeStructures = [];
  var searchVal = "";
  var activeTerm = new URLSearchParams(window.location.search).get("term") === "S2" ? "S2" : "S1";
  var schoolYear = SMS_SCHOOL_YEARS.find(function(y){ return y.schoolId === SMS_AUTH.getSchoolId() && y.isCurrent; });

  Promise.all([SMS_API.getClasses(branchId), SMS_API.getTeachers(branchId), SMS_API.getStudents(branchId), SMS_API.getGradeStructures()]).then(function(res) {
    allClasses = res[0]; allTeachers = res[1]; allStudents = res[2]; gradeStructures = res[3]; render();
  });

  function render() {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({ title: "Classes & Scheduling", subtitle: "Create and manage classes, assign teachers, build rosters", breadcrumb: ["Administration", "Classes"],
        actions: [{ label: "Create Class", icon: "fa-plus", id: "add-class-btn", primary: true }] }) +
      '<div class="term-tabs"><button class="term-tab '+(activeTerm==="S1"?"active":"")+'" data-term="S1">Semester 1</button><button class="term-tab '+(activeTerm==="S2"?"active":"")+'" data-term="S2">Semester 2</button></div>' +
      '<div class="card" style="margin-bottom:20px"><div class="card-body"><div class="filter-bar"><div class="input-with-icon" style="flex:1"><i class="fa-solid fa-search icon"></i><input class="input" id="class-search" placeholder="Search classes…"></div><span class="fs-xs text-secondary">'+(schoolYear?SMS_UI.esc(schoolYear.name):"Current year")+'</span></div></div></div>' +
      '<div id="classes-list"></div>';
    document.getElementById("add-class-btn").addEventListener("click", openCreateDialog);
    document.getElementById("class-search").addEventListener("input", function() { searchVal = this.value; renderList(); });
    document.querySelectorAll("[data-term]").forEach(function(btn){ btn.addEventListener("click", function(){ activeTerm=btn.dataset.term; var u=new URL(window.location.href); u.searchParams.set("term",activeTerm); history.replaceState({},"",u); render(); }); });
    renderList();
  }

  function renderList() {
    var filtered = allClasses.filter(function(c) {
      var q = searchVal.toLowerCase();
      var sem=(c.semester||"Full Year").toLowerCase();
      var termMatch = sem === "full year" || sem === "full-year" || (activeTerm === "S2" ? sem.indexOf("2") !== -1 : sem.indexOf("1") !== -1);
      var searchMatch = !q || c.name.toLowerCase().includes(q) || (c.subject||"").toLowerCase().includes(q);
      return termMatch && searchMatch;
    });
    var cols = [
      { label: "Class", render: function(c) { return '<div class="fw-600">'+SMS_UI.esc(c.name)+'</div><div class="fs-xs text-secondary">'+SMS_UI.esc(c.subject)+'</div>'; }},
      { label: "Grade", render: function(c) { return SMS_UI.esc(c.grade); }},
      { label: "Term", render: function(c) { return SMS_UI.badge(c.semester||"Full Year","primary"); }},
      { label: "Teacher", render: function(c) { return c.teacherId ? SMS_UI.esc(c.teacherName) : '<span class="badge badge-warning">Unassigned</span>'; }},
      { label: "Students", render: function(c) { return String((c.studentIds||[]).length); }},
      { label: "Room", render: function(c) { return SMS_UI.esc(c.room||"—"); }},
      { label: "Schedule", render: function(c) { return '<span class="fs-xs">'+SMS_UI.esc(c.schedule||"—")+'</span>'; }},
      { label: "", render: function() { return '<i class="fa-solid fa-chevron-right" style="color:var(--text-muted)"></i>'; }}
    ];
    var wrap = document.getElementById("classes-list");
    wrap.innerHTML = SMS_UI.buildTable({ columns: cols, rows: filtered, emptyTitle: "No classes yet", emptyMessage: "Create a class to get started" });
    SMS_UI.wireTableClicks(wrap, filtered, openClassDetail);
  }

  function teacherOptions(selectedId) {
    return '<option value="">— No teacher assigned —</option>' +
      allTeachers.map(function(t) { return '<option value="'+t.id+'"'+(t.id===selectedId?' selected':'')+'>'+SMS_UI.esc(t.fullName)+'</option>'; }).join("");
  }

  function openCreateDialog() {
    var gradeOpts = gradeStructures.map(function(g) { return '<option value="'+g.name+'">'+SMS_UI.esc(g.name)+'</option>'; }).join("");
    SMS_UI.openDialog([
      '<div class="dialog-header"><div><div class="dialog-title">Create Class</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="dialog-body">',
      '<div class="form-group"><label class="form-label">Class Name *</label><input class="input" id="c-name" placeholder="e.g. Mathematics 7"></div>',
      '<div class="form-grid"><div class="form-group"><label class="form-label">Subject *</label><input class="input" id="c-subject" placeholder="e.g. Mathematics"></div><div class="form-group"><label class="form-label">Grade</label><select class="input" id="c-grade">'+gradeOpts+'</select></div></div>',
      '<div class="form-grid"><div class="form-group"><label class="form-label">Assign Teacher</label><select class="input" id="c-teacher">'+teacherOptions("")+'</select></div><div class="form-group"><label class="form-label">Semester</label><select class="input" id="c-semester"><option value="Full Year">Full Year</option><option value="Semester 1"'+(activeTerm==="S1"?" selected":"")+'>Semester 1 only</option><option value="Semester 2"'+(activeTerm==="S2"?" selected":"")+'>Semester 2 only</option></select></div></div>',
      '<div class="form-grid"><div class="form-group"><label class="form-label">Room</label><input class="input" id="c-room" placeholder="e.g. 101"></div><div class="form-group"><label class="form-label">Schedule</label><input class="input" id="c-schedule" placeholder="e.g. Mon, Wed, Fri 8:00–8:50 AM"></div></div>',
      '</div>',
      '<div class="dialog-footer"><button class="btn btn-secondary" data-close-dialog>Cancel</button><button class="btn btn-primary" id="save-class-btn"><i class="fa-solid fa-plus"></i>Create Class</button></div>'
    ].join(""));

    document.getElementById("save-class-btn").addEventListener("click", function() {
      var name = document.getElementById("c-name").value.trim();
      var subject = document.getElementById("c-subject").value.trim();
      if (!name) { SMS_UI.toast("Missing name", "Class name is required.", "error"); return; }
      var teacherId = document.getElementById("c-teacher").value;
      var teacher = allTeachers.find(function(t) { return t.id === teacherId; });
      SMS_API.createClass({
        name: name, subject: subject,
        grade: document.getElementById("c-grade").value,
        teacherId: teacherId || null, teacherName: teacher ? teacher.fullName : "Unassigned",
        room: document.getElementById("c-room").value.trim(),
        schedule: document.getElementById("c-schedule").value.trim(),
        semester: document.getElementById("c-semester").value,
        branchId: branchId, schoolId: SMS_AUTH.getSchoolId()
      }).then(function(r) {
        if (r.success) {
          SMS_API.addAuditEntry({ userId: SMS_AUTH.getCurrentUser().id, userName: SMS_AUTH.getCurrentUser().displayName, action: "CLASS_CREATED", resource: "Class", resourceId: r.cls.id, details: "Created class: "+r.cls.name, branchId: branchId });
          SMS_UI.closeDialog();
          SMS_UI.toast("Class created", r.cls.name+" is ready.", "success");
          SMS_API.getClasses(branchId).then(function(c) { allClasses = c; renderList(); });
        }
      });
    });
  }

  function openClassDetail(cls) {
    var enrolled = allStudents.filter(function(s) { return (cls.studentIds||[]).includes(s.id); });
    var available = allStudents.filter(function(s) { return !(cls.studentIds||[]).includes(s.id); });

    SMS_UI.openDialog([
      '<div class="dialog-header"><div><div class="dialog-title">'+SMS_UI.esc(cls.name)+'</div><div class="dialog-subtitle">'+SMS_UI.esc(cls.subject)+' · '+SMS_UI.esc(cls.grade)+'</div></div><button class="dialog-close" data-close-dialog><i class="fa-solid fa-xmark"></i></button></div>',
      '<div class="dialog-body">',
      '<div class="grid-2" style="margin-bottom:16px">',
      '<div class="card"><div class="card-body" style="display:flex;flex-direction:column;gap:10px">',
      '<div><div class="fs-xs text-secondary">Teacher</div><div class="fw-600">'+(cls.teacherName||"Unassigned")+'</div></div>',
      '<div><div class="fs-xs text-secondary">Room</div><div class="fw-600">'+SMS_UI.esc(cls.room||"—")+'</div></div>',
      '<div><div class="fs-xs text-secondary">Semester</div><div class="fw-600">'+SMS_UI.esc(cls.semester||"Full Year")+'</div></div>',
      '<div><div class="fs-xs text-secondary">Schedule</div><div class="fw-600 fs-sm">'+SMS_UI.esc(cls.schedule||"—")+'</div></div>',
      '</div></div>',
      '<div class="card"><div class="card-body" style="display:flex;flex-direction:column;gap:10px">',
      '<div class="fs-xs text-secondary fw-600">ASSIGN TEACHER</div>',
      '<select class="input" id="assign-teacher">'+teacherOptions(cls.teacherId)+'</select>',
      '<button class="btn btn-sm btn-secondary" id="update-teacher-btn">Update Teacher</button>',
      '</div></div>',
      '</div>',
      '<div class="card"><div class="card-header"><div><div class="card-title">Roster ('+enrolled.length+' students)</div></div>'+
        (available.length ? '<select class="input" id="add-student-select" style="width:auto;max-width:200px"><option value="">Add student…</option>'+available.map(function(s){return '<option value="'+s.id+'">'+SMS_UI.esc(s.fullName)+'</option>';}).join("")+'</select>' : '')+
      '</div><div class="card-body">',
      enrolled.length
        ? '<div style="display:flex;flex-direction:column;gap:8px">'+enrolled.map(function(s) {
            return '<div style="display:flex;align-items:center;gap:12px;padding:8px;background:var(--gray-50);border-radius:8px">'+SMS_UI.avatarHtml(s.fullName)+'<div class="fw-600">'+SMS_UI.esc(s.fullName)+'</div><span class="fs-xs text-secondary">'+SMS_UI.esc(s.grade)+'</span><button class="btn btn-sm btn-ghost" style="margin-left:auto;color:var(--color-danger)" data-remove-student="'+s.id+'"><i class="fa-solid fa-xmark"></i></button></div>';
          }).join("")+'</div>'
        : '<p class="text-secondary fs-sm">No students enrolled. Add students using the dropdown above.</p>',
      '</div></div>',
      '</div>',
      '<div class="dialog-footer dialog-footer-left"><button class="btn btn-secondary" style="color:var(--color-danger);border-color:var(--color-danger)" id="delete-class-btn"><i class="fa-solid fa-trash"></i>Delete Class</button><button class="btn btn-secondary" data-close-dialog>Close</button></div>'
    ].join(""), { lg: true });

    // Update teacher
    document.getElementById("update-teacher-btn").addEventListener("click", function() {
      var teacherId = document.getElementById("assign-teacher").value;
      var teacher = allTeachers.find(function(t) { return t.id === teacherId; });
      SMS_API.updateClass(cls.id, { teacherId: teacherId||null, teacherName: teacher ? teacher.fullName : "Unassigned" }).then(function(r) {
        if (r.success) { SMS_UI.toast("Teacher updated", "", "success"); SMS_API.getClasses(branchId).then(function(c) { allClasses = c; }); }
      });
    });

    // Add student from dropdown
    var addSel = document.getElementById("add-student-select");
    if (addSel) {
      addSel.addEventListener("change", function() {
        var sid = addSel.value;
        if (!sid) return;
        var newIds = (cls.studentIds||[]).concat([sid]);
        SMS_API.updateClass(cls.id, { studentIds: newIds }).then(function(r) {
          if (r.success) {
            cls.studentIds = newIds;
            SMS_UI.toast("Student added", "", "success");
            SMS_API.getClasses(branchId).then(function(c) { allClasses = c; openClassDetail(allClasses.find(function(x){return x.id===cls.id;})||cls); });
          }
        });
      });
    }

    // Remove student buttons
    document.querySelectorAll("[data-remove-student]").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var sid = btn.getAttribute("data-remove-student");
        var newIds = (cls.studentIds||[]).filter(function(x) { return x !== sid; });
        SMS_API.updateClass(cls.id, { studentIds: newIds }).then(function(r) {
          if (r.success) {
            cls.studentIds = newIds;
            SMS_UI.toast("Student removed from class", "", "success");
            SMS_API.getClasses(branchId).then(function(c) { allClasses = c; openClassDetail(allClasses.find(function(x){return x.id===cls.id;})||cls); });
          }
        });
      });
    });

    // Delete class
    document.getElementById("delete-class-btn").addEventListener("click", function() {
      SMS_UI.confirm("Delete "+cls.name+"?", "This permanently deletes the class and cannot be undone.", "Delete Class", function() {
        SMS_API.deleteClass(cls.id).then(function(r) {
          if (r.success) {
            SMS_UI.closeDialog();
            SMS_UI.toast("Class deleted", cls.name+" has been removed.", "success");
            SMS_API.getClasses(branchId).then(function(c) { allClasses = c; renderList(); });
          }
        });
      });
    });
  }
})();
