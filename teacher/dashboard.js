if (SMS_TEACHER_LAYOUT.init("dashboard")) {
(function() {
  var teacher = SMS_TEACHER_LAYOUT.getMyTeacher();
  var myClasses = SMS_TEACHER_LAYOUT.getMyClasses();
  if (!teacher) { document.getElementById("page-content").innerHTML = '<div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-chalkboard-teacher",title:"No teacher profile found",message:"Contact your administrator to link your account to a teacher profile."})+'</div></div>'; return; }
  var branchId = SMS_AUTH.getBranchId();
  var canAttendanceView = SMS_AUTH.hasTeacherPermission("attendance.view");
  var canAttendanceManage = SMS_AUTH.hasTeacherPermission("attendance.manage");
  var canAssignmentsView = SMS_AUTH.hasTeacherPermission("assignments.view");
  var canAnnouncements = SMS_AUTH.hasTeacherPermission("announcements.view");
  Promise.all([SMS_API.getStudents(branchId),SMS_API.getAttendance({date:new Date().toISOString().slice(0,10)}),SMS_API.getAssignments(),SMS_API.getAnnouncements(branchId)]).then(function(res){
    var allStudents = res[0];
    var todayAtt = res[1];
    var allAssignments = res[2];
    var announcements = res[3];
    var myStudentIds = new Set(myClasses.reduce(function(ids,c){return ids.concat(c.studentIds||[]);},[]) );
    var totalStudents = myStudentIds.size;
    var myAssignmentIds = new Set(myClasses.map(function(c){return c.id;}));
    var myAssignments = allAssignments.filter(function(a){return myAssignmentIds.has(a.classId);});
    var classesAttMarked = myClasses.filter(function(c){ return todayAtt.some(function(a){return a.classId===c.id;}); }).length;

    document.getElementById("page-content").innerHTML = [
      SMS_UI.pageHeader({title:"Welcome back, "+teacher.firstName+"!",subtitle:"Here's your overview for today — "+new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),breadcrumb:["Teacher","Dashboard"]}),
      '<div class="stats-grid">',
      SMS_UI.statCard({label:"My Classes",value:myClasses.length,icon:"fa-book-open",color:"blue"}),
      SMS_UI.statCard({label:"My Students",value:totalStudents,icon:"fa-user-graduate",color:"teal"}),
      SMS_UI.statCard({label:"Attendance Today",value:canAttendanceView?(classesAttMarked+"/"+myClasses.length):"Restricted",icon:"fa-clipboard-check",color:classesAttMarked===myClasses.length?"green":"yellow"}),
      SMS_UI.statCard({label:"Active Assignments",value:canAssignmentsView?myAssignments.length:"Restricted",icon:"fa-tasks",color:"blue"}),
      '</div>',
      '<div class="grid-2" style="gap:20px;margin-bottom:20px">',
      '<div class="card"><div class="card-header"><div class="card-title">My Classes Today</div><a href="./classes.html" class="btn btn-sm btn-ghost">View All</a></div><div class="card-body" style="display:flex;flex-direction:column;gap:8px">',
      myClasses.length ? myClasses.map(function(c){
        var hasAtt = todayAtt.some(function(a){return a.classId===c.id;});
        return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--gray-50);border-radius:10px">'+
          '<div><div class="fw-600">'+SMS_UI.esc(c.name)+'</div><div class="fs-xs text-secondary">'+SMS_UI.esc(c.schedule||"")+'</div></div>'+
          (canAttendanceView ? (hasAtt ? SMS_UI.badge("Attendance marked","success") : (canAttendanceManage?'<a href="./attendance.html" class="btn btn-sm btn-primary"><i class="fa-solid fa-clipboard-check"></i>Mark Attendance</a>':'<a href="./attendance.html" class="btn btn-sm btn-secondary">View Attendance</a>')) : '')+'</div>';
      }).join("") : SMS_UI.emptyState({icon:"fa-book-open",title:"No classes assigned"}),
      '</div></div>',
      '<div class="card"><div class="card-header"><div class="card-title">Announcements</div></div><div class="card-body" style="display:flex;flex-direction:column;gap:8px">',
      canAnnouncements && announcements.length ? announcements.slice(0,4).map(function(a){ return '<div style="padding:10px;background:var(--gray-50);border-radius:8px"><div class="fw-600 fs-sm">'+SMS_UI.esc(a.title)+'</div><div class="fs-xs text-secondary">'+SMS_UI.fmtDate(a.date)+'</div></div>'; }).join("") : SMS_UI.emptyState({icon:"fa-bullhorn",title:canAnnouncements?"No announcements":"Announcements restricted"}),
      '</div></div>',
      '</div>'
    ].join("");
  });
})();
}
