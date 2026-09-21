SMS_ADMIN_LAYOUT.init("attendance");
(function() {
  var branchId = SMS_AUTH.getBranchId();
  var allClasses = [], allStudents = [];
  var selectedClass = null, selectedDate = new Date().toISOString().slice(0,10);

  Promise.all([SMS_API.getClasses(branchId), SMS_API.getStudents(branchId)]).then(function(res) {
    allClasses = res[0]; allStudents = res[1];
    selectedClass = allClasses[0] || null;
    render();
  });

  function render() {
    var classOptions = allClasses.map(function(c,i) { return '<option value="'+c.id+'"'+(i===0?' selected':'')+'>'+SMS_UI.esc(c.name)+' ('+SMS_UI.esc(c.grade)+')</option>'; }).join("");
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({ title: "Attendance", subtitle: "Mark and review daily class attendance", breadcrumb: ["Administration", "Attendance"] }) +
      '<div class="card" style="margin-bottom:20px"><div class="card-body"><div class="filter-bar">' +
      '<div class="form-group" style="flex:1;min-width:220px;margin-bottom:0"><label class="form-label fs-xs">Class</label><select class="input" id="class-picker">'+classOptions+'</select></div>' +
      '<div class="form-group" style="width:180px;margin-bottom:0"><label class="form-label fs-xs">Date</label><input class="input" type="date" id="date-picker" value="'+selectedDate+'"></div>' +
      '</div></div></div>' +
      '<div id="attendance-sheet"></div>';

    if (!allClasses.length) { document.getElementById("attendance-sheet").innerHTML = '<div class="card"><div class="card-body">'+SMS_UI.emptyState({ icon: "fa-book-open", title: "No classes in this branch", message: "Create a class first." })+'</div></div>'; return; }

    document.getElementById("class-picker").addEventListener("change", function() { selectedClass = allClasses.find(function(c){return c.id===this.value;})||null; renderSheet(); }.bind(document.getElementById("class-picker")));
    document.getElementById("date-picker").addEventListener("change", function() { selectedDate = this.value; renderSheet(); });
    renderSheet();
  }

  function renderSheet() {
    if (!selectedClass) return;
    SMS_API.getAttendance({ classId: selectedClass.id, date: selectedDate }).then(function(records) {
      var roster = allStudents.filter(function(s) { return (selectedClass.studentIds||[]).includes(s.id); });
      var present = records.filter(function(r){return r.status==="Present";}).length;
      var absent  = records.filter(function(r){return r.status==="Absent";}).length;
      var tardy   = records.filter(function(r){return r.status==="Tardy";}).length;

      document.getElementById("attendance-sheet").innerHTML =
        '<div class="stats-grid" style="margin-bottom:20px">'+
        SMS_UI.statCard({ label: "Total Roster", value: roster.length, icon: "fa-users", color: "blue" })+
        SMS_UI.statCard({ label: "Marked", value: records.length, icon: "fa-clipboard-check", color: "teal" })+
        SMS_UI.statCard({ label: "Present", value: present, icon: "fa-circle-check", color: "green" })+
        SMS_UI.statCard({ label: "Absent", value: absent, icon: "fa-circle-xmark", color: "red" })+
        '</div>'+
        '<div class="card"><div class="card-header"><div><div class="card-title">'+SMS_UI.esc(selectedClass.name)+'</div><div class="card-subtitle">'+selectedDate+' · '+records.length+' of '+roster.length+' marked</div></div></div><div class="card-body">'+
        (roster.length
          ? '<div style="display:flex;flex-direction:column;gap:8px">'+
            roster.map(function(s) {
              var rec = records.find(function(r){return r.studentId===s.id;});
              var cur = rec ? rec.status : null;
              return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--gray-50);border-radius:10px;flex-wrap:wrap;gap:8px">'+
                '<div style="display:flex;align-items:center;gap:12px">'+SMS_UI.avatarHtml(s.fullName)+'<span class="fw-600">'+SMS_UI.esc(s.fullName)+'</span></div>'+
                '<div style="display:flex;gap:6px">'+
                ['Present','Tardy','Absent','Excused'].map(function(st) {
                  var colors = {Present:'var(--color-success)',Tardy:'var(--color-warning)',Absent:'var(--color-danger)',Excused:'var(--color-info)'};
                  var active = cur === st;
                  return '<button class="btn btn-sm att-btn '+st.toLowerCase()+(active?' active':'').toLowerCase()+'" data-student="'+s.id+'" data-status="'+st+'" style="'+(active?'background:'+colors[st]+';color:#fff;border-color:'+colors[st]:'')+'" title="'+st+'">'+st+'</button>';
                }).join("")+'</div></div>';
            }).join("")+'</div>'
          : SMS_UI.emptyState({ icon: "fa-users", title: "No students enrolled in this class" }))+'</div></div>';

      document.querySelectorAll("[data-student][data-status]").forEach(function(btn) {
        btn.addEventListener("click", function() {
          var studentId = btn.getAttribute("data-student");
          var status    = btn.getAttribute("data-status");
          SMS_API.markAttendance({ studentId: studentId, classId: selectedClass.id, date: selectedDate, status: status, branchId: branchId, markedBy: SMS_AUTH.getCurrentUser().id }).then(function() { renderSheet(); });
        });
      });
    });
  }
})();
