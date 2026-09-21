if (SMS_TEACHER_LAYOUT.init("announcements")) {
(function() {
  var branchId = SMS_AUTH.getBranchId();
  SMS_API.getAnnouncements(branchId).then(function(announcements) {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"Announcements",subtitle:"School-wide and class announcements",breadcrumb:["Teacher","Announcements"]})+
      '<div style="display:flex;flex-direction:column;gap:12px">'+
      (announcements.length ? announcements.map(function(a){
        return '<div class="card"><div class="card-body"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'+SMS_UI.badge(a.audience||"All","primary")+(a.priority==="high"?SMS_UI.badge("High Priority","danger"):'')+'</div>'+
          '<div class="fw-700" style="font-size:1rem;margin-bottom:4px">'+SMS_UI.esc(a.title)+'</div>'+
          '<div class="text-secondary fs-sm">'+SMS_UI.esc(a.body)+'</div>'+
          '<div class="fs-xs text-muted" style="margin-top:8px">'+SMS_UI.esc(a.authorName)+' · '+SMS_UI.fmtDate(a.date)+'</div>'+
          '</div></div>';
      }).join("") : '<div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-bullhorn",title:"No announcements"})+'</div></div>')+
      '</div>';
  });
})();
}
