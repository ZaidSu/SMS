if (SMS_TEACHER_LAYOUT.init("schedule")) {
(function() {
  var myClasses = SMS_TEACHER_LAYOUT.getMyClasses();
  var days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
  document.getElementById("page-content").innerHTML =
    SMS_UI.pageHeader({title:"My Schedule",subtitle:"Your weekly class schedule",breadcrumb:["Teacher","Schedule"]})+
    '<div class="card"><div class="card-header"><div class="card-title">Weekly Schedule — 2026-2027</div></div><div class="card-body">'+
    (myClasses.length ? '<div class="grid-3" style="gap:12px">'+days.map(function(day){
      var dayClasses = myClasses.filter(function(c){return c.schedule&&c.schedule.includes(day.slice(0,3));});
      return '<div style="background:var(--gray-50);border-radius:10px;padding:12px"><div class="fw-700 fs-sm" style="margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--border-color)">'+day+'</div>'+
        (dayClasses.length ? dayClasses.map(function(c){return '<div style="padding:8px;background:var(--color-primary-light);border-radius:8px;margin-bottom:6px"><div class="fw-600 fs-sm" style="color:var(--color-primary)">'+SMS_UI.esc(c.name)+'</div><div class="fs-xs text-secondary">'+SMS_UI.esc(c.room||"")+' · '+SMS_UI.esc(c.schedule||"")+'</div></div>';}).join("") : '<p class="text-muted fs-xs">No classes</p>')+
        '</div>';
    }).join("")+'</div>' : SMS_UI.emptyState({icon:"fa-calendar",title:"No classes assigned yet"}))+
    '</div></div>';
})();
}
