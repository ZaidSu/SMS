SMS_ADMIN_LAYOUT.init("dashboard");
(function() {
  var branchId = SMS_AUTH.getBranchId();
  Promise.all([
    SMS_API.getStudents(branchId), SMS_API.getTeachers(branchId),
    SMS_API.getClasses(branchId),  SMS_API.getExpenses(branchId),
    SMS_API.getEvents(branchId),   SMS_API.getAnnouncements(branchId),
    SMS_API.getAuditLog(branchId)
  ]).then(function(res) {
    var students=res[0], teachers=res[1], classes=res[2], expenses=res[3];
    var events=res[4], announcements=res[5], auditLog=res[6];
    var activeStudents = students.filter(function(s){return s.status==="Active";}).length;
    var outstanding    = expenses.reduce(function(s,e){return s+e.balance;},0);
    var unassigned     = classes.filter(function(c){return !c.teacherId;}).length;
    var upcoming = events.filter(function(e){return new Date(e.startDate)>new Date();})
                         .sort(function(a,b){return new Date(a.startDate)-new Date(b.startDate);}).slice(0,3);

    var html = [
      SMS_UI.pageHeader({title:"Dashboard",subtitle:"School overview for this branch",breadcrumb:["Administration","Dashboard"]}),
      '<div class="stats-grid" data-aos="fade-up">',
      SMS_UI.statCard({label:"Active Students",value:activeStudents,icon:"fa-user-graduate",color:"blue"}),
      SMS_UI.statCard({label:"Teaching Staff",value:teachers.length,icon:"fa-chalkboard-teacher",color:"teal"}),
      SMS_UI.statCard({label:"Active Classes",value:classes.length,icon:"fa-book-open",color:"green"}),
      SMS_UI.statCard({label:"Outstanding Balance",value:SMS_UI.fmtMoney(outstanding),icon:"fa-dollar-sign",color:outstanding>0?"yellow":"green"}),
      '</div>',
      '<div class="grid-2" style="gap:20px;margin-bottom:20px">',

      // Attention card
      '<div class="card" data-aos="fade-up" data-aos-delay="50"><div class="card-header"><div class="card-title">Attention Required</div></div><div class="card-body" style="display:flex;flex-direction:column;gap:10px">',
      unassigned>0
        ? '<div style="display:flex;align-items:center;gap:12px;padding:12px;background:#fffbeb;border-radius:10px;border:1px solid #fde68a"><i class="fa-solid fa-triangle-exclamation" style="color:#b45309"></i><div><div style="font-weight:600;font-size:.875rem">'+unassigned+' unassigned class'+(unassigned>1?"es":"")+'</div><div style="font-size:.75rem;color:var(--text-secondary)">Assign a teacher in Classes</div></div><a href="./classes.html" class="btn btn-sm btn-secondary" style="margin-left:auto">Fix</a></div>'
        : '<div style="display:flex;align-items:center;gap:12px;padding:12px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0"><i class="fa-solid fa-circle-check" style="color:#15803d"></i><div style="font-weight:600;font-size:.875rem;color:#15803d">All classes have teachers assigned</div></div>',
      outstanding>0
        ? '<div style="display:flex;align-items:center;gap:12px;padding:12px;background:#fef2f2;border-radius:10px;border:1px solid #fecaca"><i class="fa-solid fa-circle-dollar-to-slot" style="color:#b91c1c"></i><div><div style="font-weight:600;font-size:.875rem">Outstanding: '+SMS_UI.fmtMoney(outstanding)+'</div></div><a href="./payments.html" class="btn btn-sm btn-secondary" style="margin-left:auto">View</a></div>'
        : "",
      '</div></div>',

      // Upcoming events
      '<div class="card" data-aos="fade-up" data-aos-delay="100"><div class="card-header"><div class="card-title">Upcoming Events</div><a href="./events.html" class="btn btn-sm btn-ghost">View All</a></div><div class="card-body" style="display:flex;flex-direction:column;gap:10px">',
      upcoming.length
        ? upcoming.map(function(ev){var d=new Date(ev.startDate);return '<div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--gray-50);border-radius:8px"><div style="width:44px;height:44px;background:var(--color-primary-light);color:var(--color-primary);border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0"><span style="font-size:.55rem;font-weight:700;text-transform:uppercase">'+d.toLocaleString("default",{month:"short"})+'</span><span style="font-size:1rem;font-weight:800;line-height:1">'+d.getDate()+'</span></div><div><div style="font-weight:600;font-size:.875rem">'+SMS_UI.esc(ev.title)+'</div><div style="font-size:.75rem;color:var(--text-secondary)">'+SMS_UI.esc(ev.type)+(ev.location?" · "+ev.location:"")+'</div></div></div>';}).join("")
        : SMS_UI.emptyState({icon:"fa-calendar",title:"No upcoming events"}),
      '</div></div></div>',

      // Recent rows
      '<div class="grid-2" style="gap:20px;margin-bottom:20px">',
      '<div class="card" data-aos="fade-up" data-aos-delay="150"><div class="card-header"><div class="card-title">Recent Announcements</div><a href="./announcements.html" class="btn btn-sm btn-ghost">View All</a></div><div class="card-body" style="display:flex;flex-direction:column;gap:10px">',
      announcements.slice(0,3).map(function(a){return '<div style="padding:12px;background:var(--gray-50);border-radius:8px"><div style="font-weight:600;font-size:.875rem;margin-bottom:2px">'+SMS_UI.esc(a.title)+'</div><div style="font-size:.75rem;color:var(--text-secondary)">'+SMS_UI.esc(a.authorName)+" · "+SMS_UI.fmtDate(a.date)+'</div></div>';}).join("")
      || SMS_UI.emptyState({icon:"fa-bullhorn",title:"No announcements yet"}),
      '</div></div>',
      '<div class="card" data-aos="fade-up" data-aos-delay="200"><div class="card-header"><div class="card-title">Recent Activity</div><a href="./audit-logs.html" class="btn btn-sm btn-ghost">View All</a></div><div class="card-body" style="display:flex;flex-direction:column;gap:8px">',
      auditLog.slice(0,5).map(function(l){return '<div style="display:flex;align-items:flex-start;gap:10px;font-size:.8125rem"><div style="width:8px;height:8px;border-radius:50%;background:var(--color-primary);flex-shrink:0;margin-top:5px"></div><div style="flex:1;min-width:0"><div class="truncate">'+SMS_UI.esc(l.details)+'</div><div style="font-size:.72rem;color:var(--text-muted)">'+SMS_UI.esc(l.userName)+" · "+SMS_UI.fmtDateTime(l.timestamp)+'</div></div></div>';}).join("")
      || SMS_UI.emptyState({icon:"fa-clock-rotate-left",title:"No activity yet"}),
      '</div></div></div>',

      '<div class="card" data-aos="fade-up" data-aos-delay="250"><div class="card-header"><div class="card-title">Quick Actions</div></div><div class="card-body"><div style="display:flex;gap:12px;flex-wrap:wrap">',
      '<a href="./students.html" class="btn btn-secondary"><i class="fa-solid fa-user-plus"></i>Add Student</a>',
      '<a href="./teachers.html" class="btn btn-secondary"><i class="fa-solid fa-chalkboard-teacher"></i>Teachers</a>',
      '<a href="./classes.html" class="btn btn-secondary"><i class="fa-solid fa-book-open"></i>Classes</a>',
      '<a href="./attendance.html" class="btn btn-secondary"><i class="fa-solid fa-clipboard-check"></i>Attendance</a>',
      '<a href="./communications.html" class="btn btn-secondary"><i class="fa-solid fa-envelope"></i>Communications</a>',
      '<a href="./payments.html" class="btn btn-secondary"><i class="fa-solid fa-dollar-sign"></i>Payments</a>',
      '</div></div></div>'
    ].join("");
    SMS_UI.render("page-content", html);
  });
})();
