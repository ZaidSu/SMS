SMS_STUDENT_LAYOUT.init("classes");
(function() {
  var child = SMS_STUDENT_LAYOUT.getSelectedChild();
  if (!child) { document.getElementById("page-content").innerHTML='<div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-child",title:"No child selected"})+'</div></div>'; return; }
  SMS_API.getClasses(child.branchId).then(function(allClasses) {
    var myClasses = allClasses.filter(function(c){return (c.studentIds||[]).includes(child.id);});
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Classes",subtitle:SMS_UI.esc(child.fullName)+"'s enrolled classes and schedule",breadcrumb:["Student Portal","Classes"]})+
      (myClasses.length ? '<div style="display:flex;flex-direction:column;gap:12px">'+myClasses.map(function(c){
        return '<div class="card"><div class="card-body"><div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">'+
          '<div><div class="fw-700" style="font-size:1rem">'+SMS_UI.esc(c.name)+'</div>'+
          '<div class="text-secondary fs-sm">'+SMS_UI.esc(c.subject)+'</div>'+
          '<div style="margin-top:8px;display:flex;flex-direction:column;gap:4px">'+
          '<div class="flex items-center gap-3"><i class="fa-solid fa-chalkboard-teacher text-muted" style="width:16px"></i><span class="fs-sm">'+SMS_UI.esc(c.teacherName||"Unassigned")+'</span></div>'+
          '<div class="flex items-center gap-3"><i class="fa-solid fa-clock text-muted" style="width:16px"></i><span class="fs-sm">'+SMS_UI.esc(c.schedule||"—")+'</span></div>'+
          '<div class="flex items-center gap-3"><i class="fa-solid fa-location-dot text-muted" style="width:16px"></i><span class="fs-sm">Room '+SMS_UI.esc(c.room||"—")+'</span></div>'+
          '</div></div>'+SMS_UI.badge(c.grade,"primary")+'</div></div></div>';
      }).join("") : '<div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-book-open",title:"No classes enrolled"})+'</div></div>');
  });
})();
