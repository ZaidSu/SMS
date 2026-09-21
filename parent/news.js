SMS_PARENT_LAYOUT.init("news");
(function() {
  var child = SMS_PARENT_LAYOUT.getSelectedChild();
  SMS_API.getAnnouncements(child?child.branchId:null).then(function(announcements) {
    document.getElementById("page-content").innerHTML =
      SMS_UI.pageHeader({title:"News & Announcements",subtitle:"School-wide news and important notices",breadcrumb:["Parent Portal","News"]})+
      '<div style="display:flex;flex-direction:column;gap:12px">'+
      (announcements.length ? announcements.map(function(a){
        return '<div class="card"><div class="card-body">'+
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+SMS_UI.badge(a.priority==="high"?"Important":"Announcement",a.priority==="high"?"danger":"primary")+'<span class="fs-xs text-muted">'+SMS_UI.fmtDate(a.date)+'</span></div>'+
          '<div class="fw-700" style="font-size:1rem;margin-bottom:6px">'+SMS_UI.esc(a.title)+'</div>'+
          '<div class="text-secondary">'+SMS_UI.esc(a.body)+'</div>'+
          '<div class="fs-xs text-muted" style="margin-top:8px">Posted by: '+SMS_UI.esc(a.authorName)+'</div>'+
          '</div></div>';
      }).join("") : '<div class="card"><div class="card-body">'+SMS_UI.emptyState({icon:"fa-newspaper",title:"No announcements yet"})+'</div></div>')+
      '</div>';
  });
})();
