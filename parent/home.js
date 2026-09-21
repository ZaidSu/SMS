SMS_PARENT_LAYOUT.init("home");
(function() {
  var child = SMS_PARENT_LAYOUT.getSelectedChild();
  if (!child) { document.getElementById("page-content").innerHTML='<div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-child",title:"No children found",message:"Contact your school administrator to link your account."})+'</div></div>'; return; }
  Promise.all([SMS_API.getClasses(child.branchId),SMS_API.getClassAverages(child.id),SMS_API.getAttendance({studentId:child.id}),SMS_API.getExpenses(child.branchId),SMS_API.getAnnouncements(child.branchId),SMS_API.getEvents(child.branchId)]).then(function(res){
    var allClasses=res[0]; var averages=res[1]; var attendance=res[2]; var allExpenses=res[3]; var announcements=res[4]; var events=res[5];
    var myClasses=allClasses.filter(function(c){return (c.studentIds||[]).includes(child.id);});
    var myExpenses=allExpenses.filter(function(e){return e.studentId===child.id;});
    var balance=myExpenses.reduce(function(s,e){return s+e.balance;},0);
    var present=attendance.filter(function(a){return a.status==="Present";}).length;
    var attRate=attendance.length>0?Math.round(100*present/attendance.length):100;
    var overallGpa=averages.length?(averages.reduce(function(s,a){return s+a.average;},0)/averages.length).toFixed(1):null;
    var upcoming=events.filter(function(e){return new Date(e.startDate)>new Date();}).slice(0,3);
    document.getElementById("page-content").innerHTML=[
      '<div style="display:flex;align-items:center;gap:20px;margin-bottom:24px;padding:20px;background:var(--color-primary);border-radius:16px;color:#fff">',
      SMS_UI.avatarHtml(child.fullName,"xl"),
      '<div><div style="font-size:1.5rem;font-weight:800">'+SMS_UI.esc(child.fullName)+'</div>',
      '<div style="opacity:.85">'+SMS_UI.esc(child.grade)+' · '+SMS_UI.esc(child.status)+'</div></div></div>',
      '<div class="stats-grid">',
      SMS_UI.statCard({label:"Overall Average",value:overallGpa?overallGpa+"%":"—",icon:"fa-chart-line",color:"blue"}),
      SMS_UI.statCard({label:"Attendance Rate",value:attRate+"%",icon:"fa-clipboard-check",color:attRate>=90?"green":attRate>=75?"yellow":"red"}),
      SMS_UI.statCard({label:"Classes Enrolled",value:myClasses.length,icon:"fa-book-open",color:"teal"}),
      SMS_UI.statCard({label:"Account Balance",value:SMS_UI.fmtMoney(balance),icon:"fa-dollar-sign",color:balance>0?"yellow":"green"}),
      '</div>',
      '<div class="grid-2" style="gap:20px;margin-bottom:20px">',
      '<div class="card"><div class="card-header"><div class="card-title">Current Grades</div><a href="./grades.html" class="btn btn-sm btn-ghost">View All</a></div><div class="card-body" style="display:flex;flex-direction:column;gap:8px">',
      averages.length ? averages.map(function(a){var c=allClasses.find(function(x){return x.id===a.classId;});return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--gray-50);border-radius:8px"><span class="fw-600 fs-sm">'+SMS_UI.esc(c?c.name:a.classId)+'</span><span class="fw-700 '+SMS_UI.gradeClass(a.letterGrade)+'">'+a.average+'% ('+a.letterGrade+')</span></div>';}).join("") : SMS_UI.emptyState({icon:"fa-file-lines",title:"No grades yet"}),
      '</div></div>',
      '<div class="card"><div class="card-header"><div class="card-title">Upcoming Events</div><a href="./events.html" class="btn btn-sm btn-ghost">View All</a></div><div class="card-body" style="display:flex;flex-direction:column;gap:8px">',
      upcoming.length ? upcoming.map(function(ev){var d=new Date(ev.startDate);return '<div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--gray-50);border-radius:8px"><div style="width:40px;height:40px;background:var(--color-primary-light);border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-size:.5rem;font-weight:700;text-transform:uppercase;color:var(--color-primary)">'+d.toLocaleString("default",{month:"short"})+'</span><span style="font-size:1rem;font-weight:800;color:var(--color-primary);line-height:1">'+d.getDate()+'</span></div><div><div class="fw-600 fs-sm">'+SMS_UI.esc(ev.title)+'</div><div class="fs-xs text-secondary">'+SMS_UI.esc(ev.type)+'</div></div></div>';}).join("") : SMS_UI.emptyState({icon:"fa-calendar",title:"No upcoming events"}),
      '</div></div>',
      '</div>',
      '<div class="card"><div class="card-header"><div class="card-title">Latest Announcements</div></div><div class="card-body" style="display:flex;flex-direction:column;gap:8px">',
      announcements.slice(0,3).map(function(a){return '<div style="padding:12px;background:var(--gray-50);border-radius:8px"><div class="fw-600 fs-sm">'+SMS_UI.esc(a.title)+'</div><div class="text-secondary fs-sm">'+SMS_UI.esc(a.body)+'</div><div class="fs-xs text-muted" style="margin-top:4px">'+SMS_UI.fmtDate(a.date)+'</div></div>';}).join("")||(SMS_UI.emptyState({icon:"fa-bullhorn",title:"No announcements"})),
      '</div></div>'
    ].join("");
  });
})();
